# 申请专栏

**触发**：用户还没有专栏，或主动要求申请新专栏。

## 步骤

### 1. 告知需要准备

- 专栏名称（简洁，体现定位）
- 专栏简介（100-200 字，说明内容方向和更新计划）
- 专栏封面图（本地图片需先上传）
- 相关链接（个人主页、社交媒体，可选但建议填写）

### 2. 上传封面图（如有本地图片）

```bash
node cli.mjs upload-image <file-path> --session <token>
```

### 3. 提交申请

```bash
node cli.mjs apply-column \
  --name "<专栏名称>" \
  --desc "<专栏简介>" \
  --picture <cover-url> \
  --links "https://twitter.com/xxx,https://..." \
  --session <token>
```

### 4. 告知结果

说明申请已提交，审核通常需要几个工作日，通过后即可开始发稿。
