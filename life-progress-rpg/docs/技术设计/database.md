# 数据设计

> 状态：v0.1 本地数据为实施基线；云端结构是后续参考

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

## 后续云端参考

只有跨设备需求通过验证并完成隐私评审后才启用。

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  nickname VARCHAR(50),
  birthday_year SMALLINT NOT NULL
    CHECK (birthday_year BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE)),
  life_expectancy SMALLINT NOT NULL DEFAULT 80
    CHECK (life_expectancy BETWEEN 1 AND 120),
  show_life_progress BOOLEAN NOT NULL DEFAULT TRUE,
  ai_consent BOOLEAN NOT NULL DEFAULT FALSE,
  analytics_consent BOOLEAN NOT NULL DEFAULT FALSE,
  theme VARCHAR(20) NOT NULL DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE life_records (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  local_date DATE NOT NULL,
  mood SMALLINT NOT NULL CHECK (mood BETWEEN 1 AND 5),
  energy SMALLINT NOT NULL CHECK (energy BETWEEN 0 AND 10),
  content TEXT CHECK (char_length(content) <= 5000),
  tags JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(tags) = 'array'),
  reflection TEXT,
  reflection_source VARCHAR(10) NOT NULL DEFAULT 'none'
    CHECK (reflection_source IN ('rules', 'ai', 'none')),
  reflection_status VARCHAR(20) NOT NULL DEFAULT 'not_requested'
    CHECK (reflection_status IN ('not_requested', 'pending', 'completed', 'failed')),
  reflection_feedback VARCHAR(20)
    CHECK (reflection_feedback IN ('helpful', 'not_helpful', 'inaccurate')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, local_date)
);

CREATE INDEX idx_records_user_date
  ON life_records(user_id, local_date DESC);
CREATE INDEX idx_records_tags
  ON life_records USING GIN(tags);
```

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
