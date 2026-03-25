#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'panews',
    description: 'PANews CLI – read crypto news',
  },
  subCommands: {
    // commands will be registered here
  },
})

runMain(main)
