# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

PANews Skills is a collection of agent skills for the PANews platform. Each skill is a "recipe" that tells an agent how to complete a valuable user task, not an API reference.

**Installation (end-user):**
```bash
bunx skills add panewslab/skills
# or
npx skills add panewslab/skills
```

## Skills

| Skill | Target User | Purpose | Auth Required |
|-------|---------|------|---------|
| `panews` | General readers | Browse, search, and read crypto news | No |
| `panews-creator` | Content creators | Publish, manage, and polish PANews articles | Yes (`PA-User-Session`) |
| `panews-web-viewer` | — | Render PANews pages as Markdown | No |

## File Structure

```
panews-skills/              # The repository root is the CLI project
├── src/
│   ├── commands/           # All command implementations, regardless of skill
│   ├── shared/             # Shared utilities (HTTP, session, lang, etc.)
│   ├── panews.ts           # Entry point: registers reader commands and outputs the panews skill bundle
│   └── panews-creator.ts   # Entry point: registers creator commands and outputs the creator skill bundle
├── package.json            # tsdown build config; outputs directly to skills/*/scripts/cli.mjs
├── tsdown.config.ts
└── skills/
    ├── panews/
    │   ├── SKILL.md            # Entry file: describes what the skill can do and lists available workflows
    │   ├── scripts/cli.mjs     # tsdown output, single file, zero external dependencies
    │   └── references/
    │       └── workflow-*.md   # Detailed execution steps for each user scenario
    └── panews-creator/
        ├── SKILL.md
        ├── scripts/cli.mjs
        └── references/
            └── workflow-*.md
```

**Two layers**:
- `SKILL.md` -> the index that tells Claude which workflows exist
- `workflow-*.md` -> the recipe that explains how to complete a user task and directly references CLI commands

**No `api.md` needed**: the CLI's Zod schemas are already the source of truth for field constraints. Required and optional fields, types, and validation all live in code. Claude should follow the commands shown in each workflow, and Zod errors will indicate what is wrong.

## Skill Maintenance Rules

**When writing or updating a workflow, follow this order:**

1. **Write the workflow first** (`references/workflow-*.md`): start from user intent and describe the steps and output requirements.
2. **Determine which CLI commands are needed**: derive the required commands and parameters from the workflow steps.
3. **Implement the commands in the CLI** (`cli/src/`): include Zod schema validation and business logic.
4. **Update the bundle**: `cli/dist/panews.js` is the final artifact delivered for agent use.

## Script Conventions

- Each skill's `scripts/cli.mjs` is a single-file bundle produced by tsdown, including all dependencies (`zod`, `md4x`, etc.) with zero external runtime dependencies.
- Source code is written in TypeScript under `src/`, and `src/utils/` stores shared utilities:
  - `http.ts` -> fetch wrapper that handles 401 responses and errors consistently
  - `session.ts` -> environment-variable session resolution chain
  - `lang.ts` -> Zod schema for `@panews/lang`
  - `format.ts` -> field filtering with `select`/`omit`, `htmlToMarkdown` for HTML-to-Markdown conversion via turndown, and `toMarkdown` for AI-friendly Markdown output
- Parameters: choose the argument style based on complexity
  - Simple scripts (one or a few arguments): positional arguments, for example `get-article.mjs <id>`
  - Complex scripts (many fields, optional fields): accept a JSON string or JSON file path, for example `create-article.mjs '{"title":"..."}'` or `create-article.mjs payload.json`
- Output: pretty-printed JSON to stdout; error JSON to stderr; non-zero exit code on failure
- API base: `https://universal-api.panewslab.com` for `panews` / `panews-creator`, and `https://www.panewslab.com` for `web-viewer`
- Languages: `--lang` defaults to `zh`; supported values are `zh`, `zh-hant`, `en`, `ja`, and `ko`

## Session Authentication (`panews-creator`)

Resolution order: `--session` flag -> `PANEWS_USER_SESSION` -> `PA_USER_SESSION` -> `PA_USER_SESSION_ID`

Run `validate-session.mjs` before any operation. Stop immediately on 401.

## Content Format (`panews-creator`)

Article bodies must be HTML. Flow: user writes Markdown -> `bunx md4x <file>.md -t html -o <file>.html` -> pass the HTML file path to the script.

## Lightweight Tooling

There is no dedicated test framework or linter in this repository. Scripts can be run directly:
```bash
node skills/panews/scripts/search-articles.mjs "bitcoin"
```
