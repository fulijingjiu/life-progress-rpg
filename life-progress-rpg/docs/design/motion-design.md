# 动效设计规范

> 动画、转场、交互反馈

## 动效原则

### 基本原则

1. **功能性** — 每个动效都有其目的
2. **自然性** — 符合物理世界的规律
3. **一致性** — 相同场景使用相同的动效
4. **性能优先** — 60fps 流畅运行

### 动效目的

| 目的 | 说明 | 示例 |
|------|------|------|
| 引导注意 | 吸引用户关注 | 脉冲动画的按钮 |
| 提供反馈 | 响应用户操作 | 点击涟漪效果 |
| 建立关系 | 展示元素关联 | 共享元素过渡 |
| 增强愉悦 | 提升产品体验 | 徽章解锁动画 |

---

## 核心动效清单

### 1. 启动动画

| 场景 | 动效 | 时长 | 参数 |
|------|------|------|------|
| Logo 出现 | 像素化渐显 | 1.5s | ease-out |
| 加载进度 | 进度条填充 | 1s | linear |
| 音效 | 8-bit 开机音 | - | - |

### 2. 进度条动画

| 场景 | 动效 | 时长 | 参数 |
|------|------|------|------|
| 首次加载 | 从 0 滚动到当前值 | 2s | ease-out |
| 每日刷新 | 从昨日平滑填充到今日 | 1s | ease-in-out |
| 章节切换 | 进度突变 + 闪光 | 0.5s | spring |

**进度条数字滚动效果**：

```javascript
// 数字从 0 滚动到目标值
function animateNumber(start, end, duration) {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    
    const current = Math.floor(start + (end - start) * easeProgress);
    element.textContent = current.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}
```

### 3. 徽章动画

| 阶段 | 动效 | 时长 | 参数 |
|------|------|------|------|
| 飞入 | 从远处缩小飞入中心 | 0.6s | spring |
| 翻转 | 3D Y 轴翻转 | 0.8s | ease-in-out |
| 发光 | 脉冲发光效果 | 持续 | ease-in-out |
| 音效 | 胜利号角 | - | - |

**3D 翻转动画**：

```css
@keyframes badge-flip {
  0% {
    transform: rotateY(0deg) scale(2);
    opacity: 0;
  }
  50% {
    transform: rotateY(90deg) scale(1.2);
  }
  100% {
    transform: rotateY(180deg) scale(1);
    opacity: 1;
  }
}

.badge-unlock {
  animation: badge-flip 0.8s ease-in-out;
}
```

### 4. 章节切换

| 阶段 | 动效 | 时长 | 参数 |
|------|------|------|------|
| 当前章节淡出 | 模糊 + 缩小 | 1s | ease-in |
| 文字浮现 | "第X章 — 完结" | 0.5s | ease-out |
| 停顿 | 黑屏 | 2s | - |
| 新章节亮起 | 从黑暗中渐显 | 1s | ease-out |
| 文字浮现 | "第X章 — 开启" | 0.5s | ease-out |
| 描述展开 | 滚动展示 | 1s | ease-out |

### 5. 记录提交

| 阶段 | 动效 | 时长 | 参数 |
|------|------|------|------|
| 按钮按下 | scale(0.95) | 0.1s | ease-out |
| 加载 | 旋转图标 | 持续 | linear |
| 成功 | ✅ 弹出 + 缩放 | 0.3s | spring |
| 震动 | 轻微震动 | 0.2s | - |
| 经验值 | "+1" 向上飘出 | 0.5s | ease-out |

### 6. AI 对话

| 场景 | 动效 | 时长 | 参数 |
|------|------|------|------|
| 打字效果 | 文字逐字出现 | 30ms/字 | linear |
| 光标 | 闪烁 | 0.8s | ease-in-out |
| 气泡滑入 | 从下往上滑入 | 0.3s | spring |
| 气泡展开 | 内容展开 | 0.2s | ease-out |

### 7. 连续记录

