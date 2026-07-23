# 视觉设计规范

> 色彩、字体、图标等视觉系统 | 版本：v2.0 | 日期：2026-07-23

---

## 设计 Token 系统

### Token 命名规范

```
{属性}-{用途}-{状态}

示例：
- color-primary-default
- color-primary-hover
- color-text-secondary
- spacing-md
- radius-button
```

### 色彩 Token

```css
:root {
  /* ===== 主色系 ===== */
  /* 主题色 - 可根据章节自动切换 */
  --color-primary: #3B82F6;
  --color-primary-light: #60A5FA;
  --color-primary-dark: #2563EB;

  /* 语义色 */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* ===== 文字色 ===== */
  --color-text-primary: #0F172A;
  --color-text-secondary: #64748B;
  --color-text-tertiary: #94A3B8;
  --color-text-inverse: #FFFFFF;

  /* ===== 背景色 ===== */
  --color-bg-primary: #F8FAFC;
  --color-bg-secondary: #FFFFFF;
  --color-bg-tertiary: #F1F5F9;
  --color-bg-inverse: #0F172A;

  /* ===== 边框色 ===== */
  --color-border-default: #E2E8F0;
  --color-border-hover: #CBD5E1;
  --color-border-active: #3B82F6;

  /* ===== 阴影 ===== */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.4);
  --shadow-glow-success: 0 0 20px rgba(16, 185, 129, 0.4);

  /* ===== 间距 ===== */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;

  /* ===== 圆角 ===== */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* ===== 动画 ===== */
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 400ms;
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 一、色彩系统

### 主题色（章节系统）

提供 5 种人生阶段主题色，根据用户年龄自动或手动切换：

| 主题 | 名称 | 主色 | 辅色 | 强调色 | 代表阶段 |
|------|------|------|------|--------|----------|
| 🌱 | 萌芽 | `#10B981` | `#D1FAE5` | `#059669` | 0-6 岁 |
| 📚 | 求学 | `#3B82F6` | `#DBEAFE` | `#2563EB` | 7-22 岁 |
| 🔍 | 探索 | `#8B5CF6` | `#EDE9FE` | `#7C3AED` | 23-30 岁 |
| 🌿 | 扎根 | `#F59E0B` | `#FEF3C7` | `#D97706` | 31-45 岁 |
| 🌸 | 绽放 | `#EC4899` | `#FCE7F3` | `#DB2777` | 46-60 岁 |
| 🍂 | 沉淀 | `#6366F1` | `#E0E7FF` | `#4F46E5` | 61-75 岁 |
| 🌅 | 归途 | `#14B8A6` | `#CCFBF1` | `#0D9488` | 76+ 岁 |

### 功能色

| 用途 | 颜色 | 色值 | 示例 |
|------|------|------|------|
| 成功 | 绿色 | `#10B981` | 存档成功 |
| 警告 | 橙色 | `#F59E0B` | 连续记录 |
| 错误 | 红色 | `#EF4444` | 提交失败 |
| 信息 | 蓝色 | `#3B82F6` | AI 洞察 |

### 心情色阶

| 心情 | 表情 | 颜色 | 色值 |
|------|------|------|------|
| 极差 | 😫 | 灰色 | `#6B7280` |
| 较差 | 😐 | 蓝灰 | `#6B7280` |
| 一般 | 🙂 | 蓝色 | `#3B82F6` |
| 不错 | 😊 | 橙色 | `#F59E0B` |
| 极好 | 🤩 | 粉色 | `#EC4899` |

### 能量色阶

| 能量 | 图标 | 颜色 | 色值 |
|------|------|------|------|
| 0-2 | 💤 | 深灰 | `#4B5563` |
| 3-4 | 😴 | 灰 | `#6B7280` |
| 5-6 | 🙂 | 蓝 | `#3B82F6` |
| 7-8 | 💪 | 橙 | `#F59E0B` |
| 9-10 | 🔥 | 红 | `#EF4444` |

### 暗色模式

