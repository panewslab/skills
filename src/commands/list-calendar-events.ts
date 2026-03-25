import { defineCommand } from 'citty'
import { z } from 'zod'
import { request } from '../utils/http.ts'
import { resolveLang } from '../utils/lang.ts'
import { toMarkdown } from '../utils/format.ts'

interface CalendarEventTranslation {
  lang: string
  title: string
}

interface CalendarCategory {
  id: string
  translations: { lang: string; name: string }[]
}

interface CalendarEvent {
  id: string
  startAt: string
  ignoreTime: boolean
  categoryId: string
  translations: CalendarEventTranslation[]
  url?: string | null
  event?: { id: string; title: string; category: string; isOnline: boolean; isPaid: boolean } | null
  article?: { id: string; title: string } | null
  [key: string]: unknown
}

export const listCalendarEventsCommand = defineCommand({
  meta: {
    description: 'List PANews calendar events (事件日历)',
  },
  args: {
    search: {
      type: 'string',
      description: 'Search by event title',
    },
    'start-from': {
      type: 'string',
      description: 'Filter events starting from date (ISO 8601, e.g. 2025-01-01)',
    },
    'category-id': {
      type: 'string',
      description: 'Filter by calendar category ID (comma-separated for multiple)',
    },
    order: {
      type: 'string',
      description: 'Sort order: asc | desc (default: asc for upcoming)',
      default: 'asc',
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
    const order = z.enum(['asc', 'desc']).default('asc').parse(args.order || 'asc')
    const params = new URLSearchParams({ take: String(take), sortOrder: order })

    if (args.search) params.set('search', args.search)
    if (args['start-from']) params.set('startAt', `gte:${args['start-from']}`)
    if (args['category-id']) params.set('categoryId', args['category-id'])

    const [data, categories] = await Promise.all([
      request<CalendarEvent[]>(`/calendar/events?${params}`, { lang }),
      request<CalendarCategory[]>(`/calendar/categories`, { lang }),
    ])

    const catMap = new Map(
      categories.map((c) => [c.id, c.translations[0]?.name ?? c.id]),
    )

    const items = data.map((e) => {
      const tr = e.translations.find((t) => t.lang === lang) ?? e.translations[0]

      return {
        id: e.id,
        title: tr?.title,
        date: e.ignoreTime ? e.startAt.slice(0, 10) : e.startAt,
        category: catMap.get(e.categoryId) ?? e.categoryId,
        event: e.event?.title,
        article: e.article?.title,
        url: e.url,
      }
    })

    console.log(toMarkdown(items))
  },
})
