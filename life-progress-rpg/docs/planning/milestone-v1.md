# MVP 规划 v0.1

> 最小可行产品详细规划

## 版本信息

| 项目 | 内容 |
|------|------|
| 版本号 | v0.1 |
| 周期 | 1 周 |
| 目标 | 验证核心价值主张 |

---

## 一、功能清单

### 1.1 P0 功能（必须）

| # | 功能 | 描述 | 预估工时 |
|---|------|------|----------|
| 1 | 进度条展示 | 人生总进度、章节进度、等级 | 4h |
| 2 | 首次引导 | 昵称输入、生日选择、主题选择 | 3h |
| 3 | 每日记录 | 心情选择、能量滑块、内容输入、标签选择 | 6h |
| 4 | AI 即时洞察 | 记录提交后 AI 简短反馈 | 4h |
| 5 | 记录列表 | 历史记录查看 | 2h |
| 6 | 本地存储 | IndexedDB 数据持久化 | 3h |
| 7 | 基础设置 | 修改昵称、头像、主题 | 2h |

### 1.2 P1 功能（如有时间）

| # | 功能 | 描述 | 预估工时 |
|---|------|------|----------|
| 8 | 连续记录 | 显示连续天数 | 2h |
| 9 | 进度条动画 | 数字滚动效果 | 2h |

---

## 二、技术方案

### 2.1 技术栈

```json
{
  "frontend": {
    "framework": "React 18",
    "language": "TypeScript",
    "styling": "Tailwind CSS",
    "animation": "Framer Motion",
    "state": "Zustand",
    "storage": "IndexedDB (Dexie.js)",
    "ai": "OpenAI API (可选，本地模拟)"
  }
}
```

### 2.2 项目结构

```
src/
├── components/
│   ├── common/           # 通用组件
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   └── ...
│   ├── home/             # 首页组件
│   │   ├── CharacterPanel.tsx
│   │   ├── LifeProgress.tsx
│   │   └── ...
│   ├── record/           # 记录组件
│   │   ├── MoodSelector.tsx
│   │   ├── EnergySlider.tsx
│   │   ├── TagSelector.tsx
│   │   └── ...
│   └── onboarding/       # 引导组件
│       ├── Welcome.tsx
│       ├── NicknameInput.tsx
│       └── ...
├── pages/
│   ├── Home.tsx
│   ├── Record.tsx
│   ├── History.tsx
│   └── Settings.tsx
├── stores/
│   ├── userStore.ts      # 用户状态
│   ├── recordStore.ts    # 记录状态
│   └── settingsStore.ts  # 设置状态
├── utils/
│   ├── date.ts           # 日期计算
│   ├── storage.ts        # 存储工具
│   └── ai.ts             # AI 接口
├── hooks/
│   ├── useProgress.ts    # 进度计算
│   └── useStreak.ts     # 连续天数
└── App.tsx
```

### 2.3 数据模型

```typescript
// 用户
interface User {
  id: string;
  nickname: string;
  birthdayYear: number;
  theme: 'default' | 'spring' | 'study' | 'explore' | 'root';
  createdAt: Date;
}

// 记录
interface Record {
  id: string;
  userId: string;
  date: string;           // YYYY-MM-DD
  mood: 1 | 2 | 3 | 4 | 5;
  energy: number;         // 0-10
  content?: string;
  category?: string;
  tags?: string[];
  aiSummary?: string;
  createdAt: Date;
}
```

---

## 三、UI 设计

### 3.1 页面结构

```
┌─────────────────────────────────────┐
│  首页 (Home)                        │
│  ├─ 角色面板                        │
│  ├─ 人生进度条                      │
│  ├─ 章节进度                        │
│  └─ 快捷入口                        │
├─────────────────────────────────────┤
│  记录页 (Record)                    │
│  ├─ 心情选择                        │
│  ├─ 能量滑块                        │
│  ├─ 内容输入                        │
│  └─ 标签选择                        │
├─────────────────────────────────────┤
│  历史页 (History)                   │
│  └─ 记录列表                        │
├─────────────────────────────────────┤
│  设置页 (Settings)                  │
│  └─ 基本设置                        │
└─────────────────────────────────────┘
```

### 3.2 组件清单

| 组件 | 描述 | 状态 |
|------|------|------|
| Button | 按钮组件 | 🔴 待开发 |
| Card | 卡片组件 | 🔴 待开发 |
| ProgressBar | 进度条组件 | 🔴 待开发 |
| MoodSelector | 心情选择器 | 🔴 待开发 |
| EnergySlider | 能量滑块 | 🔴 待开发 |
| TagSelector | 标签选择器 | 🔴 待开发 |
| CharacterPanel | 角色面板 | 🔴 待开发 |

---

## 四、里程碑

### Day 1: 项目搭建

- [ ] 创建 React + TypeScript 项目
- [ ] 配置 Tailwind CSS
- [ ] 配置 Zustand
- [ ] 配置 IndexedDB (Dexie.js)
- [ ] 配置 Framer Motion
- [ ] 基础目录结构

### Day 2: Onboarding

- [ ] 欢迎页 UI
- [ ] 昵称输入
- [ ] 生日选择
- [ ] 主题选择
- [ ] 进度条首次展示动画

### Day 3: 首页 + 记录页

- [ ] 角色面板
- [ ] 人生进度条
- [ ] 章节进度
- [ ] 心情选择器
- [ ] 能量滑块

### Day 4: 记录提交 + AI

- [ ] 内容输入
- [ ] 标签选择
- [ ] 记录提交逻辑
- [ ] 本地存储
- [ ] AI 洞察（本地模拟）

### Day 5: 历史 + 设置

- [ ] 记录列表
- [ ] 设置页
- [ ] 修改昵称/头像/主题
- [ ] 数据持久化

### Day 6-7: 优化 + 测试

- [ ] 动效优化
- [ ] 异常处理
- [ ] 性能优化
- [ ] 端到端测试
- [ ] Bug 修复

---

## 五、验收标准

### 功能验收

| 功能 | 验收条件 |
|------|----------|
| 首次引导 | 3 步内完成引导，看到进度条 |
| 进度条 | 数字滚动动画流畅 |
| 记录提交 | 3 步内完成记录 |
| AI 洞察 | 提交后 2 秒内显示反馈 |
| 数据持久 | 刷新页面数据不丢失 |
| 主题切换 | 5 种主题切换生效 |

### 性能验收

| 指标 | 标准 |
|------|------|
| 首屏加载 | < 3s |
| 交互响应 | < 100ms |
| 动画帧率 | 60fps |

### 体验验收

| 检查项 | 标准 |
|--------|------|
| 首次打开 | 3 分钟内产生"哇"的感觉 |
| 记录流程 | 1 分钟内完成 |
| 错误提示 | 清晰、友好 |

---

## 六、风险与对策

| 风险 | 对策 |
|------|------|
| AI API 延迟 | 本地模拟 + 异步加载 |
| 动画性能 | 使用 CSS 动画 + GPU 加速 |
| 数据丢失 | IndexedDB 本地备份 |
| 时间不足 | 砍掉 P1 功能 |

---

[返回规划目录](./README.md) | [返回项目根目录](../README.md)
