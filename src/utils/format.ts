import TurndownService from 'turndown'

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
})

// Convert HTML string to Markdown
export function htmlToMarkdown(html: string): string {
  return turndown.turndown(html)
}

// Pick only specified fields from an object
export function select<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[],
): Partial<T> {
  return Object.fromEntries(
    fields.filter((f) => f in obj).map((f) => [f, obj[f]]),
  ) as Partial<T>
}

// Omit specified fields from an object
export function omit<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[],
): Partial<T> {
  const excluded = new Set(fields as string[])
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !excluded.has(k)),
  ) as Partial<T>
}

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return true
  if (typeof v === 'string') return v.trim() === ''
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === 'object') return Object.keys(v as object).length === 0
  return false
}

// Format a value as AI-friendly Markdown text, skipping empty/null values
export function toMarkdown(data: unknown, depth = 0): string {
  if (isEmpty(data)) return ''
  if (typeof data === 'string') return data
  if (typeof data === 'number' || typeof data === 'boolean') return String(data)

  if (Array.isArray(data)) {
    const lines = data
      .map((item, i) => {
        const rendered = toMarkdown(item, depth + 1)
        return rendered ? `${i + 1}. ${rendered}` : ''
      })
      .filter(Boolean)
    return lines.join('\n')
  }

  if (typeof data === 'object') {
    const indent = '  '.repeat(depth)
    const lines = Object.entries(data as Record<string, unknown>)
      .map(([k, v]) => {
        const rendered = toMarkdown(v, depth + 1)
        if (!rendered) return ''
        const val = typeof v === 'object' && v !== null
          ? '\n' + rendered
          : ` ${rendered}`
        return `${indent}**${k}**:${val}`
      })
      .filter(Boolean)
    return lines.join('\n')
  }

  return String(data)
}
