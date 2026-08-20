# 数据设计

> 状态：v0.1 本地数据为实施基线；云端数据库已立项，正式实施结构以[云端数据库与 AI 架构](./云端数据库与AI架构.md)为准

## v0.1：IndexedDB

### 表与索引

```typescript
interface UserSettings {
  id: string;
  nickname?: string;
  birthdayYear: number;
  lifeExpectancy: number;
  showLifeProgress: boolean;
  aiConsent: boolean;
  analyticsConsent: boolean;
  theme: string;
  onboardingCompleted: boolean;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
}

interface LifeRecord {
  id: string;
  userId: string;
  localDate: string;
  mood: 1 | 2 | 3 | 4 | 5;
  energy: number;
  content?: string;
  tags: string[];
  reflection?: string;
  reflectionSource: 'rules' | 'ai' | 'none';
  reflectionStatus: 'not_requested' | 'pending' | 'completed' | 'failed';
  reflectionFeedback?: 'helpful' | 'not_helpful' | 'inaccurate';
  createdAt: string;
  updatedAt: string;
}
```

Dexie 索引建议：

```typescript
db.version(1).stores({
  settings: 'id, updatedAt',
  records: 'id, &[userId+localDate], localDate, updatedAt, *tags'
});
```

规则：

- `localDate` 是用户本地时区的 `YYYY-MM-DD`，不能用 UTC 截断代替。
- 心情统一 1～5；能量为整数 0～10。
- `[userId+localDate]` 唯一，确保同一天编辑原记录。
- `reflectionFeedback` 仅评价当前回应；回应内容重新生成或来源变化时必须清空旧反馈。
- 反馈默认只保存在本地；未取得行为分析同意时不得上传。
- 导入数据先做版本、类型、范围和数量校验，再使用单事务写入。
- 每次 schema 升级提供迁移函数和回滚/备份说明。

## 后续云端参考（历史草案）

云端能力已立项，但仍须在 v0.1 可发布并完成隐私、安全评审后启用。以下 SQL 保留为查询示例的上下文，不再作为建库脚本；正式表、Auth 外键、RLS、同步版本和 AI 元数据见[云端数据库与 AI 架构](./云端数据库与AI架构.md)。

建库脚本不在本文重复维护，避免需求变化后出现两套真相。正式设计包含：

- `auth.users` 托管身份；
- `user_settings` 与 `life_records` 业务表；
- 记录版本、删除墓碑和同步游标；
- 所有业务表的 RLS 所有者策略；
- 不保存正文的 `ai_requests` 元数据表。

## 正确查询示例

### 最近记录：游标分页

```sql
SELECT *
FROM life_records
WHERE user_id = $1
  AND ($2::date IS NULL OR local_date < $2)
ORDER BY local_date DESC
LIMIT $3;
```

### 单标签

```sql
SELECT *
FROM life_records
WHERE user_id = $1
  AND tags ? $2;
```

### 周统计

```sql
SELECT
  AVG(mood)::numeric(3,2) AS avg_mood,
  AVG(energy)::numeric(4,2) AS avg_energy,
  COUNT(*) AS record_count
FROM life_records
WHERE user_id = $1
  AND local_date >= $2
  AND local_date < $3;
```

分类/标签计数应先展开再聚合，不能嵌套聚合：

```sql
SELECT tag, COUNT(*) AS uses
FROM life_records r
CROSS JOIN LATERAL jsonb_array_elements_text(r.tags) AS tag
WHERE r.user_id = $1
  AND r.local_date >= $2
  AND r.local_date < $3
GROUP BY tag
ORDER BY uses DESC;
```

## 数据生命周期

| 数据 | v0.1 | 后续云端要求 |
|------|------|--------------|
| 用户设置/记录 | 仅本地，直到用户导出或清空 | 用户可导出、删除；定义备份删除期限 |
| AI 请求正文 | 代理不持久化 | 如需保存必须单独同意并说明期限 |
| 技术日志 | 不含正文和直接身份 | 设置最短必要保留期和访问审计 |
| 分析事件 | 默认关闭 | 明示同意、匿名化、可撤回 |

“HTTPS”不等于存储加密，“只存出生年份”也不等于完成合规。上线云端前必须补充数据清单、处理目的、供应商、保留期、用户权利和安全事件流程。

[返回技术目录](./README.md) | [返回文档中心](../README.md)
