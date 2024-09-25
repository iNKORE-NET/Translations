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
    if (locale in locales)
        return locale as Locale;
    else
    {
        throw new Error(`Locale '${locale}' is not supported. If you want to add a new locale, please add it to 'maker/source/common/data/locales.ts'.`);
    }
}