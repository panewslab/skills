import { defineConfig } from "tsdown";

const sharedConfig = defineConfig({
  format: "esm",
  platform: "node",
  minify: true,
  deps: {
    alwaysBundle: ["*", "*/*"],
    onlyBundle: false,
  },
});

const repoUrl = "https://github.com/panewslab/skills";

function makeBanner(name: string, entryPath: string) {
  return [
    "/*!",
    ` * ${name}`,
    " * Copyright (c) 2026 PANews",
    " * License: MIT",
    ` * Source: ${repoUrl}`,
    ` * Entry: ${repoUrl}/blob/main/${entryPath}`,
    " */",
  ].join("\n");
}

export default defineConfig([
  {
    ...sharedConfig,
    name: "panews",
    entry: { cli: "src/panews.ts" },
    outDir: "skills/panews/scripts",
    banner: makeBanner("PANews Reader CLI", "src/panews.ts"),
  },
  {
    name: "panews-creator",
    entry: { cli: "src/panews-creator.ts" },
    outDir: "skills/panews-creator/scripts",
    ...sharedConfig,
    banner: makeBanner("PANews Creator CLI", "src/panews-creator.ts"),
  },
]);
