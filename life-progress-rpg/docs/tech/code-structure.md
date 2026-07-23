# 前端代码结构与技术栈边界

> 状态：v0.1 实施规范
> 适用范围：目录、模块依赖、命名、状态、持久化、远程请求和测试
> 当前仓库尚无 `src/`；创建源码时必须从本文结构开始

## 1. 结构原则

采用：

- **按业务能力组织 Feature**
- **用 Domain 保存纯业务规则**
- **用 Data 隔离 Dexie 和导入导出**
- **用 Services 隔离外部服务**
- **用 Shared 保存真正通用的 UI 和工具**
- **按垂直切片逐步交付**

不采用：

- 按 `pages/components/utils` 平铺全部代码
- 一个全局 Store 保存所有数据
- 页面直接操作 IndexedDB
- React 组件内部计算日期、进度、统计或回应
- 为 v0.1 建设微服务、插件系统或通用工作流引擎
- 先创建大量空目录和占位文件

## 2. 技术栈职责

| 技术 | 在项目中的职责 | 禁止或限制 |
|------|----------------|------------|
| React 18 | 页面、组件、组合交互 | 不承载持久化和统计算法 |
| React Router 6 | 路由和页面级懒加载 | 不在组件中散落路径字符串 |
| TypeScript strict | 模型、边界契约和穷尽检查 | 核心代码不用 `any` 和非空断言逃避校验 |
| Vite 5 | 前端开发、构建、环境注入 | `VITE_*` 不保存供应商密钥 |
| Zustand 4 | 短生命周期 UI/流程状态 | 不复制 Dexie 中的完整记录集合 |
| TanStack Query 5 | 服务端请求状态、重试和取消 | 不用于 IndexedDB；Query Key 不放正文 |
| Dexie 3 | IndexedDB Schema、事务、索引和迁移 | 页面和基础组件不得直接导入 |
| dexie-react-hooks | 订阅必要的本地查询 | 只通过数据层公开的查询使用 |
| date-fns | 显示格式化和明确的日期运算 | 不用 `toISOString().slice(0, 10)` 生成本地日期 |
| Tailwind CSS 3 | 布局、响应式和设计 Token | 不堆叠随意值，不复制长串类名 |
| Framer Motion 10 | 有状态含义的局部动效 | 不阻塞操作，必须支持 Reduce Motion |
| Vitest 1 | 单元、组件和集成测试 | 不用快照代替核心行为断言 |
| Recharts | 后续周期证据图表 | v0.1 没有已批准使用场景 |
| html2canvas | 后续用户主动分享 | v0.1 不使用 |
| vite-plugin-pwa | 后续 PWA 安装和缓存 | 未设计更新/迁移策略前不启用 |

已安装不代表必须使用。没有当前验收项的依赖不得为了“技术栈完整”进入代码路径。

## 3. 目标目录

只在对应切片开始时创建需要的目录：

```text
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
├── features/
│   ├── onboarding/
│   ├── life-progress/
│   ├── daily-record/
│   ├── reflection/
│   ├── history/
│   ├── settings/
│   └── data-management/
├── domain/
│   ├── records/
│   ├── progress/
│   ├── reflection/
│   ├── settings/
│   └── dates/
├── data/
│   ├── db/
│   ├── repositories/
│   └── import-export/
├── services/
│   └── ai/
├── shared/
│   ├── ui/
│   ├── feedback/
│   ├── lib/
│   ├── styles/
│   └── types/
├── test/
│   ├── factories/
│   ├── fixtures/
│   └── setup.ts
├── main.tsx
└── vite-env.d.ts
```

可选的真实 AI 代理不放在浏览器 `src/` 中。只有确定生产运行环境后才创建：

```text
server/
├── api/
│   └── reflections.ts
├── ai/
│   ├── provider.ts
│   ├── prompt.ts
│   └── safety.ts
├── middleware/
│   ├── rate-limit.ts
│   └── request-id.ts
└── schemas/
    └── reflection.ts
```

`server/` 必须拥有明确的运行入口、环境变量校验、独立 TypeScript 构建和部署方式。不能创建一组无法由 `npm run build` 或正式部署流程执行的孤立文件。

## 4. App 层

`src/app/` 只负责应用组合：

- Router
- 全局 Provider
- 错误边界
- 全局布局
- Feature 的组装

示例：

```typescript
// src/app/router.tsx
export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/onboarding', element: <OnboardingPage /> },
  { path: '/history', element: <HistoryPage /> },
  { path: '/settings', element: <SettingsPage /> },
]);
```

路由路径集中定义。页面可以来自 Feature，但 `app` 不实现业务计算。

`providers.tsx` 只注册确实需要的 Provider。不要为了可能使用而提前加入 QueryClient、主题或全局状态 Provider。

## 5. Feature 层

每个 Feature 表达一个用户能力，而不是一个技术类型。

建议内部结构：

