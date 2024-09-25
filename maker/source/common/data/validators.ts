import { isCJKCharacter } from "source/utils/character-checker";

export type Validator =
{
    id: string;
    message?: string;

    /**
     * @returns `true` if the text is valid, otherwise a message to show to the user. If returns `false`, the `message` property cannot be `undefined` and will be shown to the user.
     */
    validate: (text: string) => string | boolean;
}

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

        return forbiddens.some(p => text.includes(p)) ? false : true;
    },
}

/**
 * For example, '中文English' should be '中文 English'. 
 * Brackets and quotes should have spaces only on the outside, for example, '中文(English)中文' should be '中文 (English) 中文'.
 */
export const PangulasSpacingValidator: Validator =
{
    id: "pangu-spacing",
    message: `Please use Pangu spacing, which is a space before and after Chinese characters, and no space before and after English characters.`,

    validate(text)
    {
        /** Those ones that should have spaces before */
        const leftBrackets = ["(", "["];
        /** Those ones that should have spaces after */
        const rightBrackets = [")", "]"];

        const quotes = [`"`, "'", "`"];

        /** If one of these characters is found, then both previous and next characters should not be checked */
        const pairedPunctuations = [...leftBrackets, ...rightBrackets, ...quotes].map(c => c.codePointAt(0)!);

        for (let i = 0; i < text.length; ) 
        {
            const codePoint = text.codePointAt(i);
            
            // -----------------------
            // Check if a Chinese character segment is surrounded by spaces (Returns true if a mistake is found)
            // -----------------------

            if ((function ()
            {
                if (!isCJKCharacter(codePoint!) && codePoint! <= 0xFFFF)
                {
                    return false;
                }

                let checkPrevious = (i > 0);
                let checkNext: boolean | "skipOne" = (i < text.length - 1) ? true : false;
                
                // Check the previous character will be checked
                if (checkPrevious)
                {
                    if (text.codePointAt(i - 2)! > 0xFFFF)
                        checkPrevious = false;
                    if (isCJKCharacter(text.codePointAt(i - 1)!))
                        checkPrevious = false;
                    if (pairedPunctuations.includes(text.codePointAt(i - 1)!))
                        checkPrevious = false;
                }

                // Check the next character will be checked
                if (checkNext !== false)
                {
                    if (text.codePointAt(i)! > 0xFFFF)
                    {
                        checkNext = "skipOne";

                        if (text.codePointAt(i + 2)! > 0xFFFF)
                            checkNext = false;
                        else if (isCJKCharacter(text.codePointAt(i + 2)!))
                            checkNext = false;
                        else if (pairedPunctuations.includes(text.codePointAt(i + 2)!))
                            checkNext = false;
                    }
                    else
                    {
                        if (isCJKCharacter(text.codePointAt(i + 1)!))
                            checkNext = false;
                        if (text.codePointAt(i + 1)! > 0xFFFF)
                            checkNext = false;
                        if (pairedPunctuations.includes(text.codePointAt(i + 1)!))
                            checkNext = false;
                    }
                }
                

                // When this statement is reached, the character is a Chinese character and not surrounded by other Chinese characters

                if (checkPrevious && text[i - 1] !== " ")
                    return true;
                if (checkNext && text[checkNext == "skipOne" ? i + 2 : i + 1] !== " ")
                    return true;

                return false;

            })() == true)
            {
                return "Chinese characters segments should be surrounded by spaces.";
            }


            // -----------------------
            // Check if brackets are surrounded by spaces correctly
            // -----------------------


            if (leftBrackets.includes(text[i]))
            {
                if (text[i - 1] !== " ")
                    return "Start brackets should have a space before.";
            }
            else if (rightBrackets.includes(text[i]))
            {
                if (text[i + 1] !== " ")
                    return "End brackets should have a space after.";
            }

            // -----------------------
            // Check if quotes are surrounded by spaces on at least one side
            // -----------------------

            if (quotes.includes(text[i]))
            {
                if (text[i - 1] !== " " && text[i + 1] !== " ")
                    return "Quotes should have a space on only one side.";
            }
             
            i += codePoint! > 0xFFFF ? 2 : 1;
        }
        
        return true;
    },
}