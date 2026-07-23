# 视觉设计规范

> 色彩、字体、图标等视觉系统

## 一、色彩系统

### 主题色

提供 5 种人生阶段主题色：

| 主题 | 名称 | 主色 | 辅色 | 代表阶段 |
|------|------|------|------|----------|
| 🌱 | 萌芽 | `#10B981` | `#D1FAE5` | 0-6 岁 |
| 📚 | 求学 | `#3B82F6` | `#DBEAFE` | 7-22 岁 |
| 🔍 | 探索 | `#8B5CF6` | `#EDE9FE` | 23-30 岁 |
| 🌿 | 扎根 | `#F59E0B` | `#FEF3C7` | 31-45 岁 |
| 🌸 | 绽放 | `#EC4899` | `#FCE7F3` | 46-60 岁 |

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

## 四、组件样式

### 按钮

| 类型 | 样式 |
|------|------|
| 主按钮 | 圆角 12px，主题色背景，白色文字 |
| 次按钮 | 圆角 12px，透明背景，主题色边框 |
| 幽灵按钮 | 无边框，主题色文字 |
| 禁用 | 灰色背景，禁止交互 |

### 卡片

```css
.card {
  background: var(--color-card);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### 进度条

```css
.progress-bar {
  height: 8px;
  border-radius: 4px;
  background: var(--color-border);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  transition: width 2s ease-out;
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
}

.badge.locked {
  filter: grayscale(100%);
  opacity: 0.5;
}

.badge.unlocked {
  filter: none;
  animation: badge-pulse 2s ease-in-out;
}
```

---

## 五、间距系统

### 基础间距

| 名称 | 大小 | 用途 |
|------|------|------|
| xs | 4px | 紧凑元素间距 |
| sm | 8px | 标签内间距 |
| md | 16px | 组件内间距 |
| lg | 24px | 区块间距 |
| xl | 32px | 页面边距 |
| 2xl | 48px | 大区块间距 |

### 页面布局

```css
.page {
  padding: var(--spacing-xl);
  max-width: 480px;
  margin: 0 auto;
}
```

---

## 六、圆角系统

| 元素 | 圆角 |
|------|------|
| 按钮 | 12px |
| 卡片 | 16px |
| 输入框 | 12px |
| 头像 | 50%（圆形） |
| 徽章 | 50%（圆形） |
| 进度条 | 4px |

---

## 七、阴影系统

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-glow: 0 0 20px rgba(59, 130, 246, 0.5);
```

---

[返回设计目录](./README.md) | [返回项目根目录](../README.md)
