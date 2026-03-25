#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import { listArticlesCommand } from './commands/list-articles.ts'
import { getDailyMustReadsCommand } from './commands/get-daily-must-reads.ts'
import { getRankingsCommand } from './commands/get-rankings.ts'
import { searchArticlesCommand } from './commands/search-articles.ts'
import { getArticleCommand } from './commands/get-article.ts'

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
  },
})

runMain(main)
