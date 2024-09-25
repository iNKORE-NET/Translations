import type { Validator } from "../types";

export const NoFullwidthPairedPunctuations: Validator =
{
    id: "no-fullwidth-paired-punctuations",
    message: `Fullwidth paired punctuations '（）【】“” ‘’ ' are not allowed. Please use halfwidth paired punctuations ' () [] "" '' '.`,

    validate(text)
    {
        const forbiddens =
        [
            "（", "）",
            "【", "】",
            "“", "”",
            "‘", "’"
        ];

        //return forbiddens.some(p => text.includes(p)) ? false : true;

        for (const p of forbiddens)
        {
            if (text.includes(p))
            {
                return `Unexpected fullwidth paired punctuation '${p}'.`;
            }
        }

        return true;
    },
}