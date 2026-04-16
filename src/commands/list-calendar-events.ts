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

const CalendarPeriodSchema = z.enum(['this-month', 'next-month', 'last-month'])
const CalendarDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

function formatDate(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseCalendarDate(value: string, flagName: '--start-from' | '--end-to'): Date {
  CalendarDateSchema.parse(value)

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`${flagName} must be a valid calendar date in YYYY-MM-DD format.`)
  }

  return date
}

function getMonthRange(period: z.infer<typeof CalendarPeriodSchema>): {
  startFrom: string
  endTo: string
} {
  const now = new Date()
  const offset = period === 'last-month' ? -1 : period === 'next-month' ? 1 : 0
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)

  return {
    startFrom: formatDate(start),
    endTo: formatDate(end),
  }
}

export const listCalendarEventsCommand = defineCommand({
  meta: {
    description: 'List PANews calendar events',
  },
  args: {
    search: {
      type: 'string',
      description: 'Search by event title',
    },
    period: {
      type: 'string',
      description: 'Relative month window: this-month | next-month | last-month',
    },
    'start-from': {
      type: 'string',
      description: 'Filter events starting from date (YYYY-MM-DD)',
    },
    'end-to': {
      type: 'string',
      description: 'Filter events up to date (YYYY-MM-DD); defaults to backward-looking order when used alone',
    },
    'category-id': {
      type: 'string',
      description: 'Filter by calendar category ID (comma-separated for multiple)',
    },
    order: {
      type: 'string',
      description: 'Sort order: asc | desc (default: asc)',
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
  async run({ args, rawArgs }) {
    const lang = resolveLang(args.lang)
    const take = z.coerce.number().int().min(1).max(100).parse(args.take || '20')
    let order = z.enum(['asc', 'desc']).default('asc').parse(args.order || 'asc')
    const hasExplicitOrder = rawArgs.includes('--order')
    const period = args.period
      ? CalendarPeriodSchema.parse(args.period)
      : undefined

    if (period && (args['start-from'] || args['end-to'])) {
      throw new Error('Use either --period or explicit --start-from/--end-to filters, not both.')
    }

    let startFrom = args['start-from']
    let endTo = args['end-to']

    if (period) {
      const range = getMonthRange(period)
      startFrom = range.startFrom
      endTo = range.endTo
    }

    let startFromDate: Date | undefined
    let endToDate: Date | undefined

    if (startFrom) {
      startFromDate = parseCalendarDate(startFrom, '--start-from')
      startFrom = formatDate(startFromDate)
    }

    if (endTo) {
      endToDate = parseCalendarDate(endTo, '--end-to')
      endTo = formatDate(endToDate)
    }

    if (startFromDate && endToDate && startFromDate.getTime() > endToDate.getTime()) {
      throw new Error('--start-from must be earlier than or equal to --end-to.')
    }

    // A lone upper-bound query is usually intended as a backward-looking scan
    // ending at a date, so prefer reverse chronology unless the user overrides it.
    if (endTo && !startFrom && !period && !hasExplicitOrder) {
      order = 'desc'
    }

    const params = new URLSearchParams({ take: String(take), sortOrder: order })

    if (args.search) params.set('search', args.search)
    if (args['category-id']) params.set('categoryId', args['category-id'])
    if (startFrom && endTo) {
      params.set('startAt', `between,${startFrom},${endTo}`)
    } else if (startFrom) {
      params.set('startAt', `gte,${startFrom}`)
    } else if (endTo) {
      params.set('startAt', `lte,${endTo}`)
    }

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
