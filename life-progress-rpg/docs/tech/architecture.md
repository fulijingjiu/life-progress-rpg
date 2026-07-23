# 系统架构

> 整体技术架构设计

## 一、架构概述

### 1.1 设计原则

| 原则 | 说明 |
|------|------|
| 高可用 | 多节点部署，自动故障转移 |
| 可扩展 | 水平扩展，支持高并发 |
| 安全性 | 全站 HTTPS，数据加密 |
| 可维护 | 模块化设计，清晰边界 |
| 性能优先 | 缓存优先，减少延迟 |

### 1.2 整体架构

```
┌─────────────────────────────────────────────────────┐
│                      用户层                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────┐│
│  │ Web App │  │  微信   │  │  PWA   │  │ iOS   ││
│  │ (React) │  │  小程序  │  │ 桌面端  │  │ App  ││
│  └────┬────┘  └────┬────┘  └────┬────┘  └───┬───┘│
└───────┼────────────┼────────────┼────────────┼──────┘
        │            │            │            │
        └────────────┴────────────┴────────────┘
                          │
                  ┌───────┴───────┐
                  │  API Gateway  │
                  │   (Nginx)     │
                  └───────┬───────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────┴────┐      ┌────┴────┐      ┌────┴────┐
   │用户服务  │      │记录服务  │      │AI对话服务│
   │ (Auth)  │      │ (CRUD)  │      │(Stream) │
   └────┬────┘      └────┬────┘      └────┬────┘
        │                 │                 │
        └────────┬────────┴────────┬────────┘
                 │                 │
         ┌───────┴───────┐ ┌──────┴──────┐
         │  PostgreSQL   │ │    Redis     │
         │  (主数据库)   │ │   (缓存)     │
         └───────────────┘ └──────────────┘
```

---

## 二、核心模块

### 2.1 模块职责

| 模块 | 职责 | 技术栈 |
|------|------|--------|
| API Gateway | 请求路由、负载均衡、限流 | Nginx |
| 用户服务 | 注册/登录/档案管理 | Node.js + Express |
| 记录服务 | 每日记录 CRUD | Node.js + Express |
| AI 对话服务 | AI 对话、流式输出 | Node.js + Socket.io |
| 任务调度 | 定时任务、周报推送 | Bull + Redis |

### 2.2 服务通信

```typescript
// 服务间通信 - 使用 gRPC 或 REST
interface UserService {
  getUser(id: string): Promise<User>;
  validateToken(token: string): Promise<boolean>;
}

interface RecordService {
  createRecord(userId: string, data: RecordData): Promise<Record>;
  getRecords(userId: string, dateRange: DateRange): Promise<Record[]>;
}

interface AIService {
  generateInsight(userId: string, record: Record): Promise<Insight>;
  chat(sessionId: string, message: string, context: Context): Promise<Stream>;
}
```

---

## 三、数据流设计

### 3.1 用户请求流程

```
用户操作 → 前端请求 → API Gateway → 业务服务 → 数据库/缓存
    ↓
前端渲染 → 用户看到结果
```

### 3.2 记录提交流程

```
用户提交记录 → 前端校验 → POST /api/records
    ↓
记录服务保存数据 → 触发 AI 分析
    ↓
AI 服务生成洞察 → 推送 WebSocket → 前端展示
    ↓
生成周报/月报（定时任务）
```

### 3.3 AI 对话流程

```
用户发送消息 → 前端 → WebSocket 连接
    ↓
后端接收消息 → 组装 Prompt（含用户上下文）
    ↓
调用 AI API（OpenAI/Claude）→ 流式响应
    ↓
WebSocket 推送 → 前端逐字显示
    ↓
对话结束 → 保存到数据库
```

---

## 四、技术选型

### 4.1 前端技术栈

