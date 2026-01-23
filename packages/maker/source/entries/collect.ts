import { collectRootPath, currentDirectory, namespaceRootPath } from "source/common/constants";
import { Locale, checkLocale } from "source/common/data/locales";
import { getAllItems, readItemData } from "source/utilities/get-all-items";
import { PathHelper } from "source/utilities/path-utils";
import { UserError } from "source/utilities/user-error";
import type { CollectMetadata, CollectOutput } from "source/common/types";
import * as fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import JSON5 from "json5";

export interface CollectOptions
{
    useFallback?: boolean;
    customOutput?: string;
}

export default function Collect(
    locale: Locale,
    targetPath: string,
    options: CollectOptions = {}
): string
{
    const { useFallback = false, customOutput } = options;

    // Normalize path separators
    const normalizedPath = targetPath.replace(/\\/g, "/");

    // Extract namespace (first segment) and subpath (rest)
    const pathParts = normalizedPath.split("/").filter(p => p.length > 0);
    const namespace = pathParts[0];
    const subpath = pathParts.length > 1 ? pathParts.slice(1).join("/") : undefined;

    // Build search path
    const searchPath = PathHelper.join(namespaceRootPath, normalizedPath);

    // Validate path exists
    if (!fs.existsSync(searchPath) || !fs.statSync(searchPath).isDirectory())
    {
        throw new UserError(`Path '${normalizedPath}' does not exist. Please check your spelling.`);
    }

    console.log(chalk.bold(`○ Collecting '${locale}' from '${normalizedPath}'...`));
    if (useFallback)
    {
        console.log(chalk.gray("  (Using en-US as fallback for missing translations)"));
    }

    const allItems = getAllItems(searchPath);

    // Build flat key-value output
    const output = {
        $metadata: {
            exportedAt: new Date().toISOString(),
            locale: locale,
            namespace: namespace,
            subpath: subpath || null,
            usedFallback: useFallback,
            version: "1.0"
        }
    } as CollectOutput;

    // Track processed keys to avoid duplicates
    const processedKeys = new Set<string>();

    let collected = 0;
    let fallbackCount = 0;
    let skipped = 0;

    for (const item of allItems)
    {
        const filePath = PathHelper.join(searchPath, item);
        const ext = path.extname(item).toLowerCase();

        if ([".json", ".json5"].includes(ext))
        {
            // JSON file: contains all locales in one file
            const result = processJsonFile(filePath, item, locale, useFallback);
            if (result)
            {
                if (!processedKeys.has(result.key))
                {
                    processedKeys.add(result.key);
                    output[result.key] = result.value;
                    collected++;
                    if (result.isFallback) fallbackCount++;
                }
            }
            else
            {
                skipped++;
            }
        }
        else if ([".txt", ".md"].includes(ext))
        {
            // TXT/MD file: one locale per file
            const result = processTextFile(filePath, item, locale, useFallback, searchPath);
            if (result)
            {
                if (!processedKeys.has(result.key))
                {
                    processedKeys.add(result.key);
                    output[result.key] = result.value;
                    collected++;
                    if (result.isFallback) fallbackCount++;
                }
            }
        }
    }

    // Determine output path
    const outputFileName = `${normalizedPath.replace(/\//g, "_")}_${locale.toLowerCase()}.json`;
    const outputPath = customOutput || PathHelper.join(collectRootPath, outputFileName);

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir))
    {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write output file
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 4));

    // Report results
    const leftLineEnd = chalk.gray("└─");
    console.log(leftLineEnd + chalk.greenBright("√ ") + `Collected ${collected} items` +
        (fallbackCount > 0 ? chalk.yellow(` (${fallbackCount} using fallback)`) : "") +
        (skipped > 0 ? chalk.gray(` (${skipped} skipped)`) : ""));
    console.log("   " + chalk.cyan.underline(outputPath));

    return outputPath;
}

function processJsonFile(
    filePath: string,
    item: string,
    locale: Locale,
    useFallback: boolean
): { key: string; value: string; isFallback: boolean } | null
{
    try
    {
        const content = fs.readFileSync(filePath, "utf-8");
        const dataObject = JSON5.parse(content);
        const ext = path.extname(item);
        const basename = path.basename(item, ext);

        // Generate key name from path
        const key = path.join(path.dirname(item), basename).replace(/\\/g, "/").replaceAll("/", ".");

        let value = dataObject[locale];
        let isFallback = false;

        if (value === undefined || value === null)
        {
            if (useFallback && dataObject["en-US"] !== undefined)
            {
                value = dataObject["en-US"];
                isFallback = true;
            }
            else
            {
                return null;
            }
        }

        // Handle complex values (objects/arrays) - stringify them
        const valueStr = typeof value === "string" ? value : JSON.stringify(value);
        const displayValue = isFallback ? `[EN] ${valueStr}` : valueStr;

        return { key, value: displayValue, isFallback };
    }
    catch (e)
    {
        console.error(chalk.red(`  Error processing ${item}:`), e);
        return null;
    }
}

function processTextFile(
    filePath: string,
    item: string,
    locale: Locale,
    useFallback: boolean,
    searchPath: string
): { key: string; value: string; isFallback: boolean } | null
{
    try
    {
        const ext = path.extname(item).toLowerCase();
        const basename = path.basename(item);
        const parts = basename.split(".");

        // Must have at least: name.locale.ext
        if (parts.length < 3) return null;

        const fileLocale = parts[parts.length - 2];
        const keyBasename = parts.slice(0, -2).join(".");

        // Generate key name from path
        const key = path.join(path.dirname(item), keyBasename).replace(/\\/g, "/").replaceAll("/", ".");

        // Check if this file is for the target locale
        if (fileLocale.toLowerCase() === locale.toLowerCase())
        {
            const content = fs.readFileSync(filePath, "utf-8");
            return { key, value: content, isFallback: false };
        }
        // Check if this is en-US and we need fallback
        else if (fileLocale.toLowerCase() === "en-us" && useFallback)
        {
            // Check if target locale file exists
            const targetFileName = `${keyBasename}.${locale.toLowerCase()}${ext}`;
            const targetFilePath = PathHelper.join(path.dirname(filePath), targetFileName);

            if (!fs.existsSync(targetFilePath))
            {
                const content = fs.readFileSync(filePath, "utf-8");
                return { key, value: `[EN] ${content}`, isFallback: true };
            }
        }

        return null;
    }
    catch (e)
    {
        console.error(chalk.red(`  Error processing ${item}:`), e);
        return null;
    }
}
