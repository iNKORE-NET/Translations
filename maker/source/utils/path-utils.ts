import * as pathOriginal from "path";

function replaceSlashes(path: string): string
{
    return path.replace(/\\/g, "/");
}

function join(...paths: string[]): string
{
    return replaceSlashes(pathOriginal.join(...paths));
}

function resolve(...paths: string[]): string
{
    return replaceSlashes(pathOriginal.resolve(...paths));
}

export const PathHelper = { join, resolve };

