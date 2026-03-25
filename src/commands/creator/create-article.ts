import { defineCommand } from 'citty'
import { z } from 'zod'
import { readFileSync } from 'node:fs'
import { request } from '../../utils/http.ts'
import { resolveSession } from '../../utils/session.ts'
import { toMarkdown } from '../../utils/format.ts'

const ArticleStatusSchema = z.enum(['DRAFT', 'PENDING'])

interface CreatedArticle {
  id: string
  status: string
  createdAt: string
}

export const createArticleCommand = defineCommand({
  meta: {
    description: 'Create an article in a column',
  },
  args: {
    'column-id': { type: 'string', description: 'Column ID', required: true },
    title: { type: 'string', description: 'Article title', required: true },
    desc: { type: 'string', description: 'Article summary', required: true },
    'content-file': { type: 'string', description: 'Path to HTML content file', required: true },
    lang: { type: 'string', description: 'Language code', default: 'zh' },
    cover: { type: 'string', description: 'Cover image URL' },
    tags: { type: 'string', description: 'Comma-separated tag IDs' },
    status: { type: 'string', description: 'DRAFT | PENDING', default: 'DRAFT' },
    session: { type: 'string', description: 'PA-User-Session token' },
  },
  async run({ args }) {
    const session = resolveSession(args.session)
    if (!session) {
      console.error(JSON.stringify({ error: '未提供 session。' }))
      process.exit(1)
    }

    const content = readFileSync(args['content-file'], 'utf-8')
    const status = ArticleStatusSchema.parse(args.status || 'DRAFT')
    const tagIds = args.tags ? args.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined

    const body: Record<string, unknown> = {
      lang: args.lang || 'zh',
      title: args.title,
      desc: args.desc,
      content,
      status,
    }
    if (args.cover) body.cover = args.cover
    if (tagIds?.length) body.tags = tagIds

    const article = await request<CreatedArticle>(
      `/columns/${args['column-id']}/articles`,
      { session, method: 'POST', body },
    )

    console.log(toMarkdown({ id: article.id, status: article.status, createdAt: article.createdAt }))
  },
})
