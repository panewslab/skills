# 发布新文章

**触发**：用户想把一篇文章发布到 PANews。

## 步骤

### 0. （可选）发布前调研

如果 panews skill 已安装，可在发布前搜索同类文章，帮用户找到差异化角度：

```bash
node {panews}/scripts/cli.mjs search-articles "<文章主题>" --take 3
```

如果 panews 未安装，跳过此步骤。

### 1. 验证身份并确认专栏

```bash
node cli.mjs validate-session --session <token>
```

从结果中取专栏列表：
- 只有 1 个专栏 → 默认使用，告知用户
- 多个专栏 → 列出让用户选择
- 没有专栏 → 说明需先申请，参考 [workflow-apply-column](./workflow-apply-column.md)

### 2. 收集文章信息

与用户确认以下字段（已提供则跳过）：

| 字段 | 必填 | 说明 |
|------|------|------|
| 标题 | 是 | 建议 20 字以内 |
| 摘要 | 是 | 50-100 字 |
| 正文 | 是 | Markdown 文件路径 |
| 封面图 | 建议 | 本地图片先上传，或提供 CDN URL |
| 标签 | 否 | 最多 5 个 tag ID |
| 语言 | 否 | 默认 zh |

不替用户生成正文内容。如果用户只有主题，先问正文是否已经写好。

### 3. 处理封面图（如有本地图片）

```bash
node cli.mjs upload-image <file-path> --session <token>
```

输出的 URL 填入 `--cover`。

### 4. 处理标签（可选）

```bash
node cli.mjs search-tags "<关键词>" --session <token>
```

展示结果让用户选择 tag ID。

### 5. 创建文章（先存草稿）

```bash
node cli.mjs create-article \
  --column-id <id> \
  --title "<标题>" \
  --desc "<摘要>" \
  --content-file <file.md> \
  --lang <lang> \
  --cover <url> \
  --tags <id1,id2> \
  --status DRAFT \
  --session <token>
```

### 6. 确认并提交

展示摘要（标题、摘要、标签、所属专栏），询问：
- 直接提交审核 → 重新调用 `create-article --status PENDING`，或用 `update-article --status PENDING`
- 先保存草稿 → 完成，告知文章 ID
