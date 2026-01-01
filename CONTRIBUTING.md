# Contributing to Translations

Welcome! Thank you for your interest in contributing translations to iNKORE products and services. This guide will help you understand our translation system and how to contribute effectively.

## Introduction

This repository serves as the **central translation hub** for all iNKORE applications and websites. All translation files are maintained here and then distributed to individual products during their build process.

### Key Concepts

- **Namespace**: A collection of related translations (e.g., `coreworks` contains common UI elements, `mcskinn-app-browser` contains app-specific text)
- **Translation Item**: A single JSON file containing text in all supported languages
- **Export**: A configuration that defines which namespaces are used by a specific product
- **Locale**: A language-region combination (e.g., `en-US`, `zh-CN`, `ja-JP`)

## Repository Structure

```pl
Translations/
├── namespaces/             # Translation source files
│   ├── coreworks/          # Shared translations across all products
│   │   ├── command/        # UI commands (Back, Save, Cancel, etc.)
│   │   ├── common/         # Common phrases
│   │   ├── branding/       # Brand names and slogans
│   │   └── ...
│   ├── mcskinn-app-browser/   # Browser app specific translations
│   ├── site-home/          # Homepage translations
│   └── ...
├── exports/                # Export configurations
│   ├── mcskinn-app-browser.json
│   ├── site-home.json
│   └── ...
├── packages/
│   └── maker/              # Build tool for composing translations
├── schemas/                # JSON schemas for validation
│   ├── data.schema.json    # Schema for translation items
│   └── export.schema.json  # Schema for export configs
└── .output/                # Generated translation bundles (git-ignored)
```

### How It Works

1. **Namespaces** contain the source translation files organized by context
2. Each translation item is a JSON file with translations for all languages
3. **Export configs** define which namespaces each product uses
4. The **maker tool** composes namespaces into final translation bundles
5. Products consume the compiled `.output/{product}/{locale}.json` files

---

## How to Contribute

### Prerequisites

- Git installed on your computer
- A text editor (VS Code recommended)
- Basic understanding of JSON format
- Node.js and pnpm (only if you want to test locally)

### Step-by-Step Guide

#### 1. Fork and Clone the Repository

```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR-USERNAME/Translations.git
cd Translations
```

#### 2. Create a New Branch

```bash
git checkout -b translation-updates-LOCALE
# Example: git checkout -b translation-updates-ja-jp
```

#### 3. Find the Translation Files

Navigate to the `namespaces/` folder and locate the files you want to translate. Common starting points:

- `namespaces/coreworks/command/` - UI commands
- `namespaces/coreworks/common/` - Common phrases
- Product-specific folders for app translations

#### 4. Edit Translation Files

