import { Language, parseSupportedLanguage } from '@panews/lang'

export type Lang = (typeof Language)[keyof typeof Language]

// Resolves any locale string to a supported PANews language.
// Accepts aliases like zh-CN, en-US, zh-TW, ja-JP, ko-KR, etc.
// If no value given, auto-detects from system locale, falls back to 'zh'.
export function resolveLang(value?: string): Lang {
  if (value) return parseSupportedLanguage(value) as Lang
  const sysLocale = Intl.DateTimeFormat().resolvedOptions().locale
  return parseSupportedLanguage(sysLocale) as Lang
}
