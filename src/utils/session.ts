export function resolveSession(fromArg?: string): string | undefined {
  const candidates = [
    fromArg,
    process.env['PANEWS_USER_SESSION'],
    process.env['PA_USER_SESSION'],
    process.env['PA_USER_SESSION_ID'],
  ]

  for (const candidate of candidates) {
    const trimmed = candidate?.trim()
    if (trimmed) return trimmed
  }

  return undefined
}