Open a JSON file and add or update translations for your language. See [File Format](#file-format) below for details.

**Example**: `namespaces/coreworks/command/back.json`

```jsonc
{
    "en-US": "Back",
    "es-ES": "Atrás",
    "de-DE": "Zurück",
    "fr-FR": "Retour",
    "zh-CN": "返回",
    "zh-HK": "返回",
    "ja-JP": "戻る",  // Add or update this
    "ko-KR": "뒤로"
}
```

#### 5. Test Your Changes (Optional but Recommended)

If you have Node.js and pnpm installed:

```bash
# Install dependencies
pnpm install

# Check for errors in your translations
pnpm chk [locale] [export]
# Example: pnpm chk ja-JP coreworks

# Generate compiled translations
pnpm comp
```

#### 6. Commit Your Changes

```bash
git add .
git commit -m "Update Japanese translations for coreworks/command"
```

#### 7. Push and Create Pull Request

```bash
git push origin translation-updates-LOCALE
```

Then create a Pull Request on GitHub with a clear description of what you translated.

---

## Translation Guidelines

### General Principles

1. **Accuracy**: Translate the meaning, not just the words
2. **Consistency**: Use the same terms throughout for recurring concepts
3. **Context**: Consider where the text will appear (button, heading, message, etc.)
4. **Length**: Try to keep translations similar in length to avoid UI issues
5. **Formality**: Match the tone of the English version (formal vs. casual)

### Format and Style

Currently we adopt the following style guideline(s):

- [Pangulas](https://github.com/NotYoojun/Pangulas) for CJK languages, which is similar to Pangu style but adds more detailed rules for readability.

Make sure to follow these formatting rules to ensure consistency across translations.

### Dos and Don'ts

✅ **DO:**

- Preserve placeholders like `{0}`, `{name}`, `%s`, etc.
- Maintain special formatting (line breaks, punctuation)
- Research technical terms in your language
- Ask questions if context is unclear
- Test your translations visually if possible

❌ **DON'T:**

- Use machine translation without review
- Change brand names (Inkore, McSkinn, etc.)
- Add or remove placeholders
- Translate keyboard shortcuts or technical identifiers
- Leave incomplete translations

### Special Cases

#### Brand Names

Always keep as-is:

- iNKORE, iNKORE Studios
- McSkinn
- Product names (unless officially localized)

#### Placeholders

Preserve these exactly as they appear:

- `{0}`, `{1}`, `{name}`, `{count}` - Variable placeholders
- `%s`, `%d`, `%f` - Printf-style placeholders
- `{variable}` - Named placeholders

#### HTML/Markdown

If the English version contains HTML or Markdown, preserve the tags:

```jsonc
{
    "en-US": "Click **here** to continue",
    "ja-JP": "**こちら**をクリックして続行"
}
```

---

## File Format

### Supported File Types

The translation system supports three file formats:

#### 1. **JSON Files** (`.json`, `.json5`) - For Short Strings

**Most common format** for UI elements, commands, labels, and short messages.

Each JSON file contains translations for all supported languages with locale codes as keys:

```jsonc
{
    "en-US": "English text",
    "es-ES": "Texto en español",
    "de-DE": "Deutscher Text",
    "fr-FR": "Texte français",
    "zh-CN": "简体中文",
    "zh-HK": "繁體中文",
    "ja-JP": "日本語テキスト",
    "ko-KR": "한국어 텍스트"
    // Add more languages as needed
}
```

**JSON5 Features:**

- **Trailing commas**: `"key": "value",` (comma after last item is OK)
- **Comments**: `// This is a comment`
- **Single quotes**: Both `"text"` and `'text'` work

**Complex values** (objects or arrays) are also supported:

```jsonc
{
    "en-US": {
        "title": "Welcome",
        "message": "Hello, {name}!"
    },
    "ja-JP": {
        "title": "ようこそ",
        "message": "こんにちは、{name}さん！"
    }
}
```

```jsonc
{
    "en-US": ["Option 1", "Option 2", "Option 3"],
    "ja-JP": ["オプション1", "オプション2", "オプション3"]
}
```

Make sure you follow the same structure across all locales in one file.

#### 2. **Text Files** (`.txt`) - For Long Paragraphs

Use for longer content like descriptions, messages, or testimonials where JSON formatting would be cumbersome.

**Naming convention**: `{basename}.{locale}.txt`

**Example structure**:

```txt
content/
├── message.en-us.txt
├── message.zh-cn.txt
├── message.ja-jp.txt
└── response.en-us.txt
```

**File naming**:

- Base name: `message` (becomes the translation key)
- Locale code: `en-us`, `zh-cn` (case-insensitive)
- Extension: `.txt`

**Example** - `message.en-us.txt`:

```txt
This is a long paragraph of text that might span multiple lines.
It can contain line breaks and formatting.

Perfect for testimonials, descriptions, or any multi-line content.
```

**Example** - `message.zh-cn.txt`:

```txt
这是一段较长的文本，可能跨越多行。
它可以包含换行符和格式。

非常适合用于评价、描述或任何多行内容。
```

**Result in compiled output**:

```json
{
    "content.message": "This is a long paragraph of text..."
}
```

#### 3. **Markdown Files** (`.md`) - For Rich Content

Use for documentation, legal pages, articles, or any content requiring rich formatting (headings, lists, links, etc.).

**Naming convention**: `{basename}.{locale}.md`

**Example structure**:

```txt
legal/
├── disclaimer/
│   ├── article.en-us.md
│   ├── article.zh-cn.md
│   └── article.ja-jp.md
└── privacy/
    ├── policy.en-us.md
    └── policy.zh-cn.md
```

**Example** - `article.en-us.md`:

```markdown
# Legal Disclaimer

This page outlines our policies and statements.

## Information We Provide

The information provided by us is intended for general purposes...

- Point 1
- Point 2
- Point 3
```

**Example** - `article.zh-cn.md`:

```markdown
# 法律免责声明

本页概述了我们的政策和声明。

## 我们提供的信息

我们提供的信息仅供一般参考...

- 第一点
- 第二点
- 第三点
```

**Result in compiled output**:

```json
{
    "legal.disclaimer.article": "# Legal Disclaimer\n\nThis page outlines..."
}
```

### File Naming Convention

#### General Rules

- Use **kebab-case** for complete phrases: `back-to-home.json`, not `BackToHome.json`
- File names should be descriptive in **English**
- The file path becomes the translation key (e.g., `command/back.json` → `command.back`)

##### Using underscores (`_`) for variants

Underscores are used to mark **variants** of the same concept - translations that have the same English meaning but differ in:

- **Style/tone**: Serious vs. funny versions

  - `back-to-catalog.json` → "Back to Catalog" / "返回总目录"
  - `back-to-catalog_funny.json` → "Back to Catalog" / "关上此书" (humorous version)
  - `back-to-catalog_short.json` → "Catalog" / "总目录" (shorter version)

- **Context/usage**: Different contexts requiring different translations in other languages

  - `shortcuts_key.json` → "Shortcuts" / "快捷键" (keyboard shortcuts)
  - `shortcuts_quick.json` → "Shortcuts" / "快捷方式" (quick access shortcuts)

- **Length constraints**: Different versions for UI space limitations

  - `description_sm.json` → Short description
  - `description_md.json` → Medium description
  - `name_short.json` → Short name
  - `name_full.json` → Full name

- **Content splits**: Long content divided into multiple translation keys

  - `manual_p1.json` → "Manual" (part 1)
  - `manual_p2.json` → "Manual" (part 2)

**Naming pattern**: `{base-name}_{variant}.json`

- Base name uses kebab-case for multi-word phrases
- Variant suffix uses lowercase with underscores
- Variant names should be descriptive: `_funny`, `_short`, `_full`, `_sm`, `_md`, `_key`, `_quick`, etc.

#### For TXT/MD files

As for text and markdown files, since one file contains only one translation item, the naming convention is slightly different:

- Format: `{basename}.{locale}.{ext}` (baseline part is the same as above)
- Locale code is **case-insensitive**: `en-us`, `en-US`, `EN-US` all work, but you should always use lowercase for consistency (e.g., `en-us`)
- The file path + basename becomes the translation key (e.g., `content/message.en-us.txt` → `content.message`)

### When to Use Each Format

| Format | Use Case | Examples |
|--------|----------|----------|
| **JSON** | Short strings, UI elements, labels, commands | Buttons, menu items, tooltips, error messages |
| **TXT** | Multi-line plain text, paragraphs | User testimonials, descriptions, notifications |
| **MD** | Rich formatted content, documentation | Legal documents, articles, help pages, changelogs |

Note: The type of file is usally determined there already by our staff and workers. As a contributor, you typically just need to observe the existing structure and add translations accordingly.

## Testing Your Translations

### Local Testing

#### 1. Install Dependencies

```bash
pnpm install
```

#### 2. Run Validation Check

Check all translations:

```bash
pnpm chk
```

Check specific locale:

```bash
pnpm chk ja-JP
```

Check specific export:

```bash
pnpm chk ja-JP mcskinn-app-browser
```

#### 3. Compose Translations

Generate compiled translation files:

```bash
pnpm comp
```

This creates files in `.output/{export-name}/{locale}.json`

### Understanding Check Results

The check command will report:

- ✅ **Green**: No issues found
- ❌ **Red**: Errors detected (missing translations, format errors)
- 🟡 **Yellow**: Warnings (non-critical issues)

### Verbosity Levels

Control output detail level:

```bash
# Minimal: Only show errors
pnpm chk [locale] [export] -v 0

# Default: Show groups with errors
pnpm chk [locale] [export] -v 1

# Verbose: Show all items
pnpm chk [locale] [export] -v 2
```

---

## Common Issues

### Issue: "Missing required locale 'en-US'"

**Solution**: Every translation file must include English (US) as the base language.

```jsonc
{
    "en-US": "Example text",  // Required!
    "ja-JP": "例文"
}
```

### Issue: "Invalid JSON syntax"

**Solution**: Check for:

- Missing commas between items
- Unmatched quotes or brackets
- Invalid escape sequences

Use a JSON validator or editor with syntax highlighting.

### Issue: "Placeholder mismatch"

**Solution**: Ensure placeholders match across all languages.

```jsonc
// ❌ Wrong
{
    "en-US": "Hello, {name}!",
    "ja-JP": "こんにちは！"  // Missing {name}
}

// ✅ Correct
{
    "en-US": "Hello, {name}!",
    "ja-JP": "こんにちは、{name}さん！"
}
```

### Issue: "Build fails after my changes"

**Solution**:

1. Run `pnpm chk` to identify errors
2. Fix validation issues
3. Ensure all JSON files are valid
4. Check that you didn't accidentally modify export configs

---

## Getting Help

### Resources

- **JSON5 Documentation**: https://json5.org/
- **Locale Codes**: [IETF BCP 47](https://www.ietf.org/rfc/bcp/bcp47.txt)
- **VS Code**: Recommended editor with JSON validation

### Contact

- **GitHub Issues**: Report bugs or request clarifications
- **Discussions**: Ask questions in GitHub Discussions
- **Pull Requests**: Submit your translations

### Tips for Success

1. **Start small**: Begin with a single namespace or category
2. **Be consistent**: Follow existing patterns in the codebase
3. **Ask questions**: Better to ask than to guess
4. **Review others**: Look at existing translations for reference
5. **Iterate**: Your first contribution doesn't need to be perfect

---

## Thank You! 🎉

Your contributions help make iNKORE products accessible to users worldwide. Every translation, no matter how small, makes a difference.

**Questions?** Don't hesitate to open an issue or start a discussion on GitHub.

**Happy translating!** 🌍
