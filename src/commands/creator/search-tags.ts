import { defineCommand } from 'citty'
import { z } from 'zod'
import { request } from '../../utils/http.ts'
import { Lang } from '../../utils/lang.ts'
import { select, toMarkdown } from '../../utils/format.ts'

interface Tag {
  id: string
  name: string
  [key: string]: unknown
}

export const searchTagsCommand = defineCommand({
  meta: {
    description: 'Search tags by keyword',
  },
  args: {
    query: {
      type: 'positional',
      description: 'Search keyword',
      required: true,
    },
    take: {
      type: 'string',
      description: 'Number of results',
      default: '10',
    },
    lang: {
      type: 'string',
      description: 'Language code',
      default: 'zh',
    },
  },
  async run({ args }) {
    const lang = Lang.parse(args.lang || 'zh')
    const take = z.coerce.number().int().min(1).max(100).parse(args.take || '10')
    const params = new URLSearchParams({
      search: args.query,
      take: String(take),
    })

    const data = await request<Tag[]>(`/tags?${params}`, { lang })

    const items = data.map((tag) => select(tag, ['id', 'name']))
    console.log(toMarkdown(items))
  },
})
