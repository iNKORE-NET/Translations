import { program } from "commander";
import { checkLocale } from "source/common/data/locales";

import Entry_Check from "source/entries/check";
import chalk from "chalk";
import { UserError } from "source/utils/user-error";

let exitCode = 0;

try
{
    program.command("check")
        .argument("[locale]", "The locale to check. If undefined or 'all', check all locales.", "all")
        .argument("[namespace]", "The namespace to check. If undefined or 'all', check all namespaces.", "all")
        .option("-v, --verbosity <verbosity>", "The verbosity of the output. 0~2 is also supported.", "allGroups")
        .action((locale, namespace, options) =>
        {
            const arg_locale = locale == "all" ? undefined : checkLocale(locale);
            const arg_namespace = namespace == "all" ? undefined : namespace;
            
            let arg_verbosity = options.verbosity;
            if (arg_verbosity === "0") arg_verbosity = "errorOnly";
            else if (arg_verbosity === "1") arg_verbosity = "allGroups";
            else if (arg_verbosity === "2") arg_verbosity = "allItems";

            const totalErrors = Entry_Check(arg_locale, arg_namespace, arg_verbosity);

            console.log("");
            
            if (totalErrors > 0)
            {
                console.log(chalk.bgRedBright("×") + ` Check complete. Found ${totalErrors} error${totalErrors > 1 ? "s" : ""}.`);
            }
            else
            {
                console.log(chalk.bgGreen.white("√") + " Check complete. No errors found.");
            }
        });

    program.command("compose")
        .argument("[locale]", "The locale to compose. If undefined or 'all', compose all locales.", "all")
        .argument("[namespace]", "The namespace to compose. If undefined or 'all', compose all namespaces.", "all");




    console.log("");
    program.parse();
}
catch (error)
{
    let label = chalk.bgRedBright.white(" FAIL ");

    if (error instanceof Error)
    {
        const isUserError = error instanceof UserError;

        if (isUserError) label = chalk.red("×");

        const message = error.message;
        let stackTrace = error.stack ?? "";
        
        let prefixToRemove = "Error: " + error.message;
        if (stackTrace.startsWith(prefixToRemove))
        {
            stackTrace = stackTrace.substring(prefixToRemove.length);
        }

        if (stackTrace.startsWith("\r\n"))
        {
            stackTrace = stackTrace.substring(2);
        }
        else if (stackTrace.startsWith("\n"))
        {
            stackTrace = stackTrace.substring(1);
        }

        console.error(`${label} ${message}${(stackTrace && !isUserError) ? chalk.gray("\r\n" + stackTrace) : ""}`);

        exitCode = isUserError ? 2 : 1;
    }
    else
    {
        console.error(`${label} ${error}`);
        exitCode = 1;
    }
}
finally
{
    console.log("");
    process.exit(exitCode);
}