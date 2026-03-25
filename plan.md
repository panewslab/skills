# PANews Skills 实施计划

> 基于 spec.md，本文档规划两个 skill 的完整实施细节。
> 标记 `[?]` 的地方是需要确认的决策点。

---

## 一、整体文件结构

```
panews-skills/                    ← 根目录即 CLI 项目
├── src/
│   ├── shared/                   ← 两个 skill 共享的实现
│   │   ├── http.ts               ← HTTP 客户端封装
│   │   ├── session.ts            ← session 读取逻辑
│   │   └── lang.ts               ← 语言参数处理
│   ├── panews/                   ← 读者命令实现
│   │   └── index.ts
│   └── panews-creator/           ← 创作者命令实现
│       └── index.ts
├── package.json
├── tsdown.config.ts
│
└── skills/
    ├── panews/
    │   ├── SKILL.md
    │   ├── scripts/
    │   │   └── cli.mjs           ← tsdown 直接输出，单文件，零外部依赖
    │   └── references/
    │       ├── workflow-today-briefing.md
    │       ├── workflow-topic-research.md
    │       ├── workflow-read-article.md
    │       ├── workflow-trending.md
    │       └── workflow-latest-news.md
    │
    ├── panews-creator/
    │   ├── SKILL.md
    │   ├── scripts/
    │   │   └── cli.mjs           ← tsdown 直接输出
    │   └── references/
    │       ├── workflow-publish.md
    │       ├── workflow-manage.md
    │       ├── workflow-revise.md
    │       ├── workflow-apply-column.md
    │       └── workflow-polish.md
    │
    └── panews-web-viewer/        ← 保留现状，暂不处理
```

> **不需要 `api.md`**：CLI 的 Zod schema 就是字段约束的来源，无需维护单独的 API 参考文档。

**两层关系**：
- `SKILL.md` → 索引，告诉 Claude 有哪些 workflow
- `workflow-*.md` → 菜谱，直接引用 CLI 命令，Zod 报错即文档


---

## 二、Skill 一：panews（读者）

### 2.1 SKILL.md 草稿

SKILL.md 只做两件事：描述这个 skill 是什么，以及列出可用的 workflow。
具体步骤全部在 workflow 文件里。

```markdown
---
name: panews
description: >
  当用户想了解加密货币或区块链相关新闻时使用。
  包括：了解今日行业动态、搜索某个话题或项目的报道、
  查看热门文章和趋势、阅读并理解一篇具体的文章。
---

你是用户了解加密货币世界的向导。用户可能不懂技术，用通俗易懂的语言帮助他们。

## 可用能力

| 场景 | 触发意图 | 参考 |
|------|---------|------|
| 今日速览 | 今天有什么大事？最近加密圈怎么了？ | workflow-today-briefing |
| 话题深挖 | 比特币/某项目/某事件 最近怎么样？ | workflow-topic-research |
| 读懂一篇文章 | 用户给出文章链接或 ID | workflow-read-article |
| 发现热门 | 现在大家都在讨论什么？ | workflow-trending |
| 浏览最新资讯 | 最新快讯 / 刚发生了什么 | workflow-latest-news |

## 通用原则

- 语言默认中文，用户用其他语言提问则匹配用户语言
- 不对价格走势做预测，不做投资建议
- 内容严格来自 PANews，不添加 PANews 没有报道的信息
```

---

### 2.2 CLI 命令清单

每个命令在 `src/panews/` 中实现，含 Zod schema 验证。简单命令用位置参数，复杂命令接受 JSON。

#### `search-articles.mjs`
```
用途：按关键词搜索文章
参数：<query> [--mode hit|time] [--take 5] [--lang zh]
输出：文章列表（id, title, desc, author, publishTime, url）
```
- `mode=hit`：相关性 + 时间衰减（默认，适合话题搜索）
- `mode=time`：按发布时间倒序（适合"最近关于 XX 的报道"）

