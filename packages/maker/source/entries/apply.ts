import { currentDirectory, namespaceRootPath } from "source/common/constants";
import { Locale, checkLocale } from "source/common/data/locales";
import { getAllItems } from "source/utilities/get-all-items";
import { PathHelper } from "source/utilities/path-utils";
import { UserError } from "source/utilities/user-error";
import type { ApplyResult, CollectOutput } from "source/common/types";
import * as fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import JSON5 from "json5";

export interface ApplyOptions
{
    dryRun?: boolean;
}

interface FileMapping
{
    filePath: string;
    fileType: "json" | "txt" | "md";
}

export default function Apply(inputFile: string, options: ApplyOptions = {}): ApplyResult
{
    const { dryRun = false } = options;

    // Resolve input file path
    const resolvedPath = path.isAbsolute(inputFile)
        ? inputFile
        : PathHelper.resolve(inputFile);

    if (!fs.existsSync(resolvedPath))
    {
        throw new UserError(`Input file '${inputFile}' does not exist.`);
    }

    console.log(chalk.bold(`○ ${dryRun ? "Previewing" : "Applying"} translations from '${path.basename(inputFile)}'...`));

    // Read and parse input file
    let collectOutput: CollectOutput;
    try
    {
        const content = fs.readFileSync(resolvedPath, "utf-8");
        collectOutput = JSON5.parse(content);
    }
    catch (e)
    {
        throw new UserError(`Failed to parse input file: ${e}`);
    }

    // Validate structure
    if (!collectOutput.$metadata)
    {
        throw new UserError("Invalid collect file format: missing $metadata.");
    }

    if (collectOutput.$metadata.version !== "1.0")
    {
        console.log(chalk.yellow(`  Warning: File version '${collectOutput.$metadata.version}' may not be fully compatible.`));
    }

    const locale = checkLocale(collectOutput.$metadata.locale);
    const namespace = collectOutput.$metadata.namespace;
    const subpath = collectOutput.$metadata.subpath;

    // Build search path and scan for files
    const searchPath = subpath
        ? PathHelper.join(namespaceRootPath, namespace, subpath)
        : PathHelper.join(namespaceRootPath, namespace);

    if (!fs.existsSync(searchPath))
    {
        throw new UserError(`Namespace path '${namespace}${subpath ? "/" + subpath : ""}' does not exist.`);
    }

    // Build key -> file mapping by scanning the namespace
    const keyToFile = buildKeyMapping(searchPath, locale);

    const result: ApplyResult = {
        updated: [],
        created: [],
        skipped: [],
        errors: []
    };

    // Get all translation entries (exclude $metadata)
    const entries = Object.entries(collectOutput).filter(([key]) => key !== "$metadata") as [string, string][];
    let processed = 0;

    for (const [key, value] of entries)
    {
        processed++;
        const progress = `(${processed.toString().padStart(entries.length.toString().length, "0")}/${entries.length})`;

        const mapping = keyToFile.get(key);

        if (!mapping)
        {
            console.log(chalk.yellow(`! `) + chalk.gray(progress) + ` Skipped (key not found): ${chalk.bold(key)}`);
            result.skipped.push(key);
            continue;
        }

        try
        {
            const applyResult = applyEntry(mapping, key, locale, value, dryRun);

            switch (applyResult)
            {
                case "updated":
                    result.updated.push(key);
                    if (!dryRun)
                    {
                        console.log(chalk.gray("│ ") + chalk.greenBright("√ ") + chalk.gray(progress) + " Updated: " + chalk.bold(key));
                    }
                    break;
                case "created":
                    result.created.push(key);
                    if (!dryRun)
                    {
                        console.log(chalk.gray("│ ") + chalk.cyanBright("+ ") + chalk.gray(progress) + " Created: " + chalk.bold(key));
                    }
                    break;
                case "skipped":
                    result.skipped.push(key);
                    break;
            }
        }
        catch (e)
        {
            const errorMsg = e instanceof Error ? e.message : String(e);
            result.errors.push({ key, error: errorMsg });
            console.log(chalk.gray("│ ") + chalk.redBright("× ") + chalk.gray(progress) + " Error: " + chalk.bold(key) + " - " + errorMsg);
        }
    }

    // Report summary
    const leftLineEnd = chalk.gray("└─");
    if (dryRun)
    {
        console.log(leftLineEnd + chalk.blueBright("○ ") + "Dry run complete:");
    }
    else
    {
        console.log(leftLineEnd + chalk.greenBright("√ ") + "Apply complete:");
    }

    console.log("   " + chalk.green(`Updated: ${result.updated.length}`) +
        " | " + chalk.cyan(`Created: ${result.created.length}`) +
        " | " + chalk.gray(`Skipped: ${result.skipped.length}`) +
        (result.errors.length > 0 ? " | " + chalk.red(`Errors: ${result.errors.length}`) : ""));

    return result;
}

