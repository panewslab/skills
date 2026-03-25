import { defineCommand } from 'citty'
import { readFileSync } from 'node:fs'
import { extname } from 'node:path'
import { API_BASE } from '../../utils/http.ts'
import { resolveSession } from '../../utils/session.ts'

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
}

export const uploadImageCommand = defineCommand({
  meta: {
    description: 'Upload a local image and return CDN URL',
  },
  args: {
    file: {
      type: 'positional',
      description: 'Path to image file (png/jpg/gif/webp/avif)',
      required: true,
    },
    watermark: {
      type: 'boolean',
      description: 'Add watermark to image',
      default: false,
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

    const ext = extname(args.file).toLowerCase()
    const contentType = MIME_MAP[ext]
    if (!contentType) {
      console.error(JSON.stringify({ error: `不支持的文件类型 ${ext}，支持：png/jpg/gif/webp/avif` }))
      process.exit(1)
    }

    const fileData = readFileSync(args.file)
    const url = new URL(`${API_BASE}/upload`)
    if (args.watermark) url.searchParams.set('watermark', 'true')

    const res = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'PA-User-Session': session,
      },
      body: fileData,
    })

    if (res.status === 401) {
      console.error(JSON.stringify({ error: 'Session 已失效或无效，请重新获取 PA-User-Session。' }))
      process.exit(1)
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error(JSON.stringify({ error: `HTTP ${res.status}`, detail: text }))
      process.exit(1)
    }

    const data = await res.json() as { url: string }
    console.log(data.url)
  },
})
