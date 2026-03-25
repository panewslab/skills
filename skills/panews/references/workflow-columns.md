# 浏览专栏

**触发**：用户想了解某个作者的专栏、订阅专栏、或浏览某专栏的文章。
常见说法："PANews 有哪些专栏"、"有没有关于 DeFi 的专栏"、"这个专栏都写了什么"。

## 步骤

### 1. 搜索或列出专栏

```bash
node cli.mjs list-columns --search "<关键词>" --take 10 --lang <lang>
```

不传 `--search` 则按最新发文时间列出所有专栏。

### 2. 查看某个专栏的详情和文章

```bash
node cli.mjs get-column <columnId> --take 10 --lang <lang>
```

输出专栏介绍（作者、发文数、关注数）及最近文章列表。

### 3. 读某篇具体文章

文章 ID 从上一步获取，然后走 [workflow-read-article](./workflow-read-article.md)。

## 输出要求

- 简洁介绍专栏定位和作者背景
- 列出近期文章时附简短说明，帮用户判断是否感兴趣
