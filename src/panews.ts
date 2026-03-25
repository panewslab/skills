#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import { listArticlesCommand } from './commands/list-articles.ts'
import { getDailyMustReadsCommand } from './commands/get-daily-must-reads.ts'
import { getRankingsCommand } from './commands/get-rankings.ts'
import { searchArticlesCommand } from './commands/search-articles.ts'
import { getArticleCommand } from './commands/get-article.ts'
import { listColumnsCommand } from './commands/list-columns.ts'
import { getColumnCommand } from './commands/get-column.ts'
import { listSeriesCommand } from './commands/list-series.ts'
import { getSeriesCommand } from './commands/get-series.ts'
import { listTopicsCommand } from './commands/list-topics.ts'
import { getTopicCommand } from './commands/get-topic.ts'
import { listEventsCommand } from './commands/list-events.ts'
import { listCalendarEventsCommand } from './commands/list-calendar-events.ts'
import { getHooksCommand } from './commands/get-hooks.ts'

const main = defineCommand({
  meta: {
    name: 'panews',
    description: 'PANews CLI – read crypto news',
  },
  subCommands: {
    'list-articles': listArticlesCommand,
    'get-daily-must-reads': getDailyMustReadsCommand,
    'get-rankings': getRankingsCommand,
    'search-articles': searchArticlesCommand,
    'get-article': getArticleCommand,
    'list-columns': listColumnsCommand,
    'get-column': getColumnCommand,
    'list-series': listSeriesCommand,
    'get-series': getSeriesCommand,
    'list-topics': listTopicsCommand,
    'get-topic': getTopicCommand,
    'list-events': listEventsCommand,
    'list-calendar-events': listCalendarEventsCommand,
    'get-hooks': getHooksCommand,
  },
})

runMain(main)
