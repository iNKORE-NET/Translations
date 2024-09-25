import chalk from "chalk";
import path from "path";
import JSON5 from "json5";
import * as readline from 'readline';

import { dataRootPath } from "source/common/constants";
import { Locale, locales } from "source/common/data/locales";
import { getAllItems, getAllNamespaces } from "source/utils/get-all-items";
import { PathHelper } from "source/utils/path-utils";
import * as fs from "fs";
import { validators } from "source/common/validators";

/**
 * Check if the specified items can be used in production.
 * @param locale The locale to check. If undefined, check all locales.
 * @param namespace The namespace to check. If undefined, check all namespaces.
 * @param verbosity The verbosity of the output.
 * @returns The number of errors found.
 */
export default function Check(locale: Locale | undefined = undefined, namespace: string | undefined = undefined, verbosity: "errorOnly" | "allGroups" | "allItems" = "allGroups"): number
{
    let errorCount = 0;

    // When locale is undefined, check all locales.
    if (locale === undefined)
    {
        for (const locale in locales)
        {
            errorCount = errorCount + Check(locale as Locale, namespace);
        }
        return errorCount;
    }

    // When namespace is undefined, check all namespaces.
    if (namespace === undefined)
    {
        for (const namespace of getAllNamespaces())
        {
            errorCount = errorCount + Check(locale, namespace);
        }
        return errorCount;
    }

    console.log(`○ Checking locale '${locale}' on namespace '${namespace}'...`);

    const allItems = getAllItems(PathHelper.join(dataRootPath, namespace));

    const leftLine = chalk.gray("│ ");

    for (const item of allItems)
    {
        const filePath = PathHelper.join(dataRootPath, namespace, item);

        let keyName = item.replaceAll("/", ".");
        keyName = keyName.substring(0, keyName.length - ".json".length);

        function reportError(message: string)
        {
            errorCount++;

            const label = "●";
            console.log(leftLine + `${chalk.redBright(label)} ${chalk.red(chalk.bold(keyName) + ` (${locale}):`)} ${chalk.red(message)}` + "\r\n" +
                leftLine + `${" ".repeat(label.length)} ${chalk.cyan.underline("" + PathHelper.join(dataRootPath, namespace!, item) + "")}`);
        }

        const dataContent = fs.readFileSync(filePath, "utf-8");
        const dataObject = JSON5.parse(dataContent);
        const data = dataObject[locale];

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

            const result = validator.validate(data);
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

    const leftLineEnd = chalk.gray("└─");

    if (errorCount === 0)
    {
        if (verbosity === "errorOnly")
        {
            clearPreviousLine();
        }
        else
        {
            console.log(leftLineEnd + chalk.greenBright("✔ No error found."));
        }
    }
    else if (errorCount > 0)
    {
        console.log(leftLineEnd + chalk.magenta(`✖ Found ${errorCount} error(s).`));
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