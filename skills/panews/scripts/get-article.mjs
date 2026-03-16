#!/usr/bin/env node
/**
 * Get a PANews article by ID, with optional related articles.
 *
 * Usage:
 *   node get-article.mjs <articleId> [options]
 *
 * Options:
 *   --related    Also fetch related articles
 *   --lang       zh | zh-hant | en | ja | ko (default: zh)
 */

const BASE_URL = "https://universal-api.panewslab.com";

const args = process.argv.slice(2);
const flags = {};
const positional = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--related") {
    flags.related = true;
  } else if (args[i].startsWith("--")) {
    flags[args[i].slice(2)] = args[i + 1];
    i++;
  } else {
    positional.push(args[i]);
  }
}

const articleId = positional[0];
if (!articleId) {
  console.error(
    "Usage: node get-article.mjs <articleId> [--related] [--lang zh]",
  );
  process.exit(1);
}

const lang = flags.lang ?? "zh";
const headers = { "PA-Accept-Language": lang };

const res = await fetch(`${BASE_URL}/articles/${articleId}`, { headers });

if (!res.ok) {
  console.error(`Error ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const article = await res.json();
const result = { article };

if (flags.related) {
  const relRes = await fetch(
    `${BASE_URL}/articles/${articleId}/related-articles`,
    { headers },
  );
  if (relRes.ok) result.related = await relRes.json();
}

console.log(JSON.stringify(result, null, 2));
