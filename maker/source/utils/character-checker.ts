export function isCJKCharacter(char: string | number)
{
    const codePoint = typeof char === "string" ? char.codePointAt(0) : char;

    return codePoint! >= 0x4E00 && codePoint! <= 0x9FFF;
}