```text
features/daily-record/
├── components/
│   ├── RecordSheet.tsx
│   ├── MoodSelector.tsx
│   └── EnergySlider.tsx
├── hooks/
│   └── useSaveRecord.ts
├── model/
│   ├── record-form.ts
│   └── record-form.store.ts
├── pages/
│   └── DailyRecordPage.tsx
├── daily-record.test.tsx
└── index.ts
```

规则：

- `components/` 只放该 Feature 私有组件。
- `hooks/` 组合 Domain、Repository 和 Service。
- `model/` 只保存表单或流程状态，不复制持久化数据库。
- `pages/` 只在该 Feature 独立占用路由时创建。
- `index.ts` 是对外公开入口；其他模块不深层导入内部文件。
- 小 Feature 不必机械创建全部子目录。

页面职责：

```text
读取当前状态
  → 渲染组件
  → 调用 Feature Hook
  → 展示成功、错误和恢复
```

页面不负责：

- 构造 IndexedDB 事务
- 计算本地日期
- 生成内容回应
- 拼装 AI Prompt
- 解析导入文件

## 6. Domain 层

`src/domain/` 必须是与 React、Dexie、Router 和浏览器 UI 解耦的纯 TypeScript。

示例：

```text
domain/reflection/
├── reflection.types.ts
├── select-reflection-focus.ts
├── generate-local-reflection.ts
├── reflection-feedback.ts
└── generate-local-reflection.test.ts
```

应放入 Domain：

- `LifeRecord`、`UserSettings` 等核心类型
- 字段范围和业务不变量
- 本地日期规则
- 估算进度计算
- 同日更新规则
- 当日回应焦点选择和本地模板
- 回应反馈状态转换
- 后续周期分析的样本门槛与证据计算

函数优先设计为：

```typescript
type DomainResult<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

核心规则使用判别联合表达错误，不用抛出无法分类的字符串异常。

Domain 测试不需要渲染 React，也不需要真实 IndexedDB。

## 7. Data 层

### 7.1 Dexie

```text
data/db/
├── app-db.ts
├── schema.ts
├── migrations/
│   ├── v1.ts
│   └── migration.test.ts
└── test-db.ts
```

`app-db.ts` 是生产数据库唯一创建位置。表名、索引和版本不在 Feature 中重复声明。

### 7.2 Repository

```typescript
export interface RecordRepository {
  getByLocalDate(userId: string, localDate: string): Promise<LifeRecord | undefined>;
  listRecent(userId: string, limit: number): Promise<LifeRecord[]>;
  saveForLocalDate(record: LifeRecord): Promise<LifeRecord>;
  delete(id: string): Promise<void>;
}
```

Feature 通过 Repository 使用持久化。Repository 负责：

- Dexie 查询
- 唯一索引
- 事务
- 持久化数据的运行时校验
- 数据层错误映射

不要为了接口纯度建立复杂依赖注入容器。可在模块中导出默认实现，并在测试中显式传入内存实现。

### 7.3 导入导出

`data/import-export/` 负责：

- 版本化导出格式
- 文件大小限制
- JSON 解析和运行时 Schema 校验
- 导入预览
- 单事务写入
- 冲突策略

解析、校验和写入分开测试。组件只接收预览或结果。

## 8. Zustand 状态边界

适合 Zustand：

- 引导当前步骤和未提交输入
- 记录 Sheet 是否打开
- 表单草稿
- 用户尚未确认的 UI 选择
- 跨少量兄弟组件的短生命周期状态

不适合 Zustand：

- 完整历史记录集合
- 数据库的第二份长期副本
- 可以从记录计算出的统计
- AI 供应商响应缓存
- Router 已经表达的页面状态

命名：

```text
useOnboardingStore
useRecordDraftStore
```

Store 必须提供动作，不允许组件到处直接修改内部对象。持久化由 Repository 完成，不使用 Zustand persistence 替代 Dexie。

## 9. TanStack Query 边界

只在真实服务端请求需要缓存、取消、重试或失效语义时使用。

v0.1 可能的唯一场景是可选 AI 文字整理：

```text
features/reflection/hooks/useAiReflection.ts
  → services/ai/reflection-client.ts
  → POST /api/reflections
