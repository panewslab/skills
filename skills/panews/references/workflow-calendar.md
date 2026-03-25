# 事件日历

**触发**：用户想查看加密行业近期重要事件、项目里程碑、宏观经济日程等日历条目。
常见说法："最近有哪些重要事件"、"本月有什么大事"、"有没有关于 XX 的日程"。

事件日历（calendar）与热门活动（events）的区别：
- 事件日历 → 编辑整理的重要事件节点，涵盖项目发布、政策节点、宏观数据发布等
- 热门活动 → 行业活动报名信息，如峰会、黑客松、路演

## 步骤

### 1. 列出日历事件

```bash
node cli.mjs list-calendar-events [--search "<关键词>"] [--start-from <YYYY-MM-DD>] [--order asc|desc] [--take 20] --lang <lang>
```

默认按 `startAt` 升序（即最近的事件优先）排列，方便浏览即将发生的事件。

如需过去事件，传入 `--order desc`。

### 2. 过滤特定日期范围

```bash
node cli.mjs list-calendar-events --start-from 2025-01-01 --order asc --take 20 --lang <lang>
```

## 输出要求

- 按日期排列，便于用户了解时间线
- 标注每个事件的日期、标题、分类
- 如关联了文章或活动，附上对应标题
- 如有外部链接，一并展示