| 技术 | 用途 | 选择理由 |
|------|------|----------|
| React 18 | UI 框架 | 生态成熟，组件化 |
| TypeScript | 类型安全 | 减少错误 |
| Tailwind CSS | 样式 | 快速开发 |
| Framer Motion | 动画 | 进度条、徽章动效 |
| Zustand | 状态管理 | 轻量，适合小游戏 |
| React Query | 数据获取 | 缓存、自动刷新 |
| Socket.io Client | 实时通信 | AI 流式输出 |
| html2canvas | 截图 | 分享卡片生成 |
| Recharts | 图表 | 数据可视化 |

### 4.2 后端技术栈

| 技术 | 用途 | 选择理由 |
|------|------|----------|
| Node.js | 运行时 | 轻量、高并发 |
| Express/Koa | Web 框架 | 简单、灵活 |
| Socket.io | 实时通信 | AI 流式对话 |
| Prisma | ORM | 类型安全、迁移方便 |
| Bull | 任务队列 | 定时任务、周报 |
| JWT | 认证 | 无状态、可扩展 |

### 4.3 数据库

| 数据库 | 用途 | 选择理由 |
|--------|------|----------|
| PostgreSQL | 主数据库 | 支持 JSONB，事务强 |
| Redis | 缓存/会话 | 高性能 |
| (可选) MongoDB | 日志 | 大量写入场景 |

### 4.4 AI 服务

| 服务 | 用途 | 备选 |
|------|------|------|
| OpenAI GPT-4 | AI 对话 | Claude API |
| (可选) 国产大模型 | 成本优化 | 百度/阿里 |

---

## 五、部署架构

### 5.1 开发环境

```
本地开发：
- Frontend: localhost:3000
- Backend: localhost:4000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
```

### 5.2 生产环境

```
┌─────────────────────────────────────────────────┐
│                  CDN (静态资源)                    │
└─────────────────────┬─────────────────────────────┘
                      │
┌─────────────────────┴─────────────────────────────┐
│                 Load Balancer                      │
│                  (Nginx)                          │
└──────┬──────────────────────────────┬────────────┘
       │                              │
┌──────┴──────┐               ┌────────┴────────┐
│  Web Server │               │   API Server     │
│  (Vercel)  │               │   (Railway)     │
└─────────────┘               └────────┬────────┘
                                        │
                        ┌───────────────┼───────────────┐
                        │               │               │
                 ┌──────┴──────┐ ┌─────┴─────┐ ┌─────┴─────┐
                 │ PostgreSQL  │ │   Redis   │ │ AI Service│
                 │ (Supabase)  │ │  (Upstash)│ │ (OpenAI) │
                 └─────────────┘ └───────────┘ └───────────┘
```

### 5.3 容器化（可选）

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - redis
    
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: life_rpg
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    
  redis:
    image: redis:7
```

---

## 六、安全设计

### 6.1 认证授权

```typescript
// JWT Token 结构
interface JWTPayload {
  userId: string;
  nickname: string;
  iat: number;
  exp: number;
}

// 权限层级
enum Permission {
  READ_RECORD = 'read_record',
  WRITE_RECORD = 'write_record',
  READ_DATA = 'read_data',
  MANAGE_ACHIEVEMENT = 'manage_achievement',
}
```

### 6.2 数据安全

| 措施 | 说明 |
|------|------|
| HTTPS | 全站加密传输 |
| 密码加密 | bcrypt + salt |
| SQL 注入防护 | Prisma ORM |
| XSS 防护 | React 默认防护 + CSP |
| CSRF 防护 | SameSite Cookie |
| 速率限制 | API 限流 |
| 数据脱敏 | 生日仅存年份 |

---

## 七、监控与日志

### 7.1 监控指标

| 类别 | 指标 |
|------|------|
| 业务 | DAU、MAU、留存率 |
| 技术 | 请求量、错误率、响应时间 |
| AI | API 调用量、成本、延迟 |
| 基础设施 | CPU、内存、磁盘 |

### 7.2 日志设计

```typescript
// 统一日志格式
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  service: string;
  action: string;
  userId?: string;
  duration?: number;
  metadata?: Record<string, any>;
}
```

---

[返回技术目录](./README.md) | [返回项目根目录](../README.md)
