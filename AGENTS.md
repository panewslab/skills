## Overview

This repository contains Agent Skills for the PANews platform — a crypto/blockchain news service. Skills are collections of Node.js scripts plus reference documentation that enable AI agents to interact with PANews APIs.

**Installation (end-user):**

```bash
bunx skills add panewslab/skills
# or
npx skills add panewslab/skills
```

## Skills

| Skill               | Purpose                                                   | Auth Required           |
| ------------------- | --------------------------------------------------------- | ----------------------- |
| `panews`            | Read-only public API (search, list, get articles)         | No                      |
| `panews-creator`    | Authenticated creator API (full CRUD on articles, images) | Yes (`PA-User-Session`) |
| `panews-web-viewer` | Fetch PANews web pages as Markdown                        | No                      |

## Architecture

Each skill lives under `skills/<skill-name>/` with this structure:

- `SKILL.md` — skill description and invocation instructions
- `agents/openai.yaml` — OpenAI agent metadata (`display_name`, `short_description`, `default_prompt`, `policy`)
- `scripts/*.mjs` — executable Node.js ESM scripts (no dependencies, use native `fetch`)
- `references/*.md` — reference docs for API endpoints, workflows, auth, content formats

### Script Conventions

All scripts follow a uniform pattern:

- **Argument parsing**: Manual flag parsing (no CLI framework); kebab-case flags → camelCase for API bodies
- **Output**: Pretty-printed JSON to stdout; errors as JSON to stderr with non-zero exit code
- **API base**: `https://universal-api.panewslab.com` (panews/panews-creator), `https://www.panewslab.com` (web-viewer)
- **Language**: `--lang` flag, defaults to `zh`; supports `zh`, `zh-hant`, `en`, `ja`, `ko`
- **Pagination**: `--take` (page size, default 10), `--skip` (offset)

### Session Auth (`panews-creator`)

Session resolution order: `--session` flag → `PANEWS_USER_SESSION` → `PA_USER_SESSION` → `PA_USER_SESSION_ID` env var.

Always validate with `GET /user` before mutations. Treat 401 as a hard stop.

### Content Format (`panews-creator`)

Articles require HTML content. The workflow is: write Markdown → convert via `md4x` tool → pass the output HTML file path to `create-article.mjs` or `update-article.mjs`.

## No Build/Test Infrastructure

There is no package.json, build step, test framework, or linter. Scripts run directly:

```bash
node skills/panews/scripts/search-articles.mjs --query "bitcoin"
```
