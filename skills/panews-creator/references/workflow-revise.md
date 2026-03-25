# 修改并重新提交

**触发**：用户想修改草稿或被拒稿，重新提交。

## 步骤

### 1. 确定目标文章

如果用户没有指定文章：

```bash
node cli.mjs list-articles --column-id <id> --status DRAFT --take 20 --session <token>
node cli.mjs list-articles --column-id <id> --status REJECTED --take 20 --session <token>
```

列出结果让用户选择。

### 2. 修改文章

根据用户的修改意见，更新对应字段：

```bash
node cli.mjs update-article \
  --column-id <id> \
  --article-id <id> \
  --title "<新标题>" \
  --desc "<新摘要>" \
  --content-file <新内容.html> \
  --session <token>
```

只传需要修改的字段，其余字段不传。

### 3. 提交审核

询问是否直接提交审核：

```bash
node cli.mjs update-article \
  --column-id <id> \
  --article-id <id> \
  --status PENDING \
  --session <token>
```
