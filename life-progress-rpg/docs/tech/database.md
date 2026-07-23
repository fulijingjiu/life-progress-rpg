# 数据库设计

> 数据模型、索引、查询优化

## 一、ER 图

```
┌─────────────┐       ┌─────────────┐
│    users    │       │ achievements│
├─────────────┤       ├─────────────┤
│ id (PK)     │───┐   │ id (PK)     │
│ nickname    │   │   │ user_id (FK)│
│ birthday    │   │   │ type        │
│ theme       │   └───│ title       │
│ created_at  │       │ unlocked_at │
└─────────────┘       └─────────────┘
        │                     │
        │                     │
        │              ┌──────┴──────┐
        │              │             │
┌───────┴───────┐ ┌───┴────┐ ┌─────┴─────┐
│ life_records  │ │milestones│ │ai_convers│
├───────────────┤ ├─────────┤ ├──────────┤
│ id (PK)       │ │ id (PK) │ │ id (PK)  │
│ user_id (FK)  │ │user_id  │ │ user_id  │
│ record_date   │ │age_target│ │session_id│
│ content       │ │ title   │ │ role     │
│ mood (1-10)   │ │is_unlock│ │ content  │
│ energy (0-10) │ └─────────┘ │ context  │
│ category      │             └──────────┘
│ tags (JSONB)  │
│ ai_summary    │
└───────────────┘
```

---

## 二、表结构

### 2.1 用户表 (users)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR(50) NOT NULL,
  birthday_year INT NOT NULL,  -- 只存年份，保护隐私
  life_expectancy INT DEFAULT 80,
  theme VARCHAR(20) DEFAULT 'default',
  avatar_url TEXT,
  sound_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_users_created_at ON users(created_at);
```

### 2.2 人生记录表 (life_records)

```sql
CREATE TABLE life_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  content TEXT,
  mood INT CHECK (mood >= 1 AND mood <= 10),
  energy INT CHECK (energy >= 0 AND energy <= 10),
  category VARCHAR(30),
  tags JSONB DEFAULT '[]',
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束：每人每天只能有一条记录
  UNIQUE(user_id, record_date)
);

-- 索引
CREATE INDEX idx_records_user_date ON life_records(user_id, record_date);
CREATE INDEX idx_records_date ON life_records(record_date);
CREATE INDEX idx_records_category ON life_records(category);
CREATE INDEX idx_records_mood ON life_records(mood);
```

### 2.3 成就表 (achievements)

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  is_new BOOLEAN DEFAULT true,
  
  UNIQUE(user_id, achievement_type)
);

CREATE INDEX idx_achievements_user ON achievements(user_id);
```

### 2.4 AI 对话表 (ai_conversations)

```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  context_type VARCHAR(30) DEFAULT 'general',
  related_record_id UUID REFERENCES life_records(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_session ON ai_conversations(session_id);
CREATE INDEX idx_conversations_user ON ai_conversations(user_id);
```

### 2.5 里程碑表 (milestones)

```sql
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  age_target INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_milestones_user ON milestones(user_id);
```

---

## 三、查询示例

### 3.1 用户基础信息 + 今日记录

```sql
SELECT 
  u.id,
  u.nickname,
  u.birthday_year,
  u.theme,
  DATE_PART('year', AGE(NOW(), make_date(u.birthday_year, 1, 1))) as age,
  r.mood,
  r.energy,
  r.content
FROM users u
LEFT JOIN life_records r ON r.user_id = u.id AND r.record_date = CURRENT_DATE
WHERE u.id = $1;
```

### 3.2 连续记录天数

```sql
WITH RECURSIVE streak AS (
  SELECT 
    user_id,
    record_date,
    1 as streak,
    record_date as streak_start
  FROM life_records
  WHERE record_date = CURRENT_DATE - INTERVAL '1 day'
  
  UNION ALL
  
  SELECT 
    r.user_id,
    r.record_date,
    s.streak + 1,
    CASE 
      WHEN r.record_date = s.record_date - INTERVAL '1 day' 
      THEN s.streak_start 
      ELSE r.record_date 
    END
  FROM life_records r
  JOIN streak s ON r.user_id = s.user_id 
    AND r.record_date = s.record_date - INTERVAL '1 day'
)
SELECT MAX(streak) as max_streak
FROM streak
WHERE user_id = $1;
```

### 3.3 周报统计

```sql
SELECT 
  DATE_TRUNC('week', record_date) as week,
  AVG(mood)::DECIMAL(2,1) as avg_mood,
  AVG(energy)::DECIMAL(2,1) as avg_energy,
  COUNT(*) as total_records,
  jsonb_object_agg(category, COUNT(*)) as category_count
FROM life_records
WHERE user_id = $1 
  AND record_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE_TRUNC('week', record_date);
```

### 3.4 AI 上下文查询

```sql
SELECT 
  content,
  role,
  created_at
FROM ai_conversations
WHERE user_id = $1 
  AND session_id = $2
ORDER BY created_at ASC
LIMIT 50;
```

---

## 四、JSONB 查询

### 4.1 标签查询

```sql
-- 查找包含特定标签的记录
SELECT * FROM life_records
WHERE user_id = $1
  AND $2 = ANY(tags);
```

### 4.2 多标签查询

```sql
-- 查找同时包含多个标签的记录
SELECT * FROM life_records
WHERE user_id = $1
  AND tags @> '["工作", "学习"]'::jsonb;
```

---

## 五、数据库选择理由

| 数据库 | 用途 | 选择理由 |
|--------|------|----------|
| PostgreSQL | 主数据库 | 支持 JSONB（灵活存储标签/配置），事务强，适合游戏化系统的复杂查询 |
| Redis | 缓存 + 会话 | 高频读取的排行榜、用户在线状态、AI 对话限流 |
| (可选) MongoDB | 日志/埋点 | 如果记录量极大，可用 MongoDB 存原始行为日志 |

---

## 六、性能优化

### 6.1 常用查询缓存

```typescript
// Redis 缓存策略
const CACHE_TTL = {
  user_profile: 60 * 60,      // 1 小时
  today_record: 60,           // 1 分钟
  weekly_stats: 5 * 60,      // 5 分钟
  achievements: 60 * 60,      // 1 小时
};
```

### 6.2 分页查询

```sql
-- 分页获取记录
SELECT * FROM life_records
WHERE user_id = $1
ORDER BY record_date DESC
LIMIT $2 OFFSET $3;
```

### 6.3 连接池

```typescript
// Prisma 连接池配置
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=10&pool_timeout=20',
    },
  },
});
```

---

[返回技术目录](./README.md) | [返回项目根目录](../README.md)
