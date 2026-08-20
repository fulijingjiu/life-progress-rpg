# 云端数据库与 AI 架构

更新时间：2026-08-21
状态：设计完成，待实施

对应需求：[云端数据库与 AI 需求](../需求分析/云端数据库与AI需求.md)

## 1. 推荐方案

首期推荐使用 Supabase 提供的 Auth、PostgreSQL、Row Level Security 和 Edge Functions，前端继续使用 React + Dexie。

选择原因：

- 一套托管服务覆盖认证、关系数据库、行级授权和服务端函数。
- PostgreSQL 唯一约束和事务可直接保护“每用户每天一条记录”。
- RLS 可以在数据库层限制用户只能访问自己的数据。
- Edge Function 可以安全保存 AI 供应商密钥并验证登录身份。
- 与现有 Vite 静态前端兼容，不必先维护独立常驻服务器。

官方能力依据：[Auth](https://supabase.com/docs/guides/auth)、[PostgreSQL RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)、[Edge Functions](https://supabase.com/docs/guides/functions)、[函数鉴权](https://supabase.com/docs/guides/functions/auth)。

此方案是当前推荐实现，不把领域模型绑定在 Supabase SDK：领域类型保持独立，远程访问集中在 `src/data/remote` 与 `src/services/ai`。

## 2. 总体架构

```text
┌───────────────────────────────────────────────────┐
│ React Web                                         │
│ UI → Domain → Local Repository(Dexie) → Sync      │
└──────────────┬──────────────────────┬─────────────┘
               │ 登录/CRUD            │ AI recordId
               ▼                      ▼
┌──────────────────────────┐  ┌─────────────────────┐
│ Supabase Auth + API      │  │ Reflection Function │
│ JWT + PostgreSQL RLS     │  │ 鉴权/限流/校验/脱敏 │
└──────────────┬───────────┘  └──────────┬──────────┘
               ▼                         ▼
       PostgreSQL                    AI Provider
```

数据保存和 AI 必须是两条独立链路：数据库同步失败时排队重试；AI 失败时保留本地规则回应。

## 3. 组件职责

| 组件 | 职责 | 不负责 |
| --- | --- | --- |
| React UI | 登录、同步状态、迁移预览、冲突选择、AI 同意 | 不持有高权限密钥 |
| Dexie | 本地即时读写、离线缓存、待同步队列、冲突候选 | 不作为登录用户唯一备份 |
| Sync Engine | 拉取、推送、版本比较、重试、墓碑同步 | 不生成 AI 内容 |
| Supabase Auth | 身份、会话、登录链接 | 不保存业务设置 |
| PostgreSQL | 业务主副本、约束、版本、RLS、事务 | 不直接调用 AI |
| Reflection Function | 鉴权、读取记录、固定 Prompt、限流、调用 AI、输出校验 | 不提供聊天或长期记忆 |
| AI Provider | 受约束的自然语言生成 | 不访问数据库和其他用户记录 |

## 4. 数据库模型

认证账号使用托管 `auth.users`。业务数据放在公开 API 可访问的表中，并为每张表启用 RLS。

### 4.1 用户设置

```sql
create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname varchar(40),
  birthday_year smallint not null,
  life_expectancy smallint not null,
  show_life_progress boolean not null default true,
  ai_consent boolean not null default false,
  analytics_consent boolean not null default false,
  theme varchar(20) not null default 'default',
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (birthday_year between 1900 and extract(year from current_date)),
  check (life_expectancy between 35 and 140),
  check (theme in ('default', 'spring', 'study', 'explore', 'root'))
);
```

### 4.2 每日记录

```sql
create table public.life_records (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  mood smallint not null check (mood between 1 and 5),
  energy smallint not null check (energy between 0 and 10),
  content text check (char_length(content) <= 5000),
  tags jsonb not null default '[]'::jsonb check (jsonb_typeof(tags) = 'array'),
  reflection text check (char_length(reflection) <= 500),
  reflection_source varchar(10) not null default 'rules',
  reflection_status varchar(20) not null default 'completed',
  reflection_feedback varchar(20),
  version integer not null default 1,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_date),
  check (reflection_source in ('rules', 'ai', 'none')),
  check (reflection_status in ('not_requested', 'pending', 'completed', 'failed')),
  check (reflection_feedback is null or reflection_feedback in ('helpful', 'not_helpful', 'inaccurate'))
);

create index life_records_user_updated_idx
  on public.life_records (user_id, updated_at, id);
```

`deleted_at` 是同步墓碑。后台清理任务只在恢复窗口结束后物理删除；首期可使用每日定时 SQL，无需消息队列。

### 4.3 AI 请求元数据

```sql
create table public.ai_requests (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  record_id uuid not null references public.life_records(id) on delete cascade,
  prompt_version varchar(30) not null,
  model_key varchar(50) not null,
  status varchar(20) not null,
  safety varchar(20),
  input_tokens integer,
  output_tokens integer,
  latency_ms integer,
  error_code varchar(50),
  created_at timestamptz not null default now(),
  unique (user_id, id)
);
```

该表不保存记录正文、完整 Prompt 或完整 AI 回复。`model_key` 是内部配置名，不存供应商密钥。

## 5. RLS 授权

所有业务表先启用 RLS：

```sql
alter table public.user_settings enable row level security;
alter table public.life_records enable row level security;
alter table public.ai_requests enable row level security;
```

用户设置和记录的 CRUD 策略使用同一所有者条件：

```sql
create policy "read own records"
on public.life_records for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "insert own records"
on public.life_records for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "update own records"
on public.life_records for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "delete own records"
on public.life_records for delete
to authenticated
using ((select auth.uid()) = user_id);
```

实际迁移必须为设置表建立同等策略。`ai_requests` 默认不开放客户端写入，只由函数写入；浏览器永远不能获得 service key。

## 6. 本地模型扩展

现有 `LifeRecord` 业务字段不改含义，本地数据库新增同步元数据：

```typescript
type SyncState = 'local' | 'pending' | 'synced' | 'failed' | 'conflict';

interface SyncMetadata {
  syncState: SyncState;
  serverVersion?: number;
  serverUpdatedAt?: string;
  deletedAt?: string;
}

interface SyncMutation {
  id: string;
  entity: 'settings' | 'record';
  entityId: string;
  operation: 'upsert' | 'delete';
  baseVersion?: number;
  createdAt: string;
  attempts: number;
}
```

只新增一个 `syncMutations` Dexie 表，不为每种实体建立独立队列。

## 7. 同步算法

### 7.1 保存

```text
表单校验
  → IndexedDB 单事务写记录 + 同步队列
  → 页面立即成功
  → 在线时触发后台同步
```

### 7.2 推送

- 同一 `mutation.id` 必须幂等。
- 客户端携带 `baseVersion`。
- 服务端仅在版本一致时写入，并把 `version + 1`。
- 版本不一致返回冲突，不能自动覆盖日记正文。
- 成功后删除对应本地队列项并保存服务端版本。

原子版本比较优先使用 PostgreSQL 函数/RPC 完成，不在浏览器中“先查再写”。

### 7.3 拉取

```text
按 (updated_at, id) 游标拉取
  → 本地没有待修改：覆盖本地缓存
  → 本地有待修改且 baseVersion 相同：先推送
  → 本地有待修改且版本不同：标记 conflict
```

首期数据量小，分页每次 100 条即可；不引入实时订阅。用户主动刷新、登录、保存成功和网络恢复时触发同步。

### 7.4 删除

- 客户端本地隐藏记录并排队 `delete`。
- 服务端设置 `deleted_at` 和新版本，而不是立即物理删除。
- 其他设备拉到墓碑后删除本地可见记录。
- 用户撤销删除时创建更高版本；超过恢复窗口后定时物理清理。

## 8. 首次迁移

1. 登录并拉取云端数据。
2. 读取当前 `local-user` 的设置和记录。
3. 以 `localDate` 比对，生成“仅本地、仅云端、完全相同、冲突”预览。
4. 用户确认后在本地事务中生成同步队列，不直接清除本地数据。
5. 推送成功并完成一次回读校验后，切换到账号 UUID。
6. 保留一次 JSON 迁移前备份入口，迁移失败可回到原本地数据。

## 9. AI 请求链路

```text
本地记录保存
  → 记录同步成功
  → POST Reflection Function { requestId, recordId }
  → 验证 JWT 与 aiConsent
  → 按 auth.uid() 读取记录
  → 用户额度 + 幂等检查
  → 构建固定 Prompt
  → AI Provider
  → JSON / 长度 / 事实 / 安全校验
  → 更新记录 reflection 字段与版本
  → 返回结果并同步本地缓存
```

函数不接受客户端传入的用户 ID、模型、系统 Prompt、供应商密钥或任意历史上下文。

推荐接口：

```http
POST /functions/v1/reflections
Authorization: Bearer <user-jwt>
Content-Type: application/json

{"requestId":"uuid","recordId":"uuid"}
```

稳定错误码至少包含：`UNAUTHENTICATED`、`AI_NOT_CONSENTED`、`RECORD_NOT_FOUND`、`RATE_LIMITED`、`PROVIDER_TIMEOUT`、`INVALID_OUTPUT`、`SAFETY_BLOCKED`。

前端对这些错误统一保留本地回应，仅展示可理解状态；不得把供应商原始错误直接显示给用户。

## 10. 配置与密钥

前端可公开配置：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

服务端秘密配置：

- AI 供应商 API Key
- 服务端内部模型和 Prompt 版本
- 日额度和月度费用停止线

Supabase secret/service key 不能进入 `VITE_*`、Git 仓库、浏览器日志或错误上报。

## 11. 测试策略

| 层级 | 必测内容 |
| --- | --- |
| SQL | 表约束、唯一日期、版本更新、墓碑、RLS 用户隔离 |
| 单元 | 同步状态机、冲突判定、迁移预览、AI 输入输出解析 |
| 集成 | 登录、批量推拉、幂等、版本冲突、账号删除 |
| Playwright | 两个浏览器上下文跨设备同步、离线重连、首次迁移和冲突选择 |
| AI 评测 | 空内容、长文本、矛盾字段、注入、敏感内容、超时与非法输出 |

生产前必须有“用户 A 使用公开客户端密钥无法读取、修改或删除用户 B 数据”的自动化测试。

## 12. 运维与成本

首期只监控：

- 登录、同步和 AI 请求成功率与 P95 延迟。
- 同步队列积压、冲突数、AI 回退率。
- AI token 用量、单次估算成本、单用户日额度和月度总额。
- 数据库容量、备份状态和恢复演练结果。

达到真实容量瓶颈前不增加缓存和队列。供应商故障时关闭 AI 功能开关即可，记录与同步继续工作。

## 13. 方案边界

Supabase 是最短实施路径，不是不可替换依赖。若未来因地区合规、成本或自托管要求迁移，可保留 PostgreSQL 表和领域模型，仅替换认证适配器、远程仓储和函数部署。

[返回技术目录](./README.md) | [返回文档中心](../README.md)
