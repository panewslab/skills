import { defineConfig } from 'tsdown'

const sharedConfig = {
  format: 'esm' as const,
  platform: 'node' as const,
  minify: true,
  deps: {
    alwaysBundle: ['*', '*/*'],
    onlyBundle: false,
  },
}

export default defineConfig([
  {
    name: 'panews',
    entry: { cli: 'src/panews.ts' },
    outDir: 'skills/panews/scripts',
    ...sharedConfig,
  },
  {
    name: 'panews-creator',
    entry: { cli: 'src/panews-creator.ts' },
    outDir: 'skills/panews-creator/scripts',
    ...sharedConfig,
  },
])
