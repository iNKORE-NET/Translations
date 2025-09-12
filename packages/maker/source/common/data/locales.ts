import { UserError } from "source/utilities/user-error";

export const locales =
{
    "en-US":
    {
        workinProgress: false
    },

    "es-ES":
    {
        workinProgress: true
    },

    "de-DE":
    {
        workinProgress: true
    },

    "fr-FR":
    {
        workinProgress: true
    },

    "pl-PL":
    {
        workinProgress: true
    },

    "ms-MY":
    {
        workinProgress: true
    },

    "zh-SG":
    {
        workinProgress: true
    },

    "zh-HK":
    {
        workinProgress: true
    },

    "zh-TW":
    {
        workinProgress: true
    },

    "ja-JP":
    {
        workinProgress: true
    },

    "ko-KR":
    {
        workinProgress: true
    },

    "ar-SA":
    {
        workinProgress: true
    },

    "vi-VN":
    {
        workinProgress: true
    },

    "hi-IN":
    {
        workinProgress: true
    },

    "pt-PT":
    {
        workinProgress: true
    },

    "it-IT":
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