#### `get-article.mjs`
```
用途：获取单篇文章完整内容
参数：<articleId> [--lang zh]
输出：完整文章（title, content, author, tags, publishTime, relatedArticles）
```

#### `get-daily-must-reads.mjs`
```
用途：获取指定日期的每日必读
参数：[--date YYYY-MM-DD] [--lang zh]
输出：当日精选文章列表
备注：不传 date 默认今天
```

#### `get-rankings.mjs`
```
用途：获取文章热度排行或搜索热词排行
参数：[--type articles|search-keywords] [--take 10] [--lang zh]
输出：
  articles：24h 热门文章排行
  search-keywords：7 天搜索热词排行
```

#### `list-articles.mjs`
```
用途：按类型列出最新文章
参数：[--type NORMAL|NEWS|FLASH] [--take 10] [--lang zh]
输出：文章列表（id, title, desc, publishTime, url）
```

**关于快速能力的考量**：在 agent 聊天场景中，用户有时想要"即时的"而非"综合的"信息——
例如"刚刚发生了什么"、"最新快讯"。这类请求期望的是快速列表，而非经过分析的简报。
`list-articles` + `type=FLASH` 正好服务这个场景：直接列出，不需要额外 API 调用，响应最快。

---

### 2.3 参考文档

`references/` 只包含 workflow 文件，无需 `api.md`。字段约束由 CLI 的 Zod schema 负责。

---

#### `references/workflow-today-briefing.md`

```markdown
# 今日速览

**触发**：用户想知道今天或近期发生了什么，没有指定具体话题。

## 步骤

1. 获取今日每日必读：
   `node get-daily-must-reads.mjs`

2. 获取 24 小时文章热榜（取前 10）：
   `node get-rankings.mjs --type articles --take 10`

3. 合并两个来源，去除重复，综合判断哪 3-5 条最值得关注

4. 输出简报，结构如下：
   - 第一行：一句话概括今日市场氛围（平静 / 活跃 / 动荡）
   - 3-5 条新闻：标题 + 一句话"为什么重要"
   - 最后一行：「以上信息来自 PANews，更新于 [时间]」

## 输出要求

- 控制在 400 字以内
- 专业术语首次出现时括号内附简短解释
- 不展示原始 JSON，不展示文章 ID
```

---

#### `references/workflow-topic-research.md`

```markdown
# 话题深挖

**触发**：用户提到一个具体话题、项目名称、代币或事件。

## 步骤

1. 用用户的关键词搜索文章（相关性优先）：
   `node search-articles.mjs "<query>" --mode hit --take 5`

2. 浏览返回的标题和摘要，评估相关性：
   - 高度相关（标题/摘要直接涉及该话题）：进入下一步
   - 结果为空或相关性低：直接告知用户，不继续

3. 对最相关的 2-3 篇获取全文：
   `node get-article.mjs <id>`

4. 综合输出：
   - **背景**：这个话题是什么（一段话）
   - **最新进展**：近期发生了什么
   - **不同声音**：有争议或多方观点时列出
   - **延伸阅读**：相关文章标题 + 链接（最多 3 条）

## 注意

- 不编造 PANews 没有报道的内容
- 如果用户的问题涉及价格预测，说明不做此类判断，但可以提供相关新闻背景
```

---

#### `references/workflow-read-article.md`

```markdown
# 读懂一篇文章

**触发**：用户给出一篇 PANews 文章的链接或 ID。

## 识别文章 ID

PANews 文章 URL 格式：`https://www?.panewslab.com/{lang}?/{id}`

示例：
- `https://www.panewslab.com/zh/abc123def`
- `https://panewslab.com/en/abc123def`
- `https://www.panewslab.com/abc123def`（无语言前缀）

提取规则：取 URL 最后一段路径即为文章 ID。语言前缀（zh/en/ja 等）忽略。
如果用户给的是纯 ID（非 URL），直接使用。

## 步骤

1. 获取文章全文：
   `node get-article.mjs <articleId>`

