import { defineCommand } from 'citty'
import { request } from '../../utils/http.ts'
import { resolveSession } from '../../utils/session.ts'

export const deleteArticleCommand = defineCommand({
  meta: {
    description: 'Delete a DRAFT or REJECTED article',
  },
  args: {
    'column-id': { type: 'string', description: 'Column ID', required: true },
    'article-id': { type: 'string', description: 'Article ID', required: true },
    session: { type: 'string', description: 'PA-User-Session token' },
  },
  async run({ args }) {
    const session = resolveSession(args.session)
    if (!session) {
      console.error(JSON.stringify({ error: '未提供 session。' }))
      process.exit(1)
    }

    await request<null>(
      `/columns/${args['column-id']}/articles/${args['article-id']}`,
      { session, method: 'DELETE' },
    )

    console.log('已删除。')
  },
})
