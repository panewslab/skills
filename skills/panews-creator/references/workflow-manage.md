# Manage My Articles

**Trigger**: User wants to check submission status or see their articles.

## Steps

### 1. Fetch all articles

```bash
node cli.mjs list-articles --column-id <id> --take 50 --session <token>
```

### 2. Group output by status

| Status | Meaning | Available actions |
|--------|---------|------------------|
| DRAFT | Draft, not yet submitted | Edit, submit for review, delete |
| PENDING | Under review | View only |
| PUBLISHED | Published | View only |
| REJECTED | Rejected | Edit and resubmit |

### 3. Proactively prompt

If there are REJECTED articles:
"You have X rejected article(s). Would you like me to help revise and resubmit?" → see [workflow-revise](./workflow-revise.md)
