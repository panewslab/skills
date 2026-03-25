import { defineCommand } from 'citty'
import { request } from '../../utils/http.ts'
import { resolveSession } from '../../utils/session.ts'
import { select, toMarkdown } from '../../utils/format.ts'

interface UserProfile {
  name: string
  avatar: string
}

interface User {
  id: string
  profile: UserProfile
}

interface Column {
  id: string
  name: string
  desc: string
  status: string
  picture: string
}

export const validateSessionCommand = defineCommand({
  meta: {
    description: 'Validate session and list owned columns',
  },
  args: {
    session: {
      type: 'string',
      description: 'PA-User-Session token (or set PANEWS_USER_SESSION env var)',
    },
  },
  async run({ args }) {
    const session = resolveSession(args.session)
    if (!session) {
      console.error(JSON.stringify({ error: '未提供 session，请通过 --session 或环境变量 PANEWS_USER_SESSION 传入。' }))
      process.exit(1)
    }

    const user = await request<User>('/user', { session })
    const columns = await request<Column[]>(
      `/columns?ownerId=${user.id}&status=APPROVED`,
      { session },
    )

    const output = {
      user: { id: user.id, name: user.profile?.name },
      columns: columns.map((c) => select(c as Record<string, unknown>, ['id', 'name', 'status'])),
    }

    console.log(toMarkdown(output))
  },
})