2. 输出结构：
   - **核心观点**：一句话
   - **主要内容**：3-5 个要点
   - **关键数据**：如有数字/数据，解释其意义（不只是照搬数字）
   - **为什么值得读**：这篇文章说了什么新的东西
```

---

#### `references/workflow-trending.md`

```markdown
# 发现热门

**触发**：用户想知道现在大家都在关注什么，没有具体话题。

## 步骤

1. 获取 7 天搜索热词：
   `node get-rankings.mjs --type search-keywords --take 5`

2. 获取 24 小时文章热榜：
   `node get-rankings.mjs --type articles --take 5`

3. 输出：
   - **本周热门话题**：前 3 个搜索热词，每个附一句话说明为什么热
   - **今日最受关注**：3 篇文章，标题 + 一句话简介
```

---

#### `references/workflow-latest-news.md`

```markdown
# 浏览最新资讯

**触发**：用户想快速看最新动态，关键词如"最新快讯"、"刚发生了什么"、"最近新闻"。

与"今日速览"的区别：
- 今日速览 → 综合分析，有叙事，帮用户理解
- 浏览最新资讯 → 直接列表，快速扫描，用户自己判断

## 步骤

根据用户意图选择类型：
- "快讯" / "刚发生" → `node list-articles.mjs --type FLASH --take 10`
- "最新新闻" / "今日新闻" → `node list-articles.mjs --type NEWS --take 10`
- 未指定 → 默认 FLASH

输出格式：简洁列表，每条一行：
`[时间] 标题`

不需要摘要，不需要分析，不需要"为什么重要"。
用户如果想了解某条，自然会追问，届时走 workflow-read-article 或 workflow-topic-research。
```

---

## 三、Skill 二：panews-creator（创作者）

### 3.1 SKILL.md 草稿

```markdown
---
name: panews-creator
description: >
  当用户想在 PANews 发布文章、管理自己的稿件或专栏时使用。
  包括：发布新文章、查看稿件状态、修改草稿重新提交、申请专栏。
  所有操作都需要用户提供 PANews session。
---

你是 PANews 创作者的发稿助手。

**所有操作开始前必须先完成 session 验证。**
验证方式：运行 `node validate-session.mjs`。
若无 session，引导用户从浏览器 DevTools → Application → Cookies 中获取 `PA-User-Session`。
若返回 401，立即停止，告知用户 session 已失效需重新获取。

## 可用能力

| 场景 | 触发意图 | 参考 |
|------|---------|------|
| 发布新文章 | 我想发一篇文章 / 帮我发稿 | workflow-publish |
| 管理我的文章 | 我的稿件状态 / 有没有被拒稿 | workflow-manage |
| 修改并重新提交 | 修改草稿 / 被拒稿重投 | workflow-revise |
| 申请专栏 | 我还没有专栏 / 想开专栏 | workflow-apply-column |
| 润色文章 | 帮我改改这篇文章 / 检查一下文章 | workflow-polish |

## 通用原则

- 遇到 401 立即停止，提示重新获取 session
- 删除操作执行前必须二次确认
- 不主动修改用户的文章内容和观点
```

---

### 3.2 CLI 命令清单

每个命令在 `src/panews-creator/` 中实现。

#### `validate-session.mjs`
```
用途：验证 session，返回用户信息和专栏列表
参数：[--session <token>]（不传则读环境变量 PANEWS_USER_SESSION）
输出：{ user: { id, name }, columns: [{ id, name, status }] }
错误：401 输出明确错误信息并以非零退出
```

#### `list-articles.mjs`
```
用途：列出专栏下的文章
参数：--column-id <id> [--status DRAFT|PENDING|PUBLISHED|REJECTED] [--take 20]
输出：文章列表（id, title, status, createdAt, updatedAt）
```

#### `create-article.mjs`
```
用途：在指定专栏创建文章
参数：JSON 字符串或 JSON 文件路径
字段：
  columnId       必填
  title          必填
  desc           必填
  contentFile    必填，HTML 文件路径
  status         默认 DRAFT，可选 PENDING
  cover          可选
  tags           可选，数组，最多 5 个 id
  lang           默认 zh
