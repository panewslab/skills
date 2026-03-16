#!/usr/bin/env node
/**
 * Get PANews daily must-reads.
 *
 * Usage:
 *   node get-daily-must-reads.mjs [options]
 *
 * Options:
 *   --date <YYYY-MM-DD>   Target date (default: today)
 *   --special             Fetch special retrospective list instead
 *   --lang <lang>         zh | zh-hant | en | ja | ko (default: zh)
 */

const BASE_URL = "https://universal-api.panewslab.com";

const args = process.argv.slice(2);
const flags = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--special") {
    flags.special = true;
  } else if (args[i].startsWith("--")) {
    flags[args[i].slice(2)] = args[i + 1];
    i++;
  }
}

const lang = flags.lang ?? "zh";
const headers = { "PA-Accept-Language": lang };

let url;
if (flags.special) {
  url = `${BASE_URL}/daily-must-reads/special`;
} else {
  const params = new URLSearchParams();
  if (flags.date) params.set("date", flags.date);
  url = `${BASE_URL}/daily-must-reads${flags.date ? `?${params}` : ""}`;
}

const res = await fetch(url, { headers });

if (!res.ok) {
  console.error(`Error ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const data = await res.json();
console.log(JSON.stringify(data, null, 2));
