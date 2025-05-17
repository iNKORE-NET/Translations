import chalk from "chalk";
import JSON5 from "json5";

import * as readline from 'readline';
import * as fs from "node:fs";
import path from "node:path";

import { namespaceRootPath, projectRootPath } from "source/common/constants";
import { Locale, locales } from "source/common/data/locales";
import { getAllItems, getAllProjects, readItemData } from "source/utilities/get-all-items";
import { PathHelper } from "source/utilities/path-utils";
import { validators } from "source/common/validators";
import { UserError } from "source/utilities/user-error";

/**
 * Check if the specified items can be used in production.
 * @param locale The locale to check. If undefined, check all locales.
 * @param namespace The namespace to check. If undefined, check all namespaces.
 * @param verbosity The verbosity of the output.
 * @returns The number of errors found.
 */
export default function Check(locale: Locale | undefined = undefined, project: string | undefined = undefined, verbosity: Parameters<typeof checkNamespace>[2] = "allGroups"): number
{
    let errorCount = 0;

    // When locale is undefined, check all locales.
    if (locale === undefined)
    {
        for (const locale in locales)
        {
            errorCount = errorCount + Check(locale as Locale, project, verbosity);
        }
        return errorCount;
    }

    // When namespace is undefined, check all namespaces.
    if (project === undefined)
    {
        for (const proj of getAllProjects())
        {
            errorCount = errorCount + Check(locale, proj, verbosity);
        }
        return errorCount;
    }

    const projectPath = PathHelper.join(projectRootPath, project + ".json");
    if (!fs.existsSync(projectPath) || !fs.statSync(projectPath).isFile())
    {
        throw new UserError(`Export '${project}' does not exist. Please check your spelling.`);
    }

    if (verbosity !== "none")
        console.log(`○ Checking locale '${locale}' on project '${project}'...`);

    const projectInfo = JSON5.parse(fs.readFileSync(projectPath, "utf-8"));
    if (Array.isArray(projectInfo.includes))
    {
        for (const namespace of projectInfo.includes)
        {
            const composed = checkNamespace(locale, namespace, verbosity);
            errorCount = errorCount + composed;
            // for (const key in composed)
            // {
            //     finalObject[key] = composed[key];
            // }
        }
    }

    const leftLineEnd = chalk.gray("└─");
    if (errorCount === 0)
    {
        if (verbosity === "errorOnly")
        {
            clearPreviousLine();
        }
        else
        {
            if (verbosity !== "none")
                console.log(leftLineEnd + chalk.greenBright("√ No error found."));
        }
    }
    else if (errorCount > 0)
    {
        console.log(leftLineEnd + chalk.magenta(`× Found ${errorCount} error(s).`));
    }

    return errorCount;
}

export function checkNamespace(locale: Locale, namespace: string, verbosity: "errorOnly" | "allGroups" | "allItems" | "none" = "allGroups"): number
{
    let errorCount = 0;
    const namespacePath = PathHelper.join(namespaceRootPath, namespace);

    const allItems = getAllItems(namespacePath);

    const leftLine = chalk.gray("│ ");

    for (const item of allItems)
    {
        const filePath = PathHelper.join(namespacePath, item);

        const { keyName, data, dataContent, type } = readItemData(filePath, locale) ?? { };
        if (keyName === undefined || data === undefined || dataContent === undefined) continue;
        function reportError(message: string)
        {
            errorCount++;

            const label = "●";
            console.log(leftLine + `${chalk.red(label + " " + chalk.bold(keyName) + ` (${locale}):`)} ${chalk.redBright(message)}` + "\r\n" +
                leftLine + `${" ".repeat(label.length)} File: ${chalk.cyan.underline("" + PathHelper.join(namespacePath, item) + "")}`);
        }

        try
        {
            if (typeof data !== "string")
            {
                reportError("The value is missing or not a string.");
                continue;
            }

            for (const validator of Object.values(validators))
            {
                const ignoreKey = "// @validation-ignore " + validator.id;

                if (dataContent.includes(ignoreKey))
                {
                    continue;
                }

                const result = validator.validate(data, { type: type! });
                if (result !== true)
                {
                    reportError(typeof result === "string" ? result : validator.message ?? "Unknown error.");
                    continue;
                }
            }

            // Now there is no error.

            if (verbosity === "allItems")
            {
                console.log(leftLine + chalk.greenBright("○ ") + chalk.gray(chalk.bold(keyName) + ` (${locale})` + ": " + "no issue found."));
            }
        }
        catch (error)
        {
            reportError(`${error}`);
        }
    }

    return errorCount;
}

function clearPreviousLine() 
{
    // ts node console 清除上一行

    readline.moveCursor(process.stdout, 0, -1); // 移动光标到上一行
    readline.clearLine(process.stdout, 0); // 清除整行
    readline.cursorTo(process.stdout, 0); // 将光标移动到行首
}