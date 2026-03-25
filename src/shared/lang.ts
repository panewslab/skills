import { Language } from '@panews/lang'
import { z } from 'zod'

export const VALID_LANGUAGES = Object.values(Language)

export const LangSchema = z
  .enum(VALID_LANGUAGES as [string, ...string[]])
  .default(Language.chineseSimplified)

export type Lang = z.infer<typeof LangSchema>
