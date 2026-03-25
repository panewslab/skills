import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    name: 'panews',
    entry: { cli: 'src/panews.ts' },
    outDir: 'skills/panews/scripts',
    format: 'esm',
    platform: 'node',
    deps: { alwaysBundle: ['*', '*/*'], onlyBundle: false },
  },
  {
    name: 'panews-creator',
    entry: { cli: 'src/panews-creator.ts' },
    outDir: 'skills/panews-creator/scripts',
    format: 'esm',
    platform: 'node',
    deps: { alwaysBundle: ['*', '*/*'], onlyBundle: false },
  },
])
