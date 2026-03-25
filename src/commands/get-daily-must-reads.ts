import { defineCommand } from 'citty'
import { request } from '../utils/http.ts'
import { resolveLang } from '../utils/lang.ts'
import { select, toMarkdown } from '../utils/format.ts'

interface Article {
  id: string
  title: string
  desc: string | null
  publishedAt: string
  [key: string]: unknown
}

interface MustReadItem {
  id: string
  index: number
  article: Article
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export const getDailyMustReadsCommand = defineCommand({
  meta: {
    description: 'Get daily must-read articles',
  },
  args: {
    date: {
      type: 'string',
      description: 'Target date in YYYY-MM-DD format (default: today)',
    },
    lang: {
      type: 'string',
      description: 'Language code or locale (e.g. zh, en, zh-TW, en-US); auto-detected if omitted',

    },
  },
  async run({ args }) {
    const lang = resolveLang(args.lang)
    const date = args.date || todayDate()

    const data = await request<MustReadItem[]>(
      `/daily-must-reads?date=${date}`,
      { lang },
    )

    const items = data.map(({ article }) =>
      select(article, ['id', 'title', 'desc', 'publishedAt']),
    )

    console.log(toMarkdown(items))
  },
})
