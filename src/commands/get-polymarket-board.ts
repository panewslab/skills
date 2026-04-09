import { defineCommand } from 'citty'
import { z } from 'zod'
import { toMarkdown } from '../utils/format.ts'
import {
  formatBoardNumber,
  requestPolymarketBoards,
} from '../utils/polymarket-boards.ts'

interface BoardRow {
  rank: number
  display_name?: string
  proxy_wallet: string
  profit_usd?: number
  return_pct?: number
  markets_traded?: number
  performance_trend?: string
  summary_line?: string
  profile_url?: string
  [key: string]: unknown
}

interface BoardResponse {
  board_run_id: number
  generated_at: string
  window_label: string
  board_key: string
  board_name: string
  rows: BoardRow[]
}

export const getPolymarketBoardCommand = defineCommand({
  meta: {
    description: 'Read the latest entries for a specific smart money board',
  },
  args: {
    board: {
      type: 'string',
      description: 'Board key such as active_alpha, high_win_rate, small_sharp, or steady_profit',
      required: true,
    },
    limit: {
      type: 'string',
      description: 'Number of ranked entries to return',
      default: '10',
    },
  },
  async run({ args }) {
    const board = z.string().trim().min(1).parse(args.board)
    const limit = z.coerce.number().int().min(1).max(50).parse(args.limit || '10')

    const params = new URLSearchParams({ limit: String(limit) })
    const data = await requestPolymarketBoards<BoardResponse>(
      `/latest/${encodeURIComponent(board)}?${params}`,
    )

    const meta = {
      boardRunId: data.board_run_id,
      generatedAt: data.generated_at,
      windowLabel: data.window_label,
      boardKey: data.board_key,
      boardName: data.board_name,
    }

    const rows = (data.rows ?? []).map((row) => ({
      rank: row.rank,
      name: row.display_name || row.proxy_wallet,
      wallet: row.proxy_wallet,
      profitUsd: formatBoardNumber(row.profit_usd),
      returnPct: formatBoardNumber(row.return_pct),
      marketsTraded: row.markets_traded,
      performanceTrend: row.performance_trend,
      profileUrl: row.profile_url,
      summary: row.summary_line,
    }))

    console.log(toMarkdown(meta))
    if (rows.length > 0) {
      console.log('\n---\n')
      console.log(toMarkdown(rows))
    }
  },
})
