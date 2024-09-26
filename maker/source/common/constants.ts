import * as path from "path";
import * as fs from "fs";

export const currentDirectory = (function ()
{
    let pt = path.resolve(".");
    while (!fs.existsSync(path.join(pt, "data")))
    {
        pt = path.join(pt, "..");
    }
    return pt;
})();

export const dataRootPath = path.join(currentDirectory, "data");
export const outputPath = path.join(currentDirectory, "compose");