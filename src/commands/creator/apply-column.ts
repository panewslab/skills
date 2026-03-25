import { defineCommand } from 'citty'
import { request } from '../../utils/http.ts'
import { resolveSession } from '../../utils/session.ts'
import { toMarkdown } from '../../utils/format.ts'

interface ApplicationResult {
  id: string
  status: string
  column: { id: string; name: string }
}

export const applyColumnCommand = defineCommand({
  meta: {
    description: 'Submit a column application',
  },
  args: {
    name: { type: 'string', description: 'Column name', required: true },
    desc: { type: 'string', description: 'Column description', required: true },
    picture: { type: 'string', description: 'Cover image URL (must be uploaded to CDN first)', required: true },
    links: { type: 'string', description: 'Comma-separated URLs (social media, personal site)', required: true },
    session: { type: 'string', description: 'PA-User-Session token' },
  },
  async run({ args }) {
    const session = resolveSession(args.session)
    if (!session) {
      console.error(JSON.stringify({ error: '未提供 session。' }))
      process.exit(1)
    }

    const links = args.links.split(',').map((l) => l.trim()).filter(Boolean)

    const result = await request<ApplicationResult>(
      '/columns/application-froms',
      {
        session,
        method: 'POST',
        body: { name: args.name, desc: args.desc, picture: args.picture, links },
      },
    )

    console.log(toMarkdown({
      applicationId: result.id,
      status: result.status,
      columnId: result.column?.id,
    }))
  },
})
