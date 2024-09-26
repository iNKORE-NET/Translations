import { dataRootPath, outputPath } from "source/common/constants";
import { Locale, locales } from "source/common/data/locales";
import { getAllItems, getAllNamespaces } from "source/utils/get-all-items";
import { PathHelper } from "source/utils/path-utils";
import { UserError } from "source/utils/user-error";
import * as fs from "fs";
import chalk from "chalk";
import JSON5 from "json5";
import Check from "./check";

export default function Compose(locale: Locale | undefined, namespace: string | undefined, nocheck: boolean = false)
{
    /** Whether the operation is successful. */
    let result = true;

    // When locale is undefined, compose all locales.
    if (locale === undefined)
    {
        for (const locale in locales)
        {
            if (!Compose(locale as Locale, namespace, nocheck)) result = false;
        }
        return result;
    }

    // When namespace is undefined, compose all namespaces.
    if (namespace === undefined)
    {
        for (const namespace of getAllNamespaces())
        {
            if (!Compose(locale, namespace, nocheck)) result = false;
        }
        return result;
    }

    const namespacePath = PathHelper.join(dataRootPath, namespace);
    if (!fs.existsSync(namespacePath) || !fs.statSync(namespacePath).isDirectory())
    {
        throw new UserError(`Namespace '${namespace}' does not exist. Please check your spelling.`);
    }

    if (!nocheck)
    {
        if (Check(locale, namespace) > 0)
        {
            return false;
        }
    }

    console.log(`○ Composing '${locale}' on namespace '${namespace}'...`);

    const allItems = getAllItems(namespacePath);
    const leftLine = chalk.gray("│ ");

    const finalObejct = {};

    let i = 0;

    for (const item of allItems)
    {
        const filePath = PathHelper.join(dataRootPath, namespace, item);

        let keyName = item.replaceAll("/", ".");
        keyName = keyName.substring(0, keyName.length - ".json".length);



        const dataContent = fs.readFileSync(filePath, "utf-8");
        const dataObject = JSON5.parse(dataContent);
        const data = dataObject[locale];


        finalObejct[keyName] = data;

        console.log(leftLine + chalk.greenBright("○ ") + chalk.gray(`(${(i + 1).toString().padStart(allItems.length.toFixed(0).length, "0")}) ` + "Write item: " + keyName + ` (${locale})`));

        i++;
    }

    const finalPath = PathHelper.join(outputPath, namespace, `${locale}.json`);

    if (!fs.existsSync(PathHelper.join(outputPath, namespace)))
    {
        fs.mkdirSync(PathHelper.join(outputPath, namespace), { recursive: true });
    }

    fs.writeFileSync(finalPath, JSON.stringify(finalObejct, null, 4));

    const leftLineEnd = chalk.gray("└─");
    console.log(leftLineEnd + chalk.greenBright("√ ") + "Suceessfully composed " + allItems.length + " items to:" + chalk.cyan.underline(finalPath));

    return result;
}