# 平台注入点（Hooks）

**用途**：获取 PANews 编辑配置的各类推荐内容，包括热门搜索词、推荐专栏/专题、首页导航标签、轮播图、快捷菜单等。
这些内容是 PANews 平台针对当前时期精心策划的，代表编辑视角的重要推荐。

## 可用分类

| category 值 | 内容说明 |
|-------------|---------|
| `search-keywords` | 热门搜索关键词（`payload.hot=true` 表示热搜） |
| `ai-search-issues` | AI 推荐的探索问题 |
| `carousel` | 首页轮播图（含关联文章 ID） |
| `column-recommend` | 推荐专栏（payload 为 columnId） |
| `series-recommend` | 推荐专题（payload 为 seriesId） |
| `website-recommended-topic` | 网站推荐话题（payload 为 topicId） |
| `website-series-card` | 网站专题卡片（payload 为 seriesId） |
| `homepage-tab` | 首页 Tab 导航 |
| `website-quick-menu` | 网站快捷菜单 |
| `app-quick-menu` | App 快捷菜单 |
| `columns-group-recommend` | 专栏组合推荐 |

## 获取 hooks 数据

```bash
node cli.mjs get-hooks --category <category> [--category <cat1,cat2>] [--take 20] [--lang <lang>]
```

category 支持逗号分隔同时获取多个，例如：

```bash
node cli.mjs get-hooks --category "search-keywords,ai-search-issues" --lang <lang>
```

## 典型使用场景

### 获取热门搜索词

```bash
node cli.mjs get-hooks --category search-keywords --lang <lang>
```

返回字段：`text`（关键词）、`payload.hot`（是否热搜标记）。
可作为搜索建议直接展示给用户，或用于引导用户发现热门话题。

### 获取推荐专栏并展示

```bash
node cli.mjs get-hooks --category column-recommend --lang <lang>
```

返回 payload 为 columnId，再调用 `get-column <columnId>` 获取专栏详情。

### 获取 AI 推荐问题

```bash
node cli.mjs get-hooks --category ai-search-issues --lang <lang>
```

返回编辑预设的探索性问题，可用于引导用户深入了解某个主题。

## 注意

- 所有 hooks 均为编辑时效性配置，`onlyValid=true` 已默认过滤过期内容
- payload 含 ID 时（如 columnId、seriesId、topicId），需进一步调用对应命令获取详情
