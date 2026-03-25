# 热门活动

**触发**：用户想了解加密行业活动、峰会、黑客松、路演等线下或线上活动。
常见说法："最近有哪些活动"、"有没有新加坡的峰会"、"有什么黑客松"、"有哪些免费活动"。

## 步骤

### 1. 列出或搜索活动

```bash
node cli.mjs list-events [--search "<关键词>"] [--category <类型>] [--country <国家代码>] [--online true|false] [--paid false] [--take 15] --lang <lang>
```

**活动类型（category）**：
| 值 | 含义 |
|---|---|
| SUMMIT | 峰会 |
| TECH_SEMINAR | 技术研讨会 |
| LECTURE_SALON | 讲座沙龙 |
| COCKTAIL_SOCIAL | 社交活动 |
| ROADSHOW | 路演 |
| HACKATHON | 黑客松 |
| EXHIBITION | 展览 |
| COMPETITION | 竞赛 |
| OTHER | 其他 |

**国家/地区代码（country）**：AE CA CH CN DE FR GB JP KR SG TH TR US VN OTHER

### 2. 查看活动详情

活动列表已包含完整信息（地点、时间、是否线上、是否付费、票价、链接、话题标签）。
如需了解更多，引导用户通过 `url` 字段访问原始链接。

## 输出要求

- 列出活动时附上时间、地点、类型等关键信息
- 标注是否免费（isPaid=false）、是否线上（isOnline=true）
- 如有票价信息，一并展示
- 不对活动的价值或质量做评价
