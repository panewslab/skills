import { Language } from "@panews/lang";
import { z } from "zod";

export const Lang = z.enum(Language);
export type Lang = z.infer<typeof Lang>;

// Returns undefined if value is empty — http.ts will omit the header in that case
export function parseLang(value?: string): Lang | undefined {
  if (!value) return undefined;
  return Lang.parse(value);
}
