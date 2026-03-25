# 管理我的文章

**触发**：用户想查看稿件状态或了解有哪些文章。

## 步骤

### 1. 获取所有文章

```bash
node cli.mjs list-articles --column-id <id> --take 50 --session <token>
```

### 2. 按状态分组输出

| 状态 | 含义 | 可执行操作 |
|------|------|-----------|
| DRAFT | 草稿，未提交 | 编辑、提交审核、删除 |
| PENDING | 审核中 | 仅查看 |
| PUBLISHED | 已发布 | 仅查看 |
| REJECTED | 被拒稿 | 编辑后重新提交 |

### 3. 主动提示

如有 REJECTED 状态的文章：
「有 X 篇被拒稿，需要修改后重新提交，需要我帮你处理吗？」→ 参考 workflow-revise
