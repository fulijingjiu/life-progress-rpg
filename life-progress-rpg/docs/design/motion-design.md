# 动效设计规范

> 动画、转场、交互反馈 | 版本：v2.0 | 日期：2026-07-23

---

## 动效原则

### 基本原则

1. **功能性** — 每个动效都有其目的
2. **自然性** — 符合物理世界的规律
3. **一致性** — 相同场景使用相同的动效
4. **性能优先** — 60fps 流畅运行
5. **可访问** — 支持减弱动效模式

### 动效目的

| 目的 | 说明 | 示例 |
|------|------|------|
| 引导注意 | 吸引用户关注 | 脉冲动画的按钮 |
| 提供反馈 | 响应用户操作 | 点击涟漪效果 |
| 建立关系 | 展示元素关联 | 共享元素过渡 |
| 增强愉悦 | 提升产品体验 | 徽章解锁动画 |

### 减弱动效模式

```javascript
// 检测用户偏好
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 应用减弱动效
function getAnimationDuration(normalDuration) {
  return prefersReducedMotion ? 0 : normalDuration;
}

function getAnimationEasing(normalEasing) {
  return prefersReducedMotion ? 'linear' : normalEasing;
}
```

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
function animateNumber(start, end, duration = 2000) {
  const startTime = performance.now();
  const element = document.getElementById('progress-number');

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // 使用 easeOutCubic 缓动
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    const current = Math.floor(start + (end - start) * easeProgress);
    element.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// 使用
animateNumber(0, 9213, 2000);
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
  transform-style: preserve-3d;
  perspective: 1000px;
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

**章节切换完整代码**：

```javascript
async function playChapterTransition(oldChapter, newChapter) {
  const overlay = document.getElementById('chapter-overlay');
  const oldText = document.getElementById('old-chapter-text');
  const newText = document.getElementById('new-chapter-text');

  // 阶段1: 当前章节淡出
  overlay.classList.add('active');
  oldText.textContent = `第${oldChapter}章「${oldChapter.name}」— 完结`;
  await animate(overlay, { opacity: 1 }, 500);
  await delay(1000);

  // 阶段2: 黑屏停顿
  await animate(oldText, { opacity: 0, scale: 0.8 }, 300);
  await delay(2000);

  // 阶段3: 新章节出现
  newText.textContent = `第${newChapter.num}章「${newChapter.name}」— 开启`;
  await animate(newText, { opacity: 1, scale: 1 }, 500);
  await delay(1500);

  // 阶段4: 退出
  await animate(overlay, { opacity: 0 }, 500);
  overlay.classList.remove('active');
}
```

### 5. 记录提交

| 阶段 | 动效 | 时长 | 参数 |
|------|------|------|------|
| 按钮按下 | scale(0.95) | 0.1s | ease-out |
| 加载 | 旋转图标 | 持续 | linear |
| 成功 | ✅ 弹出 + 缩放 | 0.3s | spring |
| 震动 | 轻微震动 | 0.2s | - |
| 经验值 | "+1" 向上飘出 | 0.5s | ease-out |

```javascript
async function playSubmitSuccess() {
  // 按钮变成功状态
  const btn = document.getElementById('submit-btn');
  btn.classList.add('loading');

  // 模拟提交
  await delay(1500);

  // 成功动画
  btn.classList.remove('loading');
  btn.classList.add('success');
  btn.innerHTML = '✓';

  // 震动反馈
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }

  // 经验值飘字
  showFloatingText('+10 经验值', { y: -50, duration: 1000 });

  await delay(500);

  // AI 洞察滑入
  showAIInsight();
}
```

### 6. AI 对话

| 场景 | 动效 | 时长 | 参数 |
|------|------|------|------|
| 打字效果 | 文字逐字出现 | 30ms/字 | linear |
| 光标 | 闪烁 | 0.8s | ease-in-out |
| 气泡滑入 | 从下往上滑入 | 0.3s | spring |
| 气泡展开 | 内容展开 | 0.2s | ease-out |

```javascript
async function typeMessage(element, text, speed = 30) {
  element.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';

  for (let i = 0; i < text.length; i++) {
    element.textContent += text[i];
    element.appendChild(cursor);
    await delay(speed);
  }

  // 移除光标
  cursor.remove();
}
```

### 7. 连续记录火焰

| 场景 | 动效 | 时长 | 参数 |
|------|------|------|------|
| 火焰图标 | 跳动 | 0.5s | ease-in-out |
| 数字递增 | 数字滚动更新 | 0.3s | spring |
| 特效 | 火星粒子 | 持续 | - |

```javascript
function createFireParticles(container) {
  const particleCount = 15;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'fire-particle';

    // 随机位置和动画
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 0.5}s`;
    particle.style.animationDuration = `${1 + Math.random() * 0.5}s`;

    container.appendChild(particle);
  }
}
```

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

/* 涟漪效果 */
.button-ripple {
  position: relative;
  overflow: hidden;
}

.button-ripple::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  transform: scale(0);
  opacity: 1;
}

.button-ripple:active::after {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
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

.card:active {
  transform: translateY(0);
}
```