function buildKeyMapping(searchPath: string, locale: Locale): Map<string, FileMapping>
{
    const mapping = new Map<string, FileMapping>();
    const allItems = getAllItems(searchPath);

    for (const item of allItems)
    {
        const filePath = PathHelper.join(searchPath, item);
        const ext = path.extname(item).toLowerCase();

        if ([".json", ".json5"].includes(ext))
        {
            const basename = path.basename(item, ext);
            const key = path.join(path.dirname(item), basename).replace(/\\/g, "/").replaceAll("/", ".");

            mapping.set(key, {
                filePath,
                fileType: "json"
            });
        }
        else if ([".txt", ".md"].includes(ext))
        {
            const basename = path.basename(item);
            const parts = basename.split(".");

            if (parts.length >= 3)
            {
                const fileLocale = parts[parts.length - 2];
                const keyBasename = parts.slice(0, -2).join(".");
                const key = path.join(path.dirname(item), keyBasename).replace(/\\/g, "/").replaceAll("/", ".");

                // For txt/md, we map from en-US files (as base) or target locale files
                if (fileLocale.toLowerCase() === "en-us" || fileLocale.toLowerCase() === locale.toLowerCase())
                {
                    // Store the target locale file path
                    const targetFileName = `${keyBasename}.${locale.toLowerCase()}${ext}`;
                    const targetFilePath = PathHelper.join(path.dirname(filePath), targetFileName);

                    if (!mapping.has(key))
                    {
                        mapping.set(key, {
                            filePath: targetFilePath,
                            fileType: ext === ".md" ? "md" : "txt"
                        });
                    }
                }
            }
        }
    }

    return mapping;
}

function applyEntry(
    mapping: FileMapping,
    key: string,
    locale: Locale,
    value: string,
    dryRun: boolean
): "updated" | "created" | "skipped"
{
    // Strip fallback marker
    let newValue = value;
    if (newValue.startsWith("[EN] "))
    {
        newValue = newValue.substring(5);
    }

    if (mapping.fileType === "json")
    {
        return applyJsonEntry(mapping.filePath, locale, newValue, dryRun);
    }
    else
    {
        return applyTextEntry(mapping.filePath, newValue, dryRun);
    }
}

