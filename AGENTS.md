# AGENTS.md

This file is for agents developing this repository itself.

The project is not a PANews API reference and not an end-user manual. It is the source repository for the PANews agent package: three skills, two CLI bundles, repo-root plugin manifests, and the documentation that ties them together.

## What This Repo Produces

- `panews`: structured PANews news discovery for crypto and blockchain coverage
- `panews-creator`: authenticated PANews creator workflows
- `panews-web-viewer`: rendered PANews page reads as Markdown
- `skills/*/scripts/cli.mjs`: bundled Node entrypoints for `panews` and `panews-creator`
- `/.codex-plugin/plugin.json`: Codex-style plugin manifest at repo root
- `/.claude-plugin/plugin.json`: Claude Code plugin manifest at repo root

## Canonical Sources

Treat these as the source of truth:

- `src/`: business logic, schemas, command wiring, shared utilities
- `skills/*/SKILL.md`: user-facing skill contract and routing/discovery surface
- `skills/*/references/workflow-*.md`: detailed task recipes
- `skills/*/agents/openai.yaml`: OpenAI-specific discovery metadata
- `README.md`: repository-level product and installation documentation
- `/.codex-plugin/plugin.json` and `/.claude-plugin/plugin.json`: plugin metadata for repo-root plugin packaging

Treat these as generated artifacts:

- `skills/panews/scripts/cli.mjs`
- `skills/panews-creator/scripts/cli.mjs`

Do not hand-edit generated bundles unless the user explicitly asks for that. Change `src/` and rebuild instead.

## Repo Shape

```text
src/
  commands/                TypeScript command implementations
  utils/                   shared formatting, HTTP, language, and session helpers
  panews.ts                panews bundle entry
  panews-creator.ts        panews-creator bundle entry

skills/
  panews/
    SKILL.md
    agents/openai.yaml
    references/workflow-*.md
    scripts/cli.mjs
  panews-creator/
    SKILL.md
    agents/openai.yaml
    references/workflow-*.md
    scripts/cli.mjs
  panews-web-viewer/
    SKILL.md
    agents/openai.yaml
```

`panews-web-viewer` is intentionally protocol-only right now. It has no bundled script.

## How To Change The System

When adding or changing a capability, work in this order:

1. Start from the user task.
2. Update the relevant `SKILL.md` and `references/workflow-*.md` so the skill contract is correct.
3. Add or change the TypeScript command implementation in `src/`.
4. Rebuild the affected CLI bundle with `npm run build`, `npm run build:panews`, or `npm run build:creator`.
5. If routing/discovery changed, update `skills/*/agents/openai.yaml`.
6. If packaging or installation changed, update `README.md` and plugin manifests.

Do not start from low-level API fields and then try to reverse-fit a skill description later. The skill contract comes first.

## Build And Verification

Useful commands:

```bash
npm run build
npm run build:panews
npm run build:creator
node skills/panews/scripts/cli.mjs --help
node skills/panews-creator/scripts/cli.mjs --help
```

This repository does not have a formal test suite. Minimum verification is:

- the relevant bundle builds successfully
- the relevant CLI help or command invocation still runs
- any changed skill docs still match the implemented command surface

## Implementation Rules

- Keep TypeScript source in `src/`; keep generated code out of review unless the build output changed as a consequence.
- Reuse `src/utils/http.ts`, `src/utils/lang.ts`, `src/utils/session.ts`, and `src/utils/format.ts` instead of duplicating request, locale, session, or formatting logic.
- `panews-creator` operations that mutate data must respect session validation and stop on 401.
- `panews-web-viewer` should stay a rendered-page Markdown protocol unless the user explicitly wants it rebuilt as an executable tool.
- Keep `SKILL.md` first-screen content product-facing and discovery-friendly. Do not turn it into a system prompt.
- Keep `README.md` focused on package-level installation and positioning. Do not duplicate all skill internals there.

## Packaging Rules

- This repository itself is the plugin root.
- Do not create an extra wrapper plugin directory unless the user explicitly asks for a multi-plugin repo layout.
- Keep plugin technical name stable as `panews` unless the user explicitly requests a breaking rename.
- It is acceptable for the repository display name to be broader than the technical install name. Current product-level name: `PANews Agent Toolkit`.

## Common Mistakes To Avoid

- Editing `skills/*/scripts/cli.mjs` directly instead of rebuilding from `src/`
- Writing local absolute filesystem paths into committed docs or manifests
- Treating `AGENTS.md` as end-user documentation instead of repository-maintainer guidance
- Letting `README.md`, `SKILL.md`, workflows, and actual CLI behavior drift apart
- Reintroducing a script for `panews-web-viewer` without an explicit product decision
