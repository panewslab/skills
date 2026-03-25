#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import { validateSessionCommand } from './commands/creator/validate-session.ts'
import { creatorListArticlesCommand } from './commands/creator/list-articles.ts'
import { createArticleCommand } from './commands/creator/create-article.ts'
import { updateArticleCommand } from './commands/creator/update-article.ts'
import { deleteArticleCommand } from './commands/creator/delete-article.ts'
import { uploadImageCommand } from './commands/creator/upload-image.ts'
import { searchTagsCommand } from './commands/creator/search-tags.ts'
import { applyColumnCommand } from './commands/creator/apply-column.ts'

const main = defineCommand({
  meta: {
    name: 'panews-creator',
    description: 'PANews CLI – manage creator content',
  },
  subCommands: {
    'validate-session': validateSessionCommand,
    'list-articles': creatorListArticlesCommand,
    'create-article': createArticleCommand,
    'update-article': updateArticleCommand,
    'delete-article': deleteArticleCommand,
    'upload-image': uploadImageCommand,
    'search-tags': searchTagsCommand,
    'apply-column': applyColumnCommand,
  },
})

runMain(main)