function applyJsonEntry(
    filePath: string,
    locale: Locale,
    newValue: string,
    dryRun: boolean
): "updated" | "skipped"
{
    if (!fs.existsSync(filePath))
    {
        throw new Error("Source file not found");
    }

    const originalContent = fs.readFileSync(filePath, "utf-8");
    const originalData = JSON5.parse(originalContent);

    // Parse newValue if it looks like JSON (for complex values)
    let parsedValue: unknown = newValue;
    if ((newValue.startsWith("{") && newValue.endsWith("}")) ||
        (newValue.startsWith("[") && newValue.endsWith("]")))
    {
        try
        {
            parsedValue = JSON.parse(newValue);
        }
        catch
        {
            // Keep as string if parsing fails
        }
    }

    // Check if value is unchanged
    const currentValue = originalData[locale];
    if (JSON.stringify(currentValue) === JSON.stringify(parsedValue))
    {
        return "skipped";
    }

    if (dryRun)
    {
        return "updated";
    }

    // Text-based modification to preserve formatting
    const modifiedContent = modifyJsonText(originalContent, locale, parsedValue);

    // Validate the result
    let validatedData: Record<string, unknown>;
    try
    {
        validatedData = JSON5.parse(modifiedContent);
    }
    catch (e)
    {
        throw new Error(`Failed to produce valid JSON: ${e}`);
    }

    // Verify the value was correctly set
    if (JSON.stringify(validatedData[locale]) !== JSON.stringify(parsedValue))
    {
        throw new Error("Validation failed: written value doesn't match expected value");
    }

    fs.writeFileSync(filePath, modifiedContent);
    return "updated";
}

function modifyJsonText(content: string, locale: string, value: unknown): string
{
    const valueStr = typeof value === "string"
        ? JSON.stringify(value)
        : JSON.stringify(value);

    // Pattern to find existing locale key (handles both " and ' quotes)
    // Matches: "locale": value  or  'locale': value
    const localePattern = new RegExp(
        `(["'])${escapeRegex(locale)}\\1\\s*:\\s*` +
        `(?:` +
        `"(?:[^"\\\\]|\\\\.)*"` +  // double-quoted string
        `|'(?:[^'\\\\]|\\\\.)*'` +  // single-quoted string
        `|\\{[^{}]*\\}` +           // simple object (non-nested)
        `|\\[[^\\[\\]]*\\]` +       // simple array (non-nested)
        `|[^,}\\]]+` +              // other values (numbers, booleans, null)
        `)`,
        'g'
    );

    // Check if locale already exists
    if (localePattern.test(content))
    {
        // Reset lastIndex after test
        localePattern.lastIndex = 0;
        // Replace existing value
        return content.replace(localePattern, `"${locale}": ${valueStr}`);
    }
    else
    {
        // Insert new locale - find the last closing brace
        const lastBraceIndex = content.lastIndexOf('}');
        if (lastBraceIndex === -1)
        {
            throw new Error("Invalid JSON structure: no closing brace found");
        }

        // Find what's before the closing brace to determine if we need a comma
        const beforeBrace = content.substring(0, lastBraceIndex);
        const trimmedBefore = beforeBrace.trimEnd();

        // Detect indentation from the file
        const indentMatch = content.match(/\n([ \t]+)["']/);
        const indent = indentMatch ? indentMatch[1] : "    ";

        // Check if file uses trailing commas (JSON5 style)
        const hasTrailingComma = trimmedBefore.endsWith(',');

        if (trimmedBefore.endsWith('{'))
        {
            // Empty object, no comma needed
            return trimmedBefore + `\n${indent}"${locale}": ${valueStr}\n}`;
        }
        else if (hasTrailingComma)
        {
            // File uses trailing commas - preserve the style
            return trimmedBefore + `\n${indent}"${locale}": ${valueStr},\n}`;
        }
        else
        {
            // No trailing comma style - add comma before new entry only
            return trimmedBefore + `,\n${indent}"${locale}": ${valueStr}\n}`;
        }
    }
}

function escapeRegex(str: string): string
{
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyTextEntry(
    filePath: string,
    newValue: string,
    dryRun: boolean
): "updated" | "created" | "skipped"
{
    const exists = fs.existsSync(filePath);

    if (exists)
    {
        const currentContent = fs.readFileSync(filePath, "utf-8");
        if (currentContent === newValue)
        {
            return "skipped";
        }
    }

    if (!dryRun)
    {
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir))
        {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, newValue);
    }

    return exists ? "updated" : "created";
}
