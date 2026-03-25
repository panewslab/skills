# 发现热门

**触发**：用户想知道现在大家都在关注什么，没有具体话题。
常见说法："现在大家都在讨论什么"、"最近热度最高的是什么"。

## 步骤

### 1. 获取 7 天搜索热门文章

```bash
node cli.mjs get-rankings --type weekly --take 5 --lang zh
```

### 2. 获取 24 小时文章热榜

```bash
node cli.mjs get-rankings --type daily --take 5 --lang zh
```

### 3. 输出

- **本周最受搜索**：前 3 篇文章，标题 + 一句话说明为什么受关注
- **今日最受关注**：3 篇文章，标题 + 一句话简介

如用户想深入某个热门话题，使用 workflow-topic-research。
