export function isCJKCharacter(char: string | number)
{
    const codePoint = typeof char === "string" ? char.codePointAt(0) : char;

    if (codePoint === undefined)
        return false;

    for (const range of CJKRange)
    {
        if (codePoint >= range.from && codePoint <= range.to)
            return true;
    }
}

// https://blog.csdn.net/Kevin__Mei/article/details/112778960
export const CJKCategories =
{
    /**
     * http://www.unicode.org/Public/UNIDATA/Unihan.html
        Code point range Block name Release
        U+3400…U+4DB5 CJK Unified Ideographs Extension A 3.0
        U+4E00…U+9FA5 CJK Unified Ideographs 1.1
        U+9FA6…U+9FBB CJK Unified Ideographs 4.1
        U+F900…U+FA2D CJK Compatibility Ideographs 1.1
        U+FA30…U+FA6A CJK Compatibility Ideographs 3.2
        U+FA70…U+FAD9 CJK Compatibility Ideographs 4.1
        U+20000…U+2A6D6 CJK Unified Ideographs Extension B 3.1
        U+2F800…U+2FA1D CJK Compatibility Supplement 3.1
     */
    Standard:
    [
        { from: 0x3400, to: 0x4DB5 },
        { from: 0x4E00, to: 0x9FA5 },
        { from: 0x9FA6, to: 0x9FBB },
        { from: 0xF900, to: 0xFA2D },
        { from: 0xFA30, to: 0xFA6A },
        { from: 0xFA70, to: 0xFAD9 },
        { from: 0x20000, to: 0x2A6D6 },
        { from: 0x2F800, to: 0x2FA1D }
    ] as const,

    /** 全角 ASCII、全角中英文标点、半宽片假名、半宽平假名、半宽韩文字母：FF00-FFEF */
    FullwidthPunctuations: [{ from: 0xFF00, to: 0xFFEF }] as const,

    /**3）CJK 部首补充：2E80-2EFF */
    RadicalSupplement: [{ from: 0x2E80, to: 0x2EFF }] as const,

    /**4）CJK 标点符号：3000-303F */
    Punctuations: [{ from: 0x3000, to: 0x303F }] as const,

    /**5）CJK 笔划：31C0-31EF */
    Stroke: [{ from: 0x31C0, to: 0x31EF }] as const,

    /**6）康熙部首：2F00-2FDF */
    KangxiRadicals: [{ from: 0x2F00, to: 0x2FDF }] as const,

    /**7）汉字结构描述字符：2FF0-2FFF */
    IdeographicDescriptionCharacters: [{ from: 0x2FF0, to: 0x2FFF }] as const,

    /**8）注音符号：3100-312F */
    Bopomofo: [{ from: 0x3100, to: 0x312F }] as const,

    /**9）注音符号（闽南语、客家语扩展）：31A0-31BF */
    BopomofoExtended: [{ from: 0x31A0, to: 0x31BF }] as const,

    /**10）日文平假名：3040-309F */
    Hiragana: [{ from: 0x3040, to: 0x309F }] as const,

    /**11）日文片假名：30A0-30FF */
    Katakana: [{ from: 0x30A0, to: 0x30FF }] as const,

    /**12）日文片假名拼音扩展：31F0-31FF */
    KatakanaPhoneticExtensions: [{ from: 0x31F0, to: 0x31FF }] as const,

    /**13）韩文拼音：AC00-D7AF */
    HangulJamo: [{ from: 0xAC00, to: 0xD7AF }] as const,

    /**14）韩文字母：1100-11FF */
    HangulCompatibilityJamo: [{ from: 0x1100, to: 0x11FF }] as const,

    /**15）韩文兼容字母：3130-318F */
    HangulJamoExtendedA: [{ from: 0x3130, to: 0x318F }] as const,

    /**16）太玄经符号：1D300-1D35F */
    TaiXuanJingSymbols: [{ from: 0x1D300, to: 0x1D35F }] as const,

    /**17）易经六十四卦象：4DC0-4DFF */
    YijingHexagramSymbols: [{ from: 0x4DC0, to: 0x4DFF }] as const,

    /**18）彝文音节：A000-A48F */
    YiSyllables: [{ from: 0xA000, to: 0xA48F }] as const,

    /**19）彝文部首：A490-A4CF */
    YiRadicals: [{ from: 0xA490, to: 0xA4CF }] as const,

    /**20）盲文符号：2800-28FF */
    BraillePatterns: [{ from: 0x2800, to: 0x28FF }] as const,

    /**21）CJK 字母及月份：3200-32FF */
    EnclosedCJKLettersAndMonths: [{ from: 0x3200, to: 0x32FF }] as const,

    /**22）CJK 特殊符号（日期合并）：3300-33FF */
    CJKCompatibility: [{ from: 0x3300, to: 0x33FF }] as const,

    /**23）装饰符号（非 CJK 专用）：2700-27BF */
    Dingbats: [{ from: 0x2700, to: 0x27BF }] as const,

    /**24）杂项符号（非 CJK 专用）：2600-26FF */
    MiscellaneousSymbols: [{ from: 0x2600, to: 0x26FF }] as const,

    /**25）中文竖排标点：FE10-FE1F */
    VerticalForms: [{ from: 0xFE10, to: 0xFE1F }] as const,

    /**26）CJK 兼容符号（竖排变体、下划线、顿号）：FE30-FE4F */
    CJKCompatibilityForms: [{ from: 0xFE30, to: 0xFE4F }] as const,

} as const;

export const CJKRange = Object.values(CJKCategories).flat() as { from: number, to: number }[];