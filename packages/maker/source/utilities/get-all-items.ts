import { namespaceRootPath, projectRootPath } from "source/common/constants";
import * as fs from "fs";
import { PathHelper } from "./path-utils";
import type { Locale } from "source/common/data/locales";
import path from "node:path";
import JSON5 from "json5";

export function getAllNamespaces()
{
    return fs.readdirSync(namespaceRootPath);
}

export function getAllProjects()
{
    const r = fs.readdirSync(projectRootPath).map((s) => 
    {
        if (s.toLowerCase().endsWith(".json")) return s.slice(0, s.length - ".json".length);
    }).filter((s) => s);
    return r as string[];
}

export function getAllItems(parentDir: string = namespaceRootPath)
{
    // Get all items recursively.

    let items: string[] = [];

    function readDirectory(dir: string, isRoot: boolean = false)
    {
        const dirPath = PathHelper.join(parentDir, dir);
        const files = fs.readdirSync(dirPath);

        for (const file of files)
        {
            const relativePath = PathHelper.join(dir, file);
            const absolutePath = PathHelper.join(parentDir, relativePath);

            if (file.startsWith(".")) continue;

            if (fs.statSync(absolutePath).isDirectory())
            {
                readDirectory(relativePath);
            }
            else
            {
                items.push(relativePath);
            }
        }
    }

    readDirectory(".");

    return items;
}


export function readItemData(filePath: string, locale: Locale)
{
    let keyName = path.basename(filePath);

    const ext = path.extname(keyName).toLowerCase();
    let data: string | null = null;
    let type: "markdown" | "plaintext" = "plaintext";
    let fileType: "md" | "txt" | "json" = "txt";
    const dataContent = fs.readFileSync(filePath, "utf-8");
    if ([".json", ".json5"].includes(ext))
    {
        keyName = keyName.substring(0, keyName.length - ext.length);
        const dataObject = JSON5.parse(dataContent);
        data = dataObject[locale];
        type = "plaintext";
        fileType = "json";
    }
    else if ([".txt", ".md"].includes(ext))
    {
        const spl = keyName.split(".");
        const itemLocale = spl[spl.length - 2];

        if (itemLocale.toLowerCase() == locale.toLowerCase())
        {
            keyName = keyName.substring(0, keyName.length - ext.length - itemLocale.length - 1);
            data = dataContent;
            type = ext === ".md" ? "markdown" : "plaintext";
            fileType = ext === ".md" ? "md" : "txt";
        }
    }

    return data === null ? null : { keyName, data, dataContent, type, fileType };
}