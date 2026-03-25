import { defineCommand } from 'citty'
import { z } from 'zod'
import { request } from '../utils/http.ts'
import { resolveLang } from '../utils/lang.ts'
import { toMarkdown } from '../utils/format.ts'

const HookCategorySchema = z.enum([
  'carousel',
  'columns-group-recommend',
  'column-recommend',
  'series-recommend',
  'search-keywords',
  'ai-search-issues',
  'content-publishing-guidelines',
  'about-us',
  'user-agreement',
  'privacy-policy',
  'homepage-tab',
  'app-quick-menu',
  'website-quick-menu',
  'website-series-card',
  'website-recommended-topic',
])

type HookCategory = z.infer<typeof HookCategorySchema>

interface HookTarget {
  lang: string
  text?: string | null
  link?: string | null
}

interface HookRecord {
  id: string
  category: HookCategory
  group?: string | null
  index: number
  payload?: unknown
  targets: HookTarget[]
  startAt: string
  endAt?: string | null
}

export const getHooksCommand = defineCommand({
  meta: {
    description: 'Fetch PANews hooks / injection-point data by category',
  },
  args: {
    category: {
      type: 'string',
      description:
        'Hook category (comma-separated): carousel | search-keywords | ai-search-issues | column-recommend | series-recommend | homepage-tab | website-quick-menu | website-series-card | website-recommended-topic | app-quick-menu | columns-group-recommend | about-us | content-publishing-guidelines | user-agreement | privacy-policy',
      required: true,
    },
    take: {
      type: 'string',
      description: 'Number of results (max 100)',
      default: '20',
    },
    lang: {
      type: 'string',
      description: 'Language code or locale; auto-detected if omitted',
    },
  },
  async run({ args }) {
    const lang = resolveLang(args.lang)
    const take = z.coerce.number().int().min(1).max(100).parse(args.take || '20')

    // Validate each category value
    const categories = args.category
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => HookCategorySchema.parse(c))

    if (categories.length === 0) {
      throw new Error('At least one non-empty hook category is required.')
    }

    const params = new URLSearchParams({
      category: categories.join(','),
      onlyValid: 'true',
      take: String(take),
    })

    const data = await request<HookRecord[]>(`/hooks?${params}`, { lang })

    const items = data.map((h) => {
      const target = h.targets.find((t) => t.lang === lang) ?? h.targets[0]

      return {
        id: h.id,
        category: h.category,
        text: target?.text,
        link: target?.link,
        payload: h.payload,
        group: h.group,
      }
    })

    console.log(toMarkdown(items))
  },
})