| 元素 | 暗色背景 |
|------|----------|
| 背景 | `#0F172A` |
| 卡片 | `#1E293B` |
| 文字主 | `#F8FAFC` |
| 文字次 | `#94A3B8` |
| 边框 | `#334155` |

### 亮色模式

| 元素 | 亮色背景 |
|------|----------|
| 背景 | `#F8FAFC` |
| 卡片 | `#FFFFFF` |
| 文字主 | `#0F172A` |
| 文字次 | `#64748B` |
| 边框 | `#E2E8F0` |

---

## 二、字体系统

### 字体家族

```css
/* 中文优先 */
--font-family-cn: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;

/* 英文优先 */
--font-family-en: "SF Pro Display", "Helvetica Neue", Arial, sans-serif;

/* 数字/代码 */
--font-family-mono: "SF Mono", "Fira Code", monospace;

/* 游戏风格 */
--font-family-game: "Press Start 2P", "Silkscreen", cursive;
```

### 字号规范

| 用途 | 字号 | 字重 | 行高 |
|------|------|------|------|
| 进度数字 | 48px | 700 | 1.2 |
| 页面标题 | 24px | 600 | 1.3 |
| 章节标题 | 20px | 600 | 1.3 |
| 正文 | 16px | 400 | 1.6 |
| 辅助文字 | 14px | 400 | 1.5 |
| 标签文字 | 12px | 500 | 1.4 |

### 数字样式

关键数字使用特殊样式：

```css
.num-key {
  font-family: var(--font-family-mono);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
```

---

## 三、图标系统

### 图标库

使用 **Lucide Icons** 作为基础图标库。

### 分类图标

| 分类 | 图标 | Emoji |
|------|------|-------|
| 工作 | 💼 | Briefcase |
| 学习 | 📚 | Book |
| 健康 | 🏃 | Running |
| 关系 | 💕 | Heart |
| 娱乐 | 🎮 | Gamepad |
| 其他 | ✨ | Sparkles |

### 心情图标

| 心情 | Emoji | 描述 |
|------|-------|------|
| 极差 | 😫 | 痛苦面具 |
| 较差 | 😐 | 面无表情 |
| 一般 | 🙂 | 微笑 |
| 不错 | 😊 | 开心 |
| 极好 | 🤩 | 星星眼 |

### 能量图标

| 能量 | Emoji | 描述 |
|------|-------|------|
| 0 | 💀 | 死亡 |
| 1-2 | 💤 | 睡觉 |
| 3-4 | 😴 | 困倦 |
| 5-6 | 😊 | 平静 |
| 7-8 | 💪 | 强壮 |
| 9-10 | 🔥 | 火焰 |

---

## 四、组件样式代码

### 按钮

```css
/* 基础按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-default);
  min-height: 48px;
  min-width: 48px;
}

/* 主按钮 */
.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translateY(0) scale(0.98);
}

/* 次按钮 */
.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.btn-secondary:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

/* 幽灵按钮 */
.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.btn-ghost:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

/* 禁用状态 */
.btn:disabled {
  background: var(--color-text-tertiary);
  color: var(--color-text-secondary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 加载状态 */
.btn-loading {
  position: relative;
  color: transparent;
}

.btn-loading::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 卡片

```css
.card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-normal) var(--easing-default);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  font-size: 18px;
  font-weight: 600;
}

