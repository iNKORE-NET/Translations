import { dataRootPath } from "source/common/constants";
import * as fs from "fs";
import { PathHelper } from "./path-utils";

export function getAllNamespaces()
{
    return fs.readdirSync(dataRootPath);
}

export function getAllItems(parentDir: string = dataRootPath)
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