输出：{ articleId, status, createdAt }
```

#### `update-article.mjs`
```
用途：更新文章（仅 DRAFT 和 REJECTED 状态可用）
参数：JSON 字符串或 JSON 文件路径
字段：
  columnId       必填
  articleId      必填
  （其余字段同 create，均可选，只传要改的）
输出：{ articleId, status, updatedAt }
```

#### `delete-article.mjs`
```
用途：删除文章（仅 DRAFT 和 REJECTED 状态可用）
参数：<columnId> <articleId>（位置参数）
输出：{ success: true }
```

#### `upload-image.mjs`
```
用途：上传本地图片，返回 CDN URL
参数：<file-path> [--watermark]
输出：{ url: "https://cdn..." }
支持格式：PNG, JPG, GIF, WebP, AVIF
```

#### `search-tags.mjs`
```
用途：按关键词搜索标签
参数：<keyword> [--lang zh] [--take 10]
输出：标签列表（id, name）
```

#### `apply-column.mjs`
```
用途：提交专栏申请
参数：JSON 字符串或 JSON 文件路径
字段：
  name           必填
  desc           必填
  picture        必填，封面 URL（需提前上传）
  links          可选，数组
输出：{ applicationId, status }
```

---

### 3.3 参考文档

`references/` 只包含 workflow 文件，无需 `api.md`。

---

#### `references/workflow-publish.md`

```markdown
# 发布新文章

**触发**：用户想把一篇文章发布到 PANews。

## 步骤

### 0. （可选）发布前调研

如果 $panews skill 已安装，可以在发布前搜索同类文章供参考：
`node panews/scripts/search-articles.mjs "<文章主题>" --take 3`
展示结果，让用户了解 PANews 上已有哪些相关报道，避免重复或找到差异化角度。
**如果 $panews 未安装，跳过此步骤。**

### 1. 确认发布目标

从 validate-session 结果中取专栏列表：
- 只有 1 个专栏 → 默认使用，告知用户
- 多个专栏 → 列出让用户选择
- 没有专栏 → 说明需要先申请，跳转 workflow-apply-column

### 2. 收集文章信息

按需与用户确认以下字段（已提供则跳过）：

| 字段 | 必填 | 说明 |
|------|------|------|
| 标题 | 是 | 建议 20 字以内 |
| 摘要 | 是 | 50-100 字 |
| 正文 | 是 | 用户提供 Markdown |
| 封面图 | 建议 | 本地图片先上传，或提供 URL |
| 标签 | 否 | 最多 5 个 |
| 语言 | 否 | 默认 zh |

> 不替用户生成正文。如果用户只有主题没有正文，先问他们内容是否已经写好。

### 3. 处理正文

将 Markdown 转换为 HTML：
```
bunx md4x <file>.md -t html -o <file>.html
```
如果正文有本地图片：先用 upload-image.mjs 上传，替换路径为 CDN URL，再转换。

### 4. 处理标签（可选）

用户想加标签但不知道标签名时：
1. 根据文章主题搜索 2-3 个候选关键词：`node search-tags.mjs "<keyword>"`
2. 展示结果让用户选择

### 5. 创建并确认

1. 以 DRAFT 状态创建：`node create-article.mjs ...`
2. 展示摘要（标题、摘要、标签、所属专栏）
3. 询问：直接提交审核，还是先保存草稿？
4. 按用户选择更新状态
5. 告知文章 ID
```

---

#### `references/workflow-manage.md`

```markdown
# 管理我的文章

**触发**：用户想查看稿件状态或了解有哪些文章。

## 步骤

1. 获取专栏下所有文章：`node list-articles.mjs --column-id <id> --take 50`

2. 按状态分组输出表格：

