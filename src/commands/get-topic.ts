import { defineCommand } from 'citty'
import { request } from '../utils/http.ts'
import { resolveLang } from '../utils/lang.ts'
import { toMarkdown } from '../utils/format.ts'

interface TopicTranslation {
  lang: string
  title: string
  desc?: string
}

interface Comment {
  id: string
  text: string
  user?: { profile?: { name?: string } }
  createdAt: string
}

interface Topic {
  id: string
  title: string
  desc: string | null
  commentsCount: number
  favoritesCount: number
  createdAt: string
  translations: TopicTranslation[]
  comments?: Comment[]
  [key: string]: unknown
}

export const getTopicCommand = defineCommand({
  meta: {
    description: 'Get topic details and latest comments',
  },
  args: {
    id: {
      type: 'positional',
      description: 'Topic ID',
      required: true,
    },
    lang: {
      type: 'string',
      description: 'Language code or locale; auto-detected if omitted',
    },
  },
  async run({ args }) {
    const lang = resolveLang(args.lang)

    const topic = await request<Topic>(
      `/topics/${args.id}?includeCommentsTake=10`,
      { lang },
    )

    const tr = topic.translations?.find((x) => x.lang === lang) ?? topic.translations?.[0]
    const meta = {
      id: topic.id,
      title: tr?.title || topic.title,
      desc: tr?.desc || topic.desc,
      comments: topic.commentsCount,
      favorites: topic.favoritesCount,
    }

    console.log(toMarkdown(meta))

    if (topic.comments && topic.comments.length > 0) {
      console.log('\n---\n')
      const commentItems = topic.comments.map((c) => ({
        author: c.user?.profile?.name,
        text: c.text,
        createdAt: c.createdAt,
      }))
      console.log(toMarkdown(commentItems))
    }
  },
})
