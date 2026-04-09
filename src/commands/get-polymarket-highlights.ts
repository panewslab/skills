import { defineCommand } from 'citty'
import { toMarkdown } from '../utils/format.ts'
import { requestPolymarketBoards } from '../utils/polymarket-boards.ts'

interface HighlightsResponse {
  board_run_id: number
  generated_at: string
  window_label: string
  highlights: string[]
}

export const getPolymarketHighlightsCommand = defineCommand({
  meta: {
    description: 'Summarize highlights from the newest completed smart money board run',
  },
  async run() {
    const data = await requestPolymarketBoards<HighlightsResponse>('/latest/highlights')

    const meta = {
      boardRunId: data.board_run_id,
      generatedAt: data.generated_at,
      windowLabel: data.window_label,
    }

    console.log(toMarkdown(meta))
    if ((data.highlights ?? []).length > 0) {
      console.log('\n---\n')
      console.log(toMarkdown(data.highlights))
    }
  },
})
