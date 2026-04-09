import { defineCommand } from 'citty'
import { z } from 'zod'
import { toMarkdown } from '../utils/format.ts'
import {
  formatBoardNumber,
  requestPolymarketBoards,
} from '../utils/polymarket-boards.ts'

interface BoardComparison {
  board_key: string
  board_name: string
  top_count?: number
  median_profit_usd?: number
  median_return_pct?: number
  top_wallet?: string
  top_wallet_profit_usd?: number
  top_wallet_return_pct?: number
}

interface CompareBoardsResponse {
  board_run_id: number
  generated_at: string
  window_label: string
  comparisons: BoardComparison[]
}

function parseBoardList(value: string): string[] {
  const boards = Array.from(
    new Set(
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  )

  if (boards.length < 2) {
    throw new Error('At least two board keys are required')
  }

  return boards
}

export const comparePolymarketBoardsCommand = defineCommand({
  meta: {
    description: 'Compare multiple smart money board categories from the newest run',
  },
  args: {
    boards: {
      type: 'string',
      description: 'Comma-separated board keys, such as active_alpha,small_sharp',
      required: true,
    },
  },
  async run({ args }) {
    const boards = parseBoardList(z.string().trim().min(1).parse(args.boards))
    const params = new URLSearchParams({ boards: boards.join(',') })
    const data = await requestPolymarketBoards<CompareBoardsResponse>(
      `/latest/compare?${params}`,
    )

    const meta = {
      boardRunId: data.board_run_id,
      generatedAt: data.generated_at,
      windowLabel: data.window_label,
      comparedBoards: boards.join(', '),
    }

    const comparisons = (data.comparisons ?? []).map((item) => ({
      boardKey: item.board_key,
      boardName: item.board_name,
      topCount: item.top_count,
      medianProfitUsd: formatBoardNumber(item.median_profit_usd),
      medianReturnPct: formatBoardNumber(item.median_return_pct),
      topWallet: item.top_wallet,
      topWalletProfitUsd: formatBoardNumber(item.top_wallet_profit_usd),
      topWalletReturnPct: formatBoardNumber(item.top_wallet_return_pct),
    }))

    console.log(toMarkdown(meta))
    if (comparisons.length > 0) {
      console.log('\n---\n')
      console.log(toMarkdown(comparisons))
    }
  },
})
