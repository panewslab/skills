import { defineCommand } from 'citty'
import { z } from 'zod'
import { request } from '../../utils/http.ts'
import { resolveSession } from '../../utils/session.ts'
import { select, toMarkdown } from '../../utils/format.ts'

const ArticleStatusSchema = z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED'])

interface Article {
  id: string
  title: string
  status: string
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

export const creatorListArticlesCommand = defineCommand({
  meta: {
    description: 'List articles in a column',
  },
  args: {
    'column-id': {
      type: 'string',
      description: 'Column ID',
      required: true,
    },
    status: {
      type: 'string',
      description: 'Filter by status: DRAFT | PENDING | PUBLISHED | REJECTED',
    },
    take: {
      type: 'string',
      description: 'Number of results',
      default: '20',
    },
    session: {
      type: 'string',
      description: 'PA-User-Session token',
    },
  },
  async run({ args }) {
    const session = resolveSession(args.session)
    if (!session) {
      console.error(JSON.stringify({ error: '未提供 session。' }))
      process.exit(1)
    }

    const columnId = args['column-id']
    const take = z.coerce.number().int().min(1).max(100).parse(args.take || '20')
    const params = new URLSearchParams({ take: String(take) })
    if (args.status) {
      params.set('status', ArticleStatusSchema.parse(args.status))
    }

    const data = await request<Article[]>(
      `/columns/${columnId}/articles?${params}`,
      { session },
    )

    const items = data.map((a) =>
      select(a, ['id', 'title', 'status', 'createdAt', 'updatedAt']),
    )
    console.log(toMarkdown(items))
  },
})
