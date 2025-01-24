import { namespaceRootPath, projectRootPath } from "source/common/constants";
import * as fs from "fs";
import { PathHelper } from "./path-utils";

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