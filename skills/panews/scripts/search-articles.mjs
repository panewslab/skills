#!/usr/bin/env node
/**
 * Search PANews articles by keyword.
 *
 * Usage:
 *   node search-articles.mjs <query> [options]
 *
 * Options:
 *   --mode hit|time     Ranking mode (default: hit)
 *   --type <list>       Comma-separated: NORMAL,NEWS,VIDEO (default: NORMAL,NEWS)
 *   --types <list>      Deprecated alias for --type
 *   --take <n>          Page size (default: 10)
 *   --skip <n>          Page offset (default: 0)
 *   --lang <lang>       zh | zh-hant | en | ja | ko (default: zh)
 */

const BASE_URL = "https://universal-api.panewslab.com";

const args = process.argv.slice(2);
const flags = {};
const positional = [];

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) {
    flags[args[i].slice(2)] = args[i + 1];
    i++;
  } else {
    positional.push(args[i]);
  }
}

const query = positional.join(" ");
if (!query) {
  console.error(
    "Usage: node search-articles.mjs <query> [--mode hit|time] [--type NORMAL,NEWS] [--take 10] [--skip 0] [--lang zh]",
  );
  process.exit(1);
}

const lang = flags.lang ?? "zh";
const mode = flags.mode ?? "hit";
const type = (flags.type ?? flags.types ?? "NORMAL,NEWS")
  .split(",")
  .map(item => item.trim())
  .filter(Boolean);
const take = Number(flags.take ?? 10);
const skip = Number(flags.skip ?? 0);

const res = await fetch(`${BASE_URL}/search/articles`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "PA-Accept-Language": lang,
  },
  body: JSON.stringify({ query, mode, type, take, skip }),
});

if (!res.ok) {
  console.error(`Error ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const data = await res.json();
console.log(JSON.stringify(data, null, 2));
