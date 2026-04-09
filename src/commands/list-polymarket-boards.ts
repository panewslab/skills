import { defineCommand } from 'citty'
import { toMarkdown } from '../utils/format.ts'
import { requestPolymarketBoards } from '../utils/polymarket-boards.ts'

interface BoardSummary {
  board_key: string
  board_name: string
  board_description?: string
  entry_count: number
  accepted_count?: number
  candidate_count?: number
}

interface LatestBoardsResponse {
  board_run_id: number
  generated_at: string
  window_label: string
  candidate_wallet_count?: number
  recent_trade_days?: number
  wallet_window_days?: number
  boards: BoardSummary[]
}

export const listPolymarketBoardsCommand = defineCommand({
  meta: {
    description: 'Show the newest completed smart money board run and categories',
  },
  async run() {
    const data = await requestPolymarketBoards<LatestBoardsResponse>('/latest')
    if (!data) {
      console.log('No completed Polymarket smart money board run is available yet.')
      return
    }

    const meta = {
      boardRunId: data.board_run_id,
      generatedAt: data.generated_at,
      windowLabel: data.window_label,
      candidateWalletCount: data.candidate_wallet_count,
      recentTradeDays: data.recent_trade_days,
      walletWindowDays: data.wallet_window_days,
    }

    const boards = (data.boards ?? []).map((board) => ({
      boardKey: board.board_key,
      boardName: board.board_name,
      description: board.board_description,
      entryCount: board.entry_count,
      acceptedCount: board.accepted_count,
      candidateCount: board.candidate_count,
    }))

    console.log(toMarkdown(meta))
    if (boards.length > 0) {
      console.log('\n---\n')
      console.log(toMarkdown(boards))
    }
  },
})
