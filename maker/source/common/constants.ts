import * as path from "path";
import * as fs from "fs";

export const currentDirectory = path.resolve(".");
export const dataRootPath = (function ()
{
    let pt = currentDirectory;
    while (!fs.existsSync(path.join(pt, "data")))
    {
        pt = path.join(pt, "..");
    }
    return path.join(pt, "data");
})();