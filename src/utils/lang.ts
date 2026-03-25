import { Language } from "@panews/lang";
import { z } from "zod";

export const Lang = z.enum(Language).default(Language.chineseSimplified);
export type Lang = z.infer<typeof Lang>;
