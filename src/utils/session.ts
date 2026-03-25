export function resolveSession(fromArg?: string): string | undefined {
  return (
    fromArg ||
    process.env['PANEWS_USER_SESSION'] ||
    process.env['PA_USER_SESSION'] ||
    process.env['PA_USER_SESSION_ID']
  )
}
