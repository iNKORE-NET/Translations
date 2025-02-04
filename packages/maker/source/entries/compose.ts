import { namespaceRootPath, outputRootPath, projectRootPath } from "source/common/constants";
import { Locale, locales } from "source/common/data/locales";
import { getAllItems, getAllProjects } from "source/utilities/get-all-items";
import { PathHelper } from "source/utilities/path-utils";
import { UserError } from "source/utilities/user-error";
import * as fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import JSON5 from "json5";
import Check from "./check";

export default function Compose(locale: Locale | undefined, project: string | undefined, nocheck: boolean = false)
{
    /** Whether the operation is successful. */
    let result = true;

    // When namespace is undefined, compose all namespaces.
    if (project === undefined)
    {
        for (const proj of getAllProjects())
        {
            if (!Compose(locale, proj, nocheck)) result = false;
        }
        return result;
    }
    
    // When locale is undefined, compose all locales.
    if (locale === undefined)
    {
        for (const locale in locales)
        {
            if (!Compose(locale as Locale, project, nocheck)) result = false;
        }
        return result;
    }

    console.log(chalk.bold(`○ Composing '${locale}' on export '${project}'...`));

    const projectPath = PathHelper.join(projectRootPath, project + ".json");
    if (!fs.existsSync(projectPath) || !fs.statSync(projectPath).isFile())
    {
        throw new UserError(`Export '${project}' does not exist. Please check your spelling.`);
    }

    if (!nocheck)
    {
        if (Check(locale, project, "none") > 0)
        {
            return false;
        }
    }

    const projectInfo = JSON5.parse(fs.readFileSync(projectPath, "utf-8"));
    const finalObject: Record<string, string> = { };

    if (Array.isArray(projectInfo.includes))
    {
        for (const namespace of projectInfo.includes)
        {
            const composed = composeNamespace(locale, namespace, nocheck);
            if (composed === false)
            {
                console.error(chalk.redBright("× ") + "Failed to compose namespace: " + namespace);
                result = false;
                continue;
            }

            Object.assign(finalObject, composed);
            // for (const key in composed)
            // {
            //     finalObject[key] = composed[key];
            // }
        }
    }

    // --- Write File ---

    const outputPath = PathHelper.join(outputRootPath, project, `${locale.toLowerCase()}.json`);
    if (!fs.existsSync(PathHelper.join(outputRootPath, project)))
    {
        fs.mkdirSync(PathHelper.join(outputRootPath, project), { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(finalObject, null, 4));

    const leftLineEnd = chalk.gray("└─");
    console.log(leftLineEnd + chalk.greenBright("√ ") + "Suceessfully composed " + Object.keys(finalObject).length + " items to: " + chalk.cyan.underline("" + outputPath + ""));

    return result;
}

export function composeNamespace(locale: Locale, namespace: string, nocheck: boolean = false): Record<string, string> | false
{
    /** Whether the operation is successful. */
    let success = true;

    const namespacePath = PathHelper.join(namespaceRootPath, namespace);
    if (!fs.existsSync(namespacePath) || !fs.statSync(namespacePath).isDirectory())
    {
        throw new UserError(`Namespace '${namespace}' does not exist. Please check your spelling.`);
    }

    const allItems = getAllItems(namespacePath);
    const leftLine = chalk.gray("│ ");

    const finalObject = {};
    finalObject["$timestamp"] = Date.now();

    let i = 0;

    for (const item of allItems)
    {
        try
        {
            const filePath = PathHelper.join(namespacePath, item);

            let keyName = item.replaceAll("/", ".");
            const ext = path.extname(keyName);
            if (![".json", ".json5"].includes(ext)) continue;
            keyName = keyName.substring(0, keyName.length - ext.length);

            const dataContent = fs.readFileSync(filePath, "utf-8");
            const dataObject = JSON5.parse(dataContent);
            const data = dataObject[locale];


            finalObject[keyName] = data;

            // console.log(leftLine + chalk.greenBright("○ ") + chalk.gray(`(${(i + 1).toString().padStart(allItems.length.toFixed(0).length, "0")}) ` + "Write item: " + keyName + ` (${locale})`));
        }
        catch (error)   
        {
            console.error(leftLine + chalk.redBright("× ") + chalk.gray(`(${(i + 1).toString().padStart(allItems.length.toFixed(0).length, "0")}) ` + "Failed to write item: " + item));
            success = false;
        }

        i++;
    }

    return finalObject;
}