# 浏览专题

**触发**：用户想了解某个长期追踪的议题或系列报道。
常见说法："PANews 有没有关于 Layer2 的专题"、"有哪些系列报道"、"这个专题讲了什么"。

## 步骤

### 1. 搜索或列出专题

```bash
node cli.mjs list-series --search "<关键词>" --take 10 --lang <lang>
```

不传 `--search` 则按最新发文时间列出所有专题。

### 2. 查看某个专题的文章

```bash
node cli.mjs get-series <seriesId> --take 10 --lang <lang>
```

输出专题介绍及文章列表（按发布时间倒序）。

### 3. 深入某篇文章

文章 ID 从上一步获取，走 [workflow-read-article](./workflow-read-article.md)。

## 注意

- 专题（series）是编辑策划的系列报道，有明确的主题线索
- 与"话题深挖"的区别：话题深挖是关键词搜索，专题是编辑整理好的系列
