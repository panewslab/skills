import { defineCommand } from 'citty'
import { z } from 'zod'
import { request } from '../utils/http.ts'
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
    translations: { lang: string; title: string }[]
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
    take: {
      type: 'string',
      description: 'Number of results (max 100)',
      default: '15',
    },
    lang: {
      type: 'string',
      description: 'Language code or locale; auto-detected if omitted',
    },
  },
  async run({ args }) {
    const lang = resolveLang(args.lang)
    const take = z.coerce.number().int().min(1).max(100).parse(args.take || '15')
    const params = new URLSearchParams({ take: String(take) })

    if (args.search) params.set('search', args.search)
    if (args.category) params.set('category', EventCategorySchema.parse(args.category))
    if (args.country) params.set('country', EventCountrySchema.parse(args.country))
    if (args.online !== undefined) params.set('isOnline', args.online)
    if (args.paid !== undefined) params.set('isPaid', args.paid)

    const data = await request<Event[]>(`/events?${params}`, { lang })

    const items = data.map((e) => {
      const topicNames = e.topics
        .map((t) => t.topic.translations[0]?.title)
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

    console.log(toMarkdown(items))
  },
})
