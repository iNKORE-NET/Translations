import { isCJKCharacter } from "source/utilities/character-checker";
import type { Validator } from "../types";


/**
 * For example, '中文English' should be '中文 English'. 
 * Brackets and quotes should have spaces only on the outside, for example, '中文(English)中文' should be '中文 (English) 中文'.
 */
export const PangulasSpacingValidator: Validator =
{
    id: "pangula-rules",
    message: `Please use Pangu spacing, which is a space before and after Chinese characters, and no space before and after English characters.`,

    validate(text)
    {
        /** Those ones that should have spaces before */
        const leftBrackets = ["(", "["];
        /** Those ones that should have spaces after */
        const rightBrackets = [")", "]"];

        // Since the single quote is also used as an apostrophe, it is not included in the list
        const quotes = [`"`, "`"];

        /** If one of these characters is found, then both previous and next characters should not be checked */
        const pairedPunctuations = [...leftBrackets, ...rightBrackets, ...quotes, "'"].map(c => c.codePointAt(0)!);

        /**These punctuations can be followed by anything without a space */
        const punctuationsThatDoesntNeedAFollowingSpace = ["，", "。", "！", "？", "：", "；", "/", "\\", "\r", "\n"];

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

                if (checkPrevious && (text[i - 1] !== " " && !punctuationsThatDoesntNeedAFollowingSpace.includes(text[i - 1])) && i > 0 && !punctuationsThatDoesntNeedAFollowingSpace.includes(text[i]))
                    return i;
                if (checkNext && punctuationsThatDoesntNeedAFollowingSpace.includes(text) && text[checkNext == "skipOne" ? i + 2 : i + 1] !== " " && i < text.length - 1)
                    return i + 1;

                return false;

            })() !== false)
            {
                return `Chinese characters segments should be surrounded by spaces. (Position: ${i})`;
            }


            // -----------------------
            // Check if brackets are surrounded by spaces correctly
            // -----------------------


            if (leftBrackets.includes(text[i]))
            {
                if (text[i - 1] !== " " && i > 0 && !punctuationsThatDoesntNeedAFollowingSpace.includes(text[i - 1]))
                    return "Start brackets should have a space before.";
            }
            else if (rightBrackets.includes(text[i]))
            {
                if (text[i + 1] !== " " && i < text.length - 1)
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