# 浏览最新资讯

**触发**：用户想快速看最新动态，例如：
- "最新快讯"、"最近有什么新闻"、"刚发生了什么"
- "给我看看今天的新闻"（未指定具体话题）

与"今日速览"的区别：
- 今日速览 → 综合分析，有叙事，帮用户理解背景
- 浏览最新资讯 → 直接列表，快速扫描，用户自己判断感兴趣的条目

## 步骤

根据用户意图选择类型：
- "新闻" / "今日新闻" / 未指定 → `node cli.mjs list-articles --type NEWS`
- "深度" / "分析文章" → `node cli.mjs list-articles --type NORMAL`

```bash
node cli.mjs list-articles --type NEWS --take 10 --lang zh
```

## 输出

以简洁列表呈现，每条一行：

```
• [时间] 标题
• [时间] 标题
...
```

不需要摘要，不需要分析。如果用户对某条感兴趣，自然会追问，
届时使用 workflow-read-article 或 workflow-topic-research 深入。