| 状态 | 含义 | 可执行操作 |
|------|------|-----------|
| DRAFT | 草稿，未提交 | 编辑、提交审核、删除 |
| PENDING | 审核中 | 仅查看 |
| PUBLISHED | 已发布 | 仅查看 |
| REJECTED | 被拒稿 | 编辑后重新提交 |

3. 如有 REJECTED 状态的文章，主动提示：
   「有 X 篇被拒稿，需要修改后重新提交，需要我帮你处理吗？」

[?] API 是否返回被拒稿原因字段？有则在 REJECTED 状态旁展示原因。
```

---

#### `references/workflow-revise.md`

```markdown
# 修改并重新提交

**触发**：用户想修改草稿或被拒稿，重新提交。

## 步骤

1. 如果用户没有指定文章，列出 DRAFT 和 REJECTED 状态的文章供选择
2. 获取原文内容展示给用户
3. 根据用户修改意见更新对应字段
4. 如正文有改动：重新执行 Markdown → HTML 转换
5. 调用 update-article 更新：`node update-article.mjs ...`
6. 询问是否直接提交审核（status → PENDING）
```

---

#### `references/workflow-apply-column.md`

```markdown
# 申请专栏

**触发**：用户还没有专栏，或主动要求申请新专栏。

## 步骤

1. 告诉用户需要准备：
   - 专栏名称（简洁，体现定位）
   - 专栏简介（100-200 字，说明内容方向和更新计划）
   - 专栏封面图（本地图片需先上传）
   - 相关链接（个人主页、社交媒体，可选）

2. 如有本地封面图：`node upload-image.mjs <file>`

3. 提交申请：`node apply-column.mjs ...`

4. 告知申请结果，说明审核通常需要几个工作日
```

---

#### `references/workflow-polish.md`

```markdown
# 润色文章

**触发**：用户想改善文章质量，但不一定要发布。常见说法：
"帮我检查一下"、"帮我润色"、"这篇文章有没有问题"。

此 workflow 不调用任何脚本，纯粹是 Claude 的文本处理能力。

## 步骤

1. 获取用户的文章内容（Markdown 格式最佳，纯文本也可）

2. 按以下维度审阅，**只指出有问题的地方，不做无谓的改动**：

   - **准确性**：有没有明显的事实错误或模糊表述
   - **结构**：逻辑是否清晰，段落是否通顺
   - **标题与内容**：标题是否准确反映内容
   - **摘要**：是否能让读者快速判断是否值得读
   - **语言**：有没有病句、歧义、过于生硬的表达

3. 输出格式：
   - 先给一个总体评价（1-2 句话）
   - 按维度列出具体建议，每条注明位置（第几段或哪句话）
   - 如果有明显需要改写的句子，提供修改建议对比

4. 询问用户：需要直接帮你改好，还是你自己调整？

5. 如果用户想继续发布，自然衔接到 workflow-publish。

## 原则

- 尊重作者的观点和风格，只改表达问题，不改立场
- 不主动建议删减核心内容
- 不替用户发明新观点或数据
```

---

## 四、待决策事项

| # | 问题 | 决策 |
|---|------|------|
| 1 | panews-web-viewer 是否保留？ | ✅ 保留，暂不处理 |
| 2 | 读者 skill 是否需要"浏览最新资讯"场景？ | ✅ 需要，已加入 workflow-latest-news |
| 3 | PANews 文章 URL 格式？ | ✅ `https://www?.panewslab.com/{lang}?/{id}`，取最后一段路径为 ID |
| 4 | 被拒稿 API 是否返回拒绝原因？ | ⏳ 实现时确认并处理 |
| 5 | 创作者 skill 是否需要"润色文章"？ | ✅ 需要，已加入 workflow-polish |
| 6 | 两个 skill 是否协作？ | ✅ creator 发布前检测 $panews 是否安装，安装则可搜索同类文章 |
| 7 | 是否需要 api.md？ | ✅ 不需要，CLI 的 Zod schema 即文档 |
| 8 | 脚本参数格式？ | ✅ 简单命令用位置参数，复杂命令接受 JSON 字符串或文件路径 |