.card-body {
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
}
```

### 进度条

```css
.progress-container {
  width: 100%;
  height: 16px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  border-radius: var(--radius-full);
  background: linear-gradient(
    90deg,
    var(--color-primary) 0%,
    var(--color-primary-light) 100%
  );
  transition: width 2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### 徽章

```css
.badge {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  position: relative;
  transition: all var(--duration-normal) var(--easing-spring);
}

.badge-locked {
  filter: grayscale(100%);
  opacity: 0.5;
}

.badge-unlocked {
  filter: none;
}

.badge-unlocked::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    var(--color-primary),
    var(--color-warning),
    var(--color-primary)
  );
  animation: rotate 3s linear infinite;
  z-index: -1;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

/* 解锁动画 */
.badge-pulse {
  animation: pulse 0.6s var(--easing-spring);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
```

### 输入框

```css
.input {
  width: 100%;
  height: 48px;
  padding: 0 var(--spacing-md);
  font-size: 16px;
  border: 2px solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  transition: all var(--duration-fast) var(--easing-default);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.input-error {
  border-color: var(--color-error);
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.input-error-message {
  color: var(--color-error);
  font-size: 12px;
  margin-top: var(--spacing-xs);
}
```

---

## 五、间距系统

基础间距遵循 4px 网格系统：

| 名称 | 大小 | 用途 |
|------|------|------|
| xs | 4px | 紧凑元素间距 |
| sm | 8px | 标签内间距、图标与文字间距 |
| md | 16px | 组件内间距、卡片内边距 |
| lg | 24px | 区块间距 |
| xl | 32px | 页面边距 |
| 2xl | 48px | 大区块间距 |
| 3xl | 64px | 页面顶部/底部间距 |

### 页面布局

```css
.page {
  padding: var(--spacing-xl);
  padding-top: calc(var(--spacing-xl) + env(safe-area-inset-top));
  padding-bottom: calc(var(--spacing-xl) + env(safe-area-inset-bottom));
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100dvh;
}
```

---

## 六、圆角系统

| 元素 | 圆角 | CSS 变量 |
|------|------|----------|
| 标签 | 4px | `--radius-sm` |
| 按钮 | 12px | `--radius-md` |
| 卡片 | 16px | `--radius-lg` |
| 输入框 | 12px | `--radius-md` |
| 头像 | 50% | `border-radius: 50%` |
| 徽章 | 50% | `border-radius: 50%` |
| 进度条 | 8px | `--radius-full` |
| 模态框 | 24px | `--radius-xl` |

---

## 七、阴影系统

```css
/* 层级阴影 */
.shadow-sm {
  box-shadow: var(--shadow-sm);
}

.shadow-md {
  box-shadow: var(--shadow-md);
}

.shadow-lg {
  box-shadow: var(--shadow-lg);
}

/* 发光效果 */
.glow-primary {
  box-shadow: var(--shadow-glow);
}

.glow-success {
  box-shadow: var(--shadow-glow-success);
}

/* 悬浮阴影 */
.shadow-hover:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

---

## 八、暗色模式

### 暗色变量覆盖

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #0F172A;
    --color-bg-secondary: #1E293B;
    --color-bg-tertiary: #334155;
    --color-text-primary: #F8FAFC;
    --color-text-secondary: #94A3B8;
    --color-text-tertiary: #64748B;
    --color-border-default: #334155;
    --color-border-hover: #475569;
  }
}
```

### 用户切换

```javascript
// 主题切换逻辑
function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// 初始化主题
function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved ?? prefersDark;

  if (isDark) {
    document.documentElement.classList.add('dark');
  }
}
```

---

## 九、字体系统

### 字体家族

```css
:root {
  /* 中文优先 */
  --font-family-cn: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;

  /* 英文优先 */
  --font-family-en: "SF Pro Display", "Helvetica Neue", Arial, sans-serif;

  /* 数字/代码 */
  --font-family-mono: "SF Mono", "Fira Code", "Consolas", monospace;

  /* 游戏风格 (仅用于徽章/成就标题) */
  --font-family-game: "Press Start 2P", "Silkscreen", cursive;
}
```

### 字号规范

| 用途 | 字号 | 字重 | 行高 | 示例 |
|------|------|------|------|------|
| 进度数字 | 48px | 700 | 1.2 | 9,213 |
| 页面标题 | 24px | 600 | 1.3 | 页面标题 |
| 章节标题 | 20px | 600 | 1.3 | 第3章「探索」 |
| 正文 | 16px | 400 | 1.6 | 正文内容 |
| 辅助文字 | 14px | 400 | 1.5 | 描述文字 |
| 标签文字 | 12px | 500 | 1.4 | 标签、徽章名 |

### 数字样式

```css
.num-key {
  font-family: var(--font-family-mono);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  font-feature-settings: "tnum";
}
```

---

[返回设计目录](./README.md) | [返回项目根目录](../README.md)
