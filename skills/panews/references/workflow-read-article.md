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

### 1. 获取文章全文

```bash
node cli.mjs get-article <articleId> --lang zh
```

### 2. 输出结构

- **核心观点**：一句话
- **主要内容**：3-5 个要点
- **关键数据**：如有数字/数据，解释其意义（不只是照搬数字）
- **为什么值得读**：这篇文章说了什么新的东西
