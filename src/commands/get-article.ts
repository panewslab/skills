import { defineCommand } from 'citty'
import { request } from '../utils/http.ts'
import { Lang } from '../utils/lang.ts'
import { htmlToMarkdown, toMarkdown } from '../utils/format.ts'

interface Author {
  profile?: { name?: string }
  [key: string]: unknown
}

interface Article {
  id: string
  title: string
  desc: string | null
  content: string
  publishedAt: string
  author?: Author | null
  tags?: Array<{ tagId: string; tag: { name: string } }>
  [key: string]: unknown
}

export const getArticleCommand = defineCommand({
  meta: {
    description: 'Get full article content by ID',
  },
  args: {
    id: {
      type: 'positional',
      description: 'Article ID',
      required: true,
    },
    lang: {
      type: 'string',
      description: 'Language code',
      default: 'zh',
    },
  },
  async run({ args }) {
    const lang = Lang.parse(args.lang || 'zh')

    const article = await request<Article>(`/articles/${args.id}`, { lang })

    const authorName = article.author?.profile?.name ?? null
    const tagNames = article.tags?.map((t) => t.tag?.name).filter(Boolean) ?? []

    const meta: Record<string, unknown> = {
      title: article.title,
      desc: article.desc,
      publishedAt: article.publishedAt,
      ...(authorName ? { author: authorName } : {}),
      ...(tagNames.length > 0 ? { tags: tagNames } : {}),
    }
    const content = article.content ?? ''

    const output = [
      toMarkdown(meta),
      '',
      '---',
      '',
      htmlToMarkdown(content),
    ].join('\n')

    console.log(output)
  },
})