### 心情选择

```css
.mood-option {
  transition: all 0.2s ease-out;
  cursor: pointer;
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
function updateEnergyBackground(slider, container) {
  const value = slider.value;
  // 从红(0)到绿(10)的渐变
  const hue = 120 - (value * 12);
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

/* React Transition Group 示例 */
const pageTransition = {
  enter: 'page-enter',
  enterActive: 'page-enter-active',
  exit: 'page-exit',
  exitActive: 'page-exit-active',
};
```

### 模态框

```css
.modal-overlay {
  transition: opacity 0.2s ease-out;
  background: rgba(0, 0, 0, 0.5);
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

/* iOS 特性: 拖动关闭 */
.sheet-handle {
  width: 36px;
  height: 5px;
  background: var(--color-border-default);
  border-radius: var(--radius-full);
  margin: 8px auto;
}
```

---

## 手势交互

### 下拉刷新

```javascript
const pullRefresh = {
  threshold: 80,
  maxPull: 120,

  onPull(progress) {
    // progress: 0-1
    spinner.style.transform = `rotate(${progress * 360}deg)`;
    pullText.textContent = progress >= 1 ? '松开刷新' : '下拉刷新';
  },

  onRelease() {
    if (progress >= 1) {
      triggerRefresh();
    }
  }
};
```

### 左滑删除

```css
.swipe-item {
  position: relative;
  overflow: hidden;
}

.swipe-actions {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  transform: translateX(100%);
  transition: transform 0.2s ease-out;
}

.swipe-item.swiped .swipe-actions {
  transform: translateX(0);
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
| 特殊动画 | 2000ms+ | 章节切换 |

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

### 音效管理器

```javascript
class SoundManager {
  constructor() {
    this.enabled = localStorage.getItem('soundEnabled') === 'true';
    this.volume = Number(localStorage.getItem('soundVolume') || 0.5);
    this.sounds = {};
  }

  async load(name, url) {
    const audio = new Audio(url);
    audio.volume = this.volume;
    this.sounds[name] = audio;
  }

  play(soundName) {
    if (!this.enabled) return;

    const audio = this.sounds[soundName];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEnabled', this.enabled);
    return this.enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('soundVolume', this.volume);
    Object.values(this.sounds).forEach(audio => {
      audio.volume = this.volume;
    });
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

## 性能优化

### GPU 加速

```css
/* 启用 GPU 加速 */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

### 动画性能检查清单

1. 使用 `transform` 和 `opacity` 而非 `left/top`
2. 避免在动画中触发重排
3. 使用 `will-change` 提示浏览器
4. 复杂动画使用 Canvas 或 WebGL
5. 测试低端设备性能

---

[返回设计目录](./README.md) | [返回文档中心](../README.md)
