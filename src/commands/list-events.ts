import { defineCommand } from 'citty'
import { z } from 'zod'
import { requestResponse } from '../utils/http.ts'
import { resolveLang } from '../utils/lang.ts'
import { toMarkdown } from '../utils/format.ts'

const EventCategorySchema = z.enum([
  'SUMMIT',
  'TECH_SEMINAR',
  'LECTURE_SALON',
  'COCKTAIL_SOCIAL',
  'ROADSHOW',
  'HACKATHON',
  'EXHIBITION',
  'COMPETITION',
  'OTHER',
])

const EventCountrySchema = z.enum([
  'AE', 'CA', 'CH', 'CN', 'DE', 'FR', 'GB', 'JP', 'KR', 'SG', 'TH', 'TR', 'US', 'VN', 'OTHER',
])

interface EventTopic {
  topic: {
    id: string
    label: string
    translations: { lang: string; label: string | null }[]
  }
}

interface Event {
  id: string
  title: string
  category: string
  country: string
  address: string
  startAt: string
  endedAt: string
  isOnline: boolean
  isPaid: boolean
  price?: string | null
  url?: string | null
  topics: EventTopic[]
  [key: string]: unknown
}

export const listEventsCommand = defineCommand({
  meta: {
    description: 'List PANews events / activities',
  },
  args: {
    search: {
      type: 'string',
      description: 'Search by event title',
    },
    category: {
      type: 'string',
      description:
        'Filter by category: SUMMIT | TECH_SEMINAR | LECTURE_SALON | COCKTAIL_SOCIAL | ROADSHOW | HACKATHON | EXHIBITION | COMPETITION | OTHER',
    },
    country: {
      type: 'string',
      description: 'Filter by country code: AE CA CH CN DE FR GB JP KR SG TH TR US VN OTHER',
    },
    online: {
      type: 'string',
      description: 'Filter online events: true | false',
    },
    paid: {
      type: 'string',
      description: 'Filter paid events: true | false',
    },
    limit: {
      type: 'string',
      description: 'Results on one page (1-100; default 15)',
    },
    cursor: {
      type: 'string',
      description: 'Opaque nextCursor from the previous page; repeat its filters, sort and language',
    },
    sort: {
      type: 'string',
      description: 'status: ongoing, upcoming, then ended; omitted: newest start first',
    },
    'as-of': {
      type: 'string',
      description: 'Fixed status time, ISO 8601 with timezone; restored from cursor if omitted',
    },
    lang: {
      type: 'string',
      description: 'Language code or locale; auto-detected if omitted',
    },
  },
  async run({ args }) {
    const lang = resolveLang(args.lang)
    if (args.take !== void 0 || args.skip !== void 0) {
      throw new Error('--take and --skip are no longer supported by list-events; use --limit and --cursor')
    }
    const query = {
      limit: z.coerce.number().int().min(1).max(100).parse(args.limit ?? '15'),
      lang,
      search: z.string().min(1).optional().parse(args.search),
      category: EventCategorySchema.optional().parse(args.category),
      country: EventCountrySchema.optional().parse(args.country),
      online: z.enum(['true', 'false']).transform((value) => value === 'true').optional().parse(args.online),
      paid: z.enum(['true', 'false']).transform((value) => value === 'true').optional().parse(args.paid),
      sort: z.literal('status').optional().parse(args.sort),
    }
    const cursor = z.string().min(1).max(4096).optional().parse(args.cursor)
    const asOf = z.iso.datetime({ offset: true }).transform((value) => new Date(value).toISOString())
      .optional().parse(args['as-of'])
    const params = new URLSearchParams({ limit: String(query.limit) })
    for (const key of ['search', 'category', 'country', 'sort'] as const) {
      if (query[key] !== undefined) params.set(key, query[key])
    }
    if (query.online !== undefined) params.set('isOnline', String(query.online))
    if (query.paid !== undefined) params.set('isPaid', String(query.paid))
    if (cursor !== undefined) params.set('cursor', cursor)
    if (asOf !== undefined) params.set('asOf', asOf)

    const response = await requestResponse(`/events?${params}`, { lang, throwOnError: true })
      .catch((error: unknown) => {
        if (error instanceof Error && error.message === 'HTTP 400') {
          throw new Error('HTTP 400: Invalid event query or cursor. Check the filters, then restart without --cursor or --as-of.')
        }
        throw error
      })
    const data = await response.json() as Event[]

    const items = data.map((e) => {
      const topicNames = e.topics
        .map(({ topic }) => topic.translations.find((translation) => translation.lang === lang)?.label ?? topic.label)
        .filter(Boolean)

      return {
        id: e.id,
        title: e.title,
        category: e.category,
        country: e.country,
        address: e.address,
        startAt: e.startAt,
        endedAt: e.endedAt,
        isOnline: e.isOnline,
        isPaid: e.isPaid,
        price: e.price,
        url: e.url,
        topics: topicNames,
      }
    })

    const nextCursor = response.headers.get('PA-Next-Cursor')
    console.log(toMarkdown(items) || (nextCursor ? '_No visible results on this page_' : '_No results_'))
    console.log('\n```json\n' + JSON.stringify({
      nextCursor,
      asOf: response.headers.get('PA-Events-As-Of'),
      query,
    }, null, 2) + '\n```')
  },
})
