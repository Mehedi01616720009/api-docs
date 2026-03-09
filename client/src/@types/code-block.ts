import type { CODE_LANGS, CODE_THEMES } from "../constants/code-block.constant";

export type CodeLanguageKeys = keyof typeof CODE_LANGS;
export type CodeLanguageValues = (typeof CODE_LANGS)[CodeLanguageKeys];

export type CodeThemeKeys = keyof typeof CODE_THEMES;
export type CodeThemeValues = (typeof CODE_THEMES)[CodeThemeKeys];
