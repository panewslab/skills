import { defineCommand } from 'citty'
import { z } from 'zod'
import { request } from '../utils/http.ts'
import { resolveLang } from '../utils/lang.ts'
import { toMarkdown } from '../utils/format.ts'

interface SeriesTranslation {
  lang: string
  name: string
}

interface Series {
  id: string
  name: string
  lastPublishedAt: string | null
  translations: SeriesTranslation[]
  [key: string]: unknown
}

export const listSeriesCommand = defineCommand({
  meta: {
    description: 'List or search PANews series (专题)',
  },
  args: {
    search: {
      type: 'string',
      description: 'Search by series name',
    },
    take: {
      type: 'string',
      description: 'Number of results (max 100)',
      default: '10',
    },
    lang: {
      type: 'string',
      description: 'Language code or locale; auto-detected if omitted',
    },
  },
  async run({ args }) {
    const lang = resolveLang(args.lang)
    const take = z.coerce.number().int().min(1).max(100).parse(args.take || '10')
    const params = new URLSearchParams({ take: String(take) })
    if (args.search) params.set('search', args.search)

    const data = await request<Series[]>(`/series?${params}`, { lang })

    const items = data.map((s) => {
      const translation = s.translations?.find((t) => t.lang === lang) ?? s.translations?.[0]
      return {
        id: s.id,
        name: translation?.name || s.name,
        lastPublishedAt: s.lastPublishedAt,
      }
    })

    console.log(toMarkdown(items))
  },
})
