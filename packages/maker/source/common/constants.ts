import * as path from "path";
import * as fs from "fs";

export const currentDirectory = (function ()
{
    let pt = path.resolve(".");
    while (!fs.existsSync(path.join(pt, "exports")))
    {
        pt = path.join(pt, "..");
    }
    return pt;
})();

export const namespaceRootPath = path.join(currentDirectory, "namespaces");
export const projectRootPath = path.join(currentDirectory, "exports");
export const outputRootPath = path.join(currentDirectory, ".output");
export const collectRootPath = path.join(currentDirectory, ".collect");