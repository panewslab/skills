# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

PANews Skills — 面向 PANews 平台的 Agent Skill 集合。每个 skill 是一份"菜谱"，告诉 Agent 如何为用户完成有价值的任务，而不是 API 调用说明书。

**Installation (end-user):**
```bash
bunx skills add panewslab/skills
# or
npx skills add panewslab/skills
```

## Skills

| Skill | 目标用户 | 用途 | 需要认证 |
|-------|---------|------|---------|
| `panews` | 普通读者 | 浏览、搜索、阅读加密货币新闻 | 否 |
| `panews-creator` | 内容创作者 | 发布、管理、润色 PANews 文章 | 是（`PA-User-Session`） |
| `panews-web-viewer` | — | 将 PANews 页面渲染为 Markdown | 否 |

## 文件结构

```
panews-skills/              # 根目录即 CLI 项目
├── src/
│   ├── commands/           # 所有命令实现（不区分 skill 归属）
│   ├── shared/             # 共享工具（HTTP、session、lang 等）
│   ├── panews.ts           # 入口：注册读者相关命令，输出 panews skill bundle
│   └── panews-creator.ts   # 入口：注册创作者相关命令，输出 creator skill bundle
├── package.json            # tsdown 构建，直接输出到 skills/*/scripts/cli.mjs
├── tsdown.config.ts
└── skills/
    ├── panews/
    │   ├── SKILL.md            # 入口：描述 skill 能做什么，列出可用 workflow
    │   ├── scripts/cli.mjs     # tsdown 输出，单文件，零外部依赖
    │   └── references/
    │       └── workflow-*.md   # 每个用户场景的详细执行步骤
    └── panews-creator/
        ├── SKILL.md
        ├── scripts/cli.mjs
        └── references/
            └── workflow-*.md
```

**两层关系**：
- `SKILL.md` → 索引，告诉 Claude 有哪些 workflow
- `workflow-*.md` → 菜谱，描述如何完成一个用户任务，直接引用 CLI 命令

**不需要 `api.md`**：CLI 的 Zod schema 本身就是字段约束的来源，字段要求、类型、可选/必填全在代码里定义。Claude 看 workflow 里的命令调用，Zod 的报错会告诉它哪里出了问题。

## Skill 维护规范

**编写或修改一个 workflow 时，按以下顺序进行：**

1. **先写 workflow**（`references/workflow-*.md`）：以用户意图为出发点，描述步骤和输出要求
2. **确定需要哪些 CLI 命令**：从 workflow 步骤归纳需要哪些命令和参数
3. **在 CLI 里实现命令**（`cli/src/`）：含 Zod schema 验证、业务逻辑
4. **更新 bundle**：`cli/dist/panews.js` 是最终交付给 Agent 调用的文件

## 脚本约定

- 每个 skill 的 `scripts/cli.mjs` 是 tsdown 打包的单文件产物，含所有依赖（zod、md4x 等），零外部依赖
- 源码在 `src/` 中用 TypeScript 编写，`src/utils/` 存放共享工具：
  - `http.ts` — fetch 封装，统一处理 401 和错误
  - `session.ts` — 环境变量 session 解析链
  - `lang.ts` — `@panews/lang` 的 Zod schema
  - `format.ts` — `select`/`omit` 字段过滤，`htmlToMarkdown` HTML 转 Markdown（via turndown），`toMarkdown` 对象转 AI 友好 Markdown
- 参数：按复杂度选择传参方式
  - 简单脚本（单个或少量参数）：位置参数，如 `get-article.mjs <id>`
  - 复杂脚本（多字段、含可选项）：接受 JSON 字符串或 JSON 文件路径，如 `create-article.mjs '{"title":"..."}' ` 或 `create-article.mjs payload.json`
- 输出：JSON pretty-print 到 stdout；错误 JSON 到 stderr，非零退出码
- API base：`https://universal-api.panewslab.com`（panews / panews-creator），`https://www.panewslab.com`（web-viewer）
- 语言：`--lang` 默认 `zh`，支持 `zh`、`zh-hant`、`en`、`ja`、`ko`

## Session 认证（panews-creator）

解析顺序：`--session` flag → `PANEWS_USER_SESSION` → `PA_USER_SESSION` → `PA_USER_SESSION_ID`

所有操作前先调用 `validate-session.mjs` 验证。401 立即停止。

## 内容格式（panews-creator）

正文必须是 HTML。流程：用户写 Markdown → `bunx md4x <file>.md -t html -o <file>.html` → 传 HTML 文件路径给脚本。

## 无构建/测试基础设施

无 package.json、构建步骤、测试框架或 linter。脚本直接运行：
```bash
node skills/panews/scripts/search-articles.mjs "bitcoin"
```