```

要求：

- 本地记录先保存，不等待 Mutation。
- Mutation 失败保留本地回应。
- 重试次数有限，4xx 和安全拒绝不自动重试。
- Query/Mutation Key 只使用记录 ID 或请求 ID，不放日记正文。
- 组件卸载或用户取消时中止网络请求。

Dexie 数据使用 Repository 和必要的 `useLiveQuery`，不经过 QueryClient 再缓存一次。

## 10. AI Service

```text
services/ai/
├── reflection-client.ts
├── reflection.schema.ts
├── reflection.errors.ts
└── reflection-client.test.ts
```

浏览器 Service 只负责：

- 构造允许字段
- 调用同源 `/api/reflections`
- 超时和取消
- 解析结构化响应
- 映射稳定错误类型

不能包含：

- 供应商 API Key
- 可由用户修改的系统 Prompt
- 供应商模型选择
- 周期统计计算
- 日记正文日志

内容事实选择位于 Domain，服务端 Prompt 和供应商适配位于可部署的 `server/`。

## 11. Shared 层

可以进入 `shared/`：

- `Button`、`Input`、`Sheet`、`Modal`
- `LoadingState`、`EmptyState`、`ErrorState`
- 通用 `Result`、受控 ID、无业务语义的格式化工具
- 全局 CSS、Focus 和 Reduce Motion 基线

不能进入 `shared/`：

- `LifeProgressCard`
- `ReflectionCard`
- `RecordHistoryItem`
- 含心情、能量或人生进度语义的函数

判断方法：如果另一个完全不同的产品不会复用它，就优先留在 Feature 或 Domain。

## 12. Tailwind 与样式

建议结构：

```text
shared/styles/
├── globals.css
├── tokens.css
└── utilities.css
```

- 品牌色、语义色、间距、圆角和阴影通过 `tailwind.config.js` 或 CSS 变量统一维护。
- 组件使用语义 Token，不在 JSX 中散落十六进制颜色。
- 重复三次以上的稳定样式才提取组件或样式工具。
- `clsx` 用于有限条件组合，不构建动态字符串让 Tailwind 无法扫描。
- Framer Motion 参数集中在相关 Feature 或共享 Motion Token。
- 所有动效提供 Reduce Motion 分支。

当前配置中的游戏字体、发光和慢速弹跳不是默认设计语言；只有质量规范明确需要时才能使用。

## 13. 测试结构

测试优先与被测代码相邻：

```text
generate-local-reflection.ts
generate-local-reflection.test.ts

RecordSheet.tsx
RecordSheet.test.tsx
```

`src/test/` 只放共享设施：

- 固定时间和时区
- `LifeRecord` Factory
- IndexedDB 测试实例
- 网络 Mock
- 通用渲染辅助

最低测试分配：

| 模块 | 必测内容 |
|------|----------|
| Domain | 边界值、错误联合、本地日期、内容事实和防重复 |
| Data | 唯一索引、迁移、事务回滚、导入冲突 |
| Feature | 用户操作、状态切换、错误恢复、无障碍名称 |
| AI Service | 同意、超时、取消、非法输出和回退 |
| App | 首次引导、保存记录、查看历史的核心路径 |

测试文件可以使用 Factory，但必须保留几组真实中文长短内容，不能全部使用 `test`、`foo`。

## 14. 依赖方向

```text
app
  ↓
features
  ├──→ domain
  ├──→ data
  ├──→ services
  └──→ shared

data ─────→ domain
services ─→ domain

domain ───→ 无框架依赖
shared ───→ 无业务依赖
```

禁止：

- `domain` 导入 React、Zustand、Dexie、Router 或 Service。
- `shared` 导入具体 Feature。
- `data` 导入页面或组件。
- Feature 相互深层导入内部文件。
- `services` 直接修改 Zustand Store。
- 通过循环依赖共享状态。

跨 Feature 协作优先通过 Domain 数据、Repository 或 App 组合；不要创建“万能 utils”绕过边界。

## 15. 命名与导入

- React 组件：`PascalCase.tsx`
- Hook：`useSomething.ts`
- Store：`something.store.ts`
- Domain 函数：`kebab-case.ts`
- 类型：`something.types.ts`
- Schema：`something.schema.ts`
- 测试：与源码同名加 `.test.ts(x)`

使用已配置别名：

```typescript
import { generateLocalReflection } from '@/domain/reflection/generate-local-reflection';
```

同目录可以使用相对导入；跨顶层模块使用 `@/`。不建立超过两级的 `../../../`。

## 16. 垂直切片对应模块

| 实施切片 | 主要模块 |
|----------|----------|
| 工程骨架 | `app`、`shared/styles`、`test` |
| 首次引导 | `features/onboarding`、`domain/settings`、Settings Repository |
| 人生进度 | `features/life-progress`、`domain/progress`、`domain/dates` |
| 每日记录 | `features/daily-record`、`domain/records`、Record Repository |
| 当日回应 | `features/reflection`、`domain/reflection`、可选 AI Service |
| 历史记录 | `features/history`、Record Repository |
| 设置 | `features/settings`、`domain/settings`、Settings Repository |
| 数据管理 | `features/data-management`、`data/import-export` |

每个切片同时完成：

```text
Domain 规则
  → Data/Service 边界
  → Feature 交互
  → 成功、空、错误和恢复状态
  → 单元/集成测试
  → 响应式和无障碍复核
```

不要先创建所有页面，再统一补数据层和测试。

## 17. 新模块检查

创建文件前确认：

1. 它属于用户能力、纯业务、数据、外部服务还是通用 UI？
2. 是否已有模块承担同一职责？
3. 是否引入反向依赖或第二份数据真源？
4. 是否真的需要 Zustand、Query 或新依赖？
5. 是否能在不渲染 React 的情况下测试核心规则？
6. 是否包含当前版本未批准的能力？
7. 是否同时设计失败、离线、取消和恢复？

[返回技术目录](./README.md) | [返回文档中心](../README.md)
