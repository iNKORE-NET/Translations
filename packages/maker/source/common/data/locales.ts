import { UserError } from "source/utilities/user-error";

export const locales =
{
    "en-US":
    {
        workinProgress: false
    },

    "zh-CN":
    {
        workinProgress: true
    }
}

export type Locale = keyof typeof locales;

export function checkLocale(locale: string): Locale
{
    for (const key in locales)
    {
        if (key.toLowerCase() === locale.toLowerCase())
        {
            return key as Locale;
        }
    }

    throw new UserError(`Locale '${locale}' is not supported. If you want to add a new locale, please add it to 'maker/source/common/data/locales.ts'.`);
}