| 场景 | 动效 | 时长 | 参数 |
|------|------|------|------|
| 火焰图标 | 跳动 | 0.5s | ease-in-out |
| 数字递增 | 数字滚动更新 | 0.3s | spring |
| 特效 | 火星粒子 | 持续 | - |

---

## 微交互动效

### 按钮交互

```css
.button {
  transition: all 0.15s ease-out;
}

.button:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.button:active {
  transform: scale(0.98);
}
```

### 卡片交互

```css
.card {
  transition: all 0.2s ease-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
```

### 心情选择

```css
.mood-option {
  transition: all 0.2s ease-out;
}

.mood-option:hover {
  transform: scale(1.1);
}

.mood-option.selected {
  transform: scale(1.3);
  animation: bounce 0.3s ease-out;
}

@keyframes bounce {
  0%, 100% { transform: scale(1.3); }
  50% { transform: scale(1.4); }
}
```

### 能量滑块

```javascript
// 滑块滑动时背景变色
function updateEnergyBackground(value) {
  const hue = 120 - (value * 12); // 从绿到红
  const saturation = 70 + (value * 3);
  const lightness = 50;
  
  container.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
```

---

## 页面转场

### 页面切换

```css
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease-out;
}

.page-exit {
  opacity: 1;
}

.page-exit-active {
  opacity: 0;
  transition: opacity 0.2s ease-in;
}
```

### 模态框

```css
.modal-overlay {
  transition: opacity 0.2s ease-out;
}

.modal-content {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter .modal-content {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

.modal-enter-active .modal-content {
  transform: scale(1) translateY(0);
  opacity: 1;
}
```

### 底部 Sheet

```css
.sheet {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.sheet-enter {
  transform: translateY(100%);
}

.sheet-enter-active {
  transform: translateY(0);
}
```

---

## 动画参数规范

### 时长规范

| 类型 | 时长 | 示例 |
|------|------|------|
| 微交互 | 100-200ms | 按钮点击 |
| 小动画 | 200-400ms | 元素出现 |
| 中动画 | 400-800ms | 页面转场 |
| 大动画 | 800-2000ms | 徽章解锁 |

### 缓动函数

| 缓动 | 用途 | 函数 |
|------|------|------|
| ease-out | 元素进入 | cubic-bezier(0, 0, 0.2, 1) |
| ease-in | 元素离开 | cubic-bezier(0.4, 0, 1, 1) |
| ease-in-out | 对称动画 | cubic-bezier(0.4, 0, 0.2, 1) |
| spring | 弹性效果 | cubic-bezier(0.34, 1.56, 0.64, 1) |

---

## 音效设计

### 音效场景

| 场景 | 音效 | 风格 | 时长 |
|------|------|------|------|
| 启动 | 8-bit 开机音 | 复古游戏 | 1s |
| 点击按钮 | 轻微"滴"声 | 清脆 | 0.1s |
| 记录提交 | 升级音 | 正向反馈 | 0.5s |
| 徽章解锁 | 胜利号角 | 成就感 | 1.5s |
| 章节切换 | 翻书声 + 风铃 | 仪式感 | 2s |
| 连续记录 | 火焰"呼"声 | 力量感 | 0.3s |
| AI 回复 | 轻微打字机声 | 拟人 | 持续 |

### 音效控制

```javascript
// 音效管理器
class SoundManager {
  private enabled: boolean;
  private volume: number;
  
  constructor() {
    this.enabled = localStorage.getItem('soundEnabled') === 'true';
    this.volume = Number(localStorage.getItem('soundVolume') || 0.5);
  }
  
  play(soundName: string) {
    if (!this.enabled) return;
    
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    audio.volume = this.volume;
    audio.play();
  }
}

export const soundManager = new SoundManager();
```

### 用户控制

- 所有音效默认**关闭**
- 用户可在设置中开启
- 支持单独控制各场景音效
- 支持音量调节

---

[返回设计目录](./README.md) | [返回项目根目录](../README.md)
