export const POLYMARKET_BOARDS_API_BASE =
  process.env.PA_SMART_MONEY_API_BASE || 'https://polymarket-boards.panewslab.com/api/boards'

export async function requestPolymarketBoards<T>(path: string): Promise<T | null> {
  const res = await fetch(`${POLYMARKET_BOARDS_API_BASE}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error(
      JSON.stringify({ error: `HTTP ${res.status}`, detail: text }),
    )
    process.exit(1)
  }

  if (res.status === 204) return null

  return res.json() as Promise<T>
}

export function formatBoardNumber(value?: number): number | undefined {
  if (value === null || value === undefined || Number.isNaN(value)) return undefined
  return Math.round(value * 100) / 100
}
