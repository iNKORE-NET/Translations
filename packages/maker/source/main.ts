import { program } from "commander";
import { checkLocale } from "source/common/data/locales";

import Entry_Compose from "source/entries/compose";
import Entry_Check from "source/entries/check";
import Entry_Collect from "source/entries/collect";
import Entry_Apply from "source/entries/apply";

import chalk from "chalk";
import { UserError } from "source/utilities/user-error";

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
                console.log(chalk.redBright("■") + chalk.blueBright(` Check complete. Found ${totalErrors} error${totalErrors > 1 ? "s" : ""}.`));
            }
            else
            {
                console.log(chalk.greenBright("■") + chalk.blueBright(" Check complete. No errors found."));
            }
        });

    program.command("compose")
        .argument("[locale]", "The locale to compose. If undefined or 'all', compose all locales.", "all")
        .argument("[namespace]", "The namespace to compose. If undefined or 'all', compose all namespaces.", "all")
        .option("--nocheck", "Skip the check process before composing.", false)
        .action((locale, namespace, options) =>
        {
            const arg_locale = locale == "all" ? undefined : checkLocale(locale);
            const arg_namespace = namespace == "all" ? undefined : namespace;

            if (Entry_Compose(arg_locale, arg_namespace, options.nocheck ?? false) === false)
            {
                exitCode = 1;

                console.log("");
                console.log(chalk.redBright("■") + chalk.blueBright(` Compose complete partially. Some items cannot be composed due to errors above.`));
            }
            else
            {
                console.log("");
                console.log(chalk.greenBright("■") + chalk.blueBright(" Compose complete, all items are up-to-date."));
            }
        });

    program.command("collect")
        .argument("<locale>", "The locale to collect translations for (e.g., zh-CN)")
        .argument("<path>", "The path to collect from (e.g., coreworks or coreworks/command)")
        .option("-f, --fallback", "Use en-US as fallback for missing translations", false)
        .option("-o, --output <path>", "Custom output file path")
        .action((locale, targetPath, options) =>
        {
            const arg_locale = checkLocale(locale);

            const outputPath = Entry_Collect(arg_locale, targetPath, {
                useFallback: options.fallback,
                customOutput: options.output
            });

            console.log("");
            console.log(chalk.greenBright("■") + chalk.blueBright(` Collect complete. Output: ${outputPath}`));
        });

    program.command("apply")
        .argument("<file>", "The JSON file to apply translations from")
        .option("--dry-run", "Preview changes without applying them", false)
        .action((file, options) =>
        {
            const result = Entry_Apply(file, { dryRun: options.dryRun });

            console.log("");
            if (options.dryRun)
            {
                console.log(chalk.blueBright("■") + chalk.blueBright(" Dry run complete. No changes were made."));
            }
            else
            {
                if (result.errors.length > 0)
                {
                    console.log(chalk.yellowBright("■") + chalk.blueBright(" Apply complete with some errors."));
                    exitCode = 1;
                }
                else
                {
                    console.log(chalk.greenBright("■") + chalk.blueBright(" Apply complete."));
                }
            }
        });

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