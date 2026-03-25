#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'panews-creator',
    description: 'PANews CLI – manage creator content',
  },
  subCommands: {
    // commands will be registered here
  },
})

runMain(main)
