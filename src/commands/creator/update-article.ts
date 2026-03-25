import { defineCommand } from 'citty'
import { z } from 'zod'
import { readFileSync } from 'node:fs'
import { request } from '../../utils/http.ts'
import { resolveSession } from '../../utils/session.ts'
import { toMarkdown } from '../../utils/format.ts'

const ArticleStatusSchema = z.enum(['DRAFT', 'PENDING'])

interface UpdatedArticle {
  id: string
  status: string
  updatedAt: string
}

export const updateArticleCommand = defineCommand({
  meta: {
    description: 'Update a DRAFT or REJECTED article',
  },
  args: {
    'column-id': { type: 'string', description: 'Column ID', required: true },
    'article-id': { type: 'string', description: 'Article ID', required: true },
    title: { type: 'string', description: 'New title' },
    desc: { type: 'string', description: 'New summary' },
    'content-file': { type: 'string', description: 'Path to new HTML content file' },
    cover: { type: 'string', description: 'New cover image URL' },
    tags: { type: 'string', description: 'Comma-separated tag IDs (replaces existing)' },
    status: { type: 'string', description: 'DRAFT | PENDING' },
    session: { type: 'string', description: 'PA-User-Session token' },
  },
  async run({ args }) {
    const session = resolveSession(args.session)
    if (!session) {
      console.error(JSON.stringify({ error: '未提供 session。' }))
      process.exit(1)
    }

    const body: Record<string, unknown> = {}
    if (args.title) body.title = args.title
    if (args.desc) body.desc = args.desc
    if (args['content-file']) body.content = readFileSync(args['content-file'], 'utf-8')
    if (args.cover) body.cover = args.cover
    if (args.tags) body.tags = args.tags.split(',').map((t) => t.trim()).filter(Boolean)
    if (args.status) body.status = ArticleStatusSchema.parse(args.status)

    if (Object.keys(body).length === 0) {
      console.error(JSON.stringify({ error: '未提供任何要更新的字段。' }))
      process.exit(1)
    }

    const article = await request<UpdatedArticle>(
      `/columns/${args['column-id']}/articles/${args['article-id']}`,
      { session, method: 'PATCH', body },
    )

    console.log(toMarkdown({ id: article.id, status: article.status, updatedAt: article.updatedAt }))
  },
})
