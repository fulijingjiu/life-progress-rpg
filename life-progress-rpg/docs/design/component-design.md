# 组件设计系统

> 状态：完整产品愿景组件库，不是 v0.1 实施清单
> v0.1 只实现 [MVP 规划](../planning/milestone-v1.md) 所需组件；内容组件遵守[内容价值与个人分析策略](./content-strategy.md)
> 版本：v2.0 | 最近校准：2026-07-24

---

## 组件概览

| 类别 | 组件数 | 说明 |
|------|--------|------|
| 基础组件 | 8 | Button, Input, Card, Badge, Progress, Tag, Avatar, Icon |
| 复合组件 | 6 | Header, Footer, Sheet, Modal, Toast, Tooltip |
| 业务组件 | 12 | ProgressBar, MoodSelector, EnergySlider, TagSelector, InsightCard, AchievementCard, etc. |
| 页面组件 | 5 | HomePage, RecordSheet, ChatPage, AchievementPage, ProfilePage |

---

## 一、基础组件

### 1. Button 按钮

#### 变体 (Variants)

| 变体 | 用途 | 示例 |
|------|------|------|
| Primary | 主要操作 | 存档今日 |
| Secondary | 次要操作 | 取消 |
| Ghost | 辅助操作 | 跳过 |
| Destructive | 危险操作 | 删除 |

#### 尺寸 (Sizes)

| 尺寸 | 高度 | 内边距 | 字号 |
|------|------|--------|------|
| Small | 32px | 8px 16px | 14px |
| Medium | 44px | 12px 24px | 16px |
| Large | 52px | 16px 32px | 18px |

#### 状态 (States)

| 状态 | 视觉表现 |
|------|----------|
| Default | 正常显示 |
| Hover | 亮度+10%，轻微放大 |
| Active | 缩小95% |
| Focus | 外发光环 |
| Loading | 旋转图标，文字隐藏 |
| Disabled | 灰色，不可点击 |

#### 代码示例

```tsx
// 使用 React + Tailwind
<Button
  variant="primary"
  size="medium"
  loading={isSubmitting}
  disabled={isDisabled}
  onClick={handleClick}
>
  存档今日
</Button>

// 变体
<Button variant="secondary">次要操作</Button>
<Button variant="ghost">跳过</Button>
<Button variant="destructive">删除</Button>

// 尺寸
<Button size="small">小按钮</Button>
<Button size="medium">中按钮</Button>
<Button size="large">大按钮</Button>
```

---

### 2. Input 输入框

#### 类型

| 类型 | 用途 |
|------|------|
| Text | 单行文本 |
| Textarea | 多行文本 |
| Number | 数字输入 |
| Date | 日期选择 |
| Password | 密码 |

#### 状态

| 状态 | 边框色 | 背景色 |
|------|--------|--------|
| Default | `#E2E8F0` | 白色 |
| Focus | `#3B82F6` | 白色 |
| Filled | `#3B82F6` | 白色 |
| Error | `#EF4444` | 淡红 |
| Disabled | `#E2E8F0` | `#F1F5F9` |

#### 代码示例

```tsx
// 带标签
<Input
  label="昵称"
  placeholder="给自己起个名字"
  value={name}
  onChange={setName}
/>

// 出生年份（只用于估算）
<Input
  label="出生年份"
  type="number"
  value={birthdayYear}
  error="请输入有效年份"
  onChange={setBirthdayYear}
/>

// 多行文本
<Textarea
  label="今日备注"
  placeholder="记录今天发生的事..."
  rows={4}
  value={note}
  onChange={setNote}
/>
```

---

### 3. Card 卡片

#### 变体

| 变体 | 用途 | 特点 |
|------|------|------|
| Default | 一般卡片 | 轻阴影 |
| Elevated | 强调卡片 | 深阴影，上浮 |
| Outlined | 边框卡片 | 无阴影 |
| Interactive | 可交互 | Hover效果 |

#### 代码示例

```tsx
// 默认卡片
<Card>
  <Card.Header>标题</Card.Header>
  <Card.Body>内容</Card.Body>
</Card>

// 可点击卡片
<Card interactive onClick={handleClick}>
  <Card.Header icon={<Icon />}>标题</Card.Header>
  <Card.Body>点击跳转</Card.Body>
  <Card.Footer>补充信息</Card.Footer>
</Card>
```

---

### 4. Badge 徽章

#### 变体

| 类型 | 用途 | 示例 |
|------|------|------|
| Achievement | 成就徽章 | 🏆 |
| Status | 状态徽章 | 新 |
| Count | 数量徽章 | 99+ |
| Level | 等级徽章 | Lv.25 |

#### 状态

| 状态 | 样式 |
|------|------|
| Locked | 灰色，100%滤镜 |
| Available | 正常显示 |
| Unlocked | 正常+光环动画 |
| Featured | 特殊边框 |

#### 代码示例

```tsx
// 成就徽章
<Badge type="achievement" name="连续奋战" icon="🏆" unlocked />

// 状态徽章
<Badge type="status" text="新" variant="primary" />

// 等级徽章
<Badge type="level" level={25} theme="explore" />

// 锁定状态
<Badge type="achievement" name="???" locked />
```

---

### 5. Progress 进度条

#### 类型

| 类型 | 用途 |
|------|------|
| Linear | 线性进度 |
| Circular | 圆形进度 |
| Ring | 环形进度 |

#### 变体

| 变体 | 特点 |
|------|------|
| Default | 单色渐变 |
| Chapter | 章节主题色 |
| Mood | 心情色 |
| Energy | 能量色 |

#### 代码示例

```tsx
// 线性进度
<Progress
  value={32.5}
  max={100}
  variant="chapter"
  showLabel
  animate
/>

// 圆形进度
<CircularProgress
  value={9213}
  max={36500}
  label="天数"
  variant="chapter"
/>

// 能量进度
<EnergyProgress value={7} max={10} showIcon />
```

---

### 6. Tag 标签

#### 变体

| 图标 | 名称 | 用途 |
|------|------|------|
| 💼 | 工作 | 工作相关 |
| 📚 | 学习 | 学习相关 |
| 🏃 | 健康 | 运动健康 |
| 💕 | 关系 | 人际关系 |
| 🎮 | 娱乐 | 休闲娱乐 |
| ✨ | 其他 | 其他活动 |

#### 状态

| 状态 | 样式 |
|------|------|
| Default | 浅色背景 |
| Selected | 主题色边框+浅色背景 |
| Disabled | 灰色，50%透明度 |

#### 代码示例

```tsx
// 标签组
<TagGroup multiple onChange={handleChange}>
  <Tag value="work" icon="💼">工作</Tag>
  <Tag value="study" icon="📚">学习</Tag>
  <Tag value="health" icon="🏃">健康</Tag>
  <Tag value="relationship" icon="💕">关系</Tag>
  <Tag value="entertainment" icon="🎮">娱乐</Tag>
  <Tag value="other" icon="✨">其他</Tag>
</TagGroup>
```

---

### 7. Avatar 头像

#### 尺寸

| 尺寸 | 大小 |
|------|------|
| Small | 32px |
| Medium | 48px |
| Large | 64px |
| XLarge | 96px |

#### 代码示例

```tsx
// 用户头像
<Avatar
  src={user.avatar}
  name={user.name}
  size="large"
  level={25}
/>

// 无头像
<Avatar name="张三" size="medium" level={10} />

// 成就头像
<Avatar
  type="achievement"
  icon="🏆"
  size="medium"
/>
```

---

### 8. Icon 图标

使用 **Lucide Icons** 作为基础图标库。

#### 常用图标映射

| 功能 | Lucide | 说明 |
|------|--------|------|
| 主页 | Home | 首页 |
| 用户 | User | 个人中心 |
| 设置 | Settings | 设置页 |
| 成就 | Trophy | 成就页 |
| 聊天 | MessageCircle | AI 对话 |
| 分享 | Share2 | 分享 |
| 日历 | Calendar | 日期 |
| 图表 | BarChart2 | 数据 |
| 火焰 | Flame | 连续记录 |
| 星星 | Star | 收藏 |
| 锁 | Lock | 锁定 |
| 解锁 | Unlock | 已解锁 |
| 前进 | ChevronRight | 导航 |
| 返回 | ChevronLeft | 返回 |
| 关闭 | X | 关闭 |

#### 代码示例

```tsx
import { Home, User, Settings, Trophy } from 'lucide-react';

// 使用
<Icon icon={Home} size={24} />
<Icon icon={Settings} size={20} color="primary" />

// 按钮中的图标
<Button>
  <Icon icon={Share2} size={16} />
  分享
</Button>
```

---

## 二、复合组件

### 1. Header 导航栏

#### 结构

```
┌─────────────────────────────────────┐
│ ← 返回    标题        ⚙️ 设置    →  │
│            副标题                   │
└─────────────────────────────────────┘
```

#### 变体

| 变体 | 特点 |
|------|------|
| Transparent | 透明背景 |
| Solid | 实色背景 |
| Blur | 模糊背景 |

#### 代码示例

```tsx
// 带返回和操作
<Header
  title="成就殿堂"
  leftAction={{ icon: ArrowLeft, onClick: goBack }}
  rightAction={{ icon: Settings, onClick: openSettings }}
/>

// 居中标题
<Header title="个人中心" />

// 带副标题
<Header
  title="人生向导"
  subtitle="与你对话中..."
/>
```

---

### 2. Sheet 底部抽屉

#### 用法

| 类型 | 用途 |
|------|------|
| Record | 每日记录 |
| Filter | 筛选 |
| Action | 操作菜单 |
| Preview | 预览 |

#### 代码示例

```tsx
<Sheet
  open={isOpen}
  onClose={handleClose}
  title="今日记录"
>
  <Sheet.Body>
    <MoodSelector value={mood} onChange={setMood} />
    <EnergySlider value={energy} onChange={setEnergy} />
    <TagSelector values={tags} onChange={setTags} />
  </Sheet.Body>
  <Sheet.Footer>
    <Button block onClick={handleSubmit}>
      存档今日
    </Button>
  </Sheet.Footer>
</Sheet>
```

---

### 3. Modal 模态框

#### 类型

| 类型 | 用途 |
|------|------|
| Confirm | 确认对话框 |
| Alert | 警告提示 |
| Success | 成功提示 |
| Achievement | 成就解锁 |

#### 代码示例

```tsx
// 确认框
<Modal
  open={isOpen}
  type="confirm"
  title="确认删除？"
  message="删除后无法恢复"
  confirmText="删除"
  cancelText="取消"
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>

// 成就解锁
<AchievementModal
  open={isUnlocked}
  achievement={{
    name: "连续奋战",
    icon: "🔥",
    description: "连续记录7天",
    percent: 65,
  }}
  onShare={handleShare}
  onClose={handleClose}
/>
```

---

### 4. Toast 提示

#### 类型

| 类型 | 图标 | 用途 |
|------|------|------|
| Success | ✓ | 成功 |
| Error | ✕ | 错误 |
| Warning | ⚠ | 警告 |
| Info | ℹ | 信息 |
| Loading | ◌ | 加载中 |

#### 代码示例

```tsx
// 显示提示
toast.show({
  type: 'success',
  message: '记录成功！',
  duration: 2000,
});

// 使用 Hook
const { show } = useToast();

show.success('存档成功！');
show.error('网络错误');
show.loading('保存中...');
```

---

### 5. Tooltip 提示

#### 位置

| 位置 | 说明 |
|------|------|
| Top | 上方 |
| Bottom | 下方 |
| Left | 左侧 |
| Right | 右侧 |

#### 代码示例

```tsx
<Tooltip content="查看更多" position="top">
  <Button icon={<Info />} />
</Tooltip>
```

---

### 6. Empty 空状态

#### 代码示例

```tsx
<Empty
  icon={Question}
  title="还没有记录"
  description="今天值得被记住，开始记录吧"
>
  <Button>记录今天</Button>
</Empty>
```

---

## 三、业务组件

### 1. ProgressBar 人生进度条

#### 组件结构

```
┌─────────────────────────────────────────┐
│  ████████████████████░░░░░░░░░░░░░░░  │
│  32.5%                                   │
│                                         │
│  你在地球的第 9,213 天                   │
│  Lv.25 · 第3章「探索」                  │
└─────────────────────────────────────────┘
```

#### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| days | number | 总天数 |
| progress | number | 进度百分比 |
| level | number | 等级 |
| chapter | object | 当前章节 |
| animate | boolean | 是否动画 |

#### 代码示例

```tsx
<ProgressBar
  days={9213}
  progress={32.5}
  level={25}
  chapter={{ num: 3, name: "探索", theme: "purple" }}
  animate
/>
```

---

### 2. MoodSelector 心情选择器

#### 组件结构

```
┌─────────────────────────────────────────┐
│  今天心情如何？                          │
│                                         │
│    😫      😐      🙂      😊      🤩  │
│     1       2       3       4       5   │
│                                         │
│         "心情不错！继续保持"             │
└─────────────────────────────────────────┘
```

#### 状态

| 心情 | Emoji | 颜色 | 描述 |
|------|-------|------|------|
| 极差 | 😫 | 灰 | 今天有点艰难 |
| 较差 | 😐 | 蓝灰 | 平静的一天 |
| 一般 | 🙂 | 蓝 | 普通的一天 |
| 不错 | 😊 | 橙 | 心情不错 |
| 极好 | 🤩 | 粉 | 太棒了 |

#### 代码示例

```tsx
<MoodSelector
  value={selectedMood}
  onChange={setMood}
  showDescription
/>
```

---

### 3. EnergySlider 能量滑块

#### 组件结构

```
┌─────────────────────────────────────────┐
│  今日能量                               │
│                                         │
│  💤 ────────────●─────────── 🔥        │
│                7                        │
│                                         │
│  "能量充沛！今天可以挑战更高目标"         │
└─────────────────────────────────────────┘
```

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | number | 5 | 当前值 0-10 |
| min | number | 0 | 最小值 |
| max | number | 10 | 最大值 |
| showIcon | boolean | true | 显示图标 |
| showLabel | boolean | true | 显示数值 |
| showDescription | boolean | true | 显示描述 |

#### 代码示例

```tsx
<EnergySlider
  value={energy}
  onChange={setEnergy}
  showIcon
  showLabel
  showDescription
/>
```

---

### 4. TagSelector 标签选择器

#### 组件结构

```
┌─────────────────────────────────────────┐
│  今天发生了什么？(可多选)                │
│                                         │
│  💼 工作  📚 学习  🏃 健康  💕 关系     │
│  🎮 娱乐  ✨ 其他                        │
│                                         │
│  已选 2 个                              │
└─────────────────────────────────────────┘
```

#### 代码示例

```tsx
<TagSelector
  values={selectedTags}
  onChange={setTags}
  max={3}
/>
```

---

### 5. InsightCard AI洞察卡片

#### 组件结构

```
┌─────────────────────────────────────────┐
│  🤖 人生向导                            │
│                                         │
│  "今天心情不错！继续保持..."              │
│                                         │
│                           查看详情 →     │
└─────────────────────────────────────────┘
```

#### 类型

| 类型 | 内容 |
|------|------|
| daily | 今日小结 |
| trend | 趋势分析 |
| correlation | 关联发现 |
| prediction | 预测建议 |

#### 代码示例

```tsx
<InsightCard
  type="daily"
  insight="今天心情不错！继续保持"
  onClick={() => openAIChat()}
/>
```

---

### 6. AchievementCard 成就卡片

#### 组件结构

```
┌─────────────────────────────────────────┐
│  ┌─────┐                               │
│  │ 🏆  │  连续奋战                     │
│  └─────┘  连续记录 7 天                │
│                                         │
│  超越 65% 用户    [分享]               │
└─────────────────────────────────────────┘
```

#### 状态

| 状态 | 样式 |
|------|------|
| Locked | 灰色，锁图标 |
| Available | 正常，渐变边框 |
| Unlocked | 正常，光环动画 |
| New | 新解锁标记 |

#### 代码示例

```tsx
<AchievementCard
  name="连续奋战"
  icon="🔥"
  description="连续记录7天"
  status="unlocked"
  percent={65}
  onShare={handleShare}
/>
```

---

### 7. StreakCard 连续记录卡片

#### 组件结构

```
┌─────────────────────────────────────────┐
│  🔥 连续冒险                            │
│                                         │
│           12                            │
│          天                             │
│                                         │
│  再坚持 5 天解锁「坚持者」               │
└─────────────────────────────────────────┘
```

#### 代码示例

```tsx
<StreakCard
  days={12}
  nextMilestone={17}
  nextAchievement="坚持者"
/>
```

---

### 8. ShareCard 分享卡片

#### 尺寸

| 类型 | 尺寸 | 用途 |
|------|------|------|
| Square | 1:1 | 朋友圈 |
| Story | 9:16 | 故事 |

#### 类型

| 类型 | 内容 |
|------|------|
| daily | 今日记录 |
| weekly | 周报 |
| achievement | 成就 |
| progress | 进度 |

#### 代码示例

```tsx
<ShareCard
  type="weekly"
  data={weeklyData}
  size="square"
  onGenerate={handleGenerate}
/>
```

---

### 9. ChatBubble 对话气泡

#### 类型

| 类型 | 位置 | 样式 |
|------|------|------|
| User | 右侧 | 主题色背景 |
| AI | 左侧 | 白色背景 |
| System | 居中 | 灰色小字 |

#### 代码示例

```tsx
// 用户消息
<ChatBubble type="user">
  今天心情不错！
</ChatBubble>

// AI 消息
<ChatBubble type="ai" typing={isTyping}>
  很高兴听到你今天心情不错！
</ChatBubble>
```

---

### 10. ChapterCard 章节卡片

#### 组件结构

```
┌─────────────────────────────────────────┐
│  🎬 第 3 章                             │
│                                         │
│          探 索                          │
│                                         │
│  世界很大，但你正在变大                   │
│                                         │
│  ═══════════════░░░░░  32%              │
└─────────────────────────────────────────┘
```

#### 代码示例

```tsx
<ChapterCard
  chapter={{
    num: 3,
    name: "探索",
    icon: "🔍",
    quote: "世界很大，但你正在变大",
  }}
  progress={32}
  isCurrent
/>
```

---

### 11. WeeklyChart 周报图表

#### 类型

| 类型 | 图表 |
|------|------|
| mood | 心情折线图 |
| energy | 能量柱状图 |
| tags | 标签饼图 |
| summary | 综合雷达图 |

#### 代码示例

```tsx
<WeeklyChart
  type="mood"
  data={weeklyData.mood}
/>

<WeeklyChart
  type="summary"
  data={weeklyData}
/>
```

---

### 12. LevelBadge 等级徽章

#### 组件结构

```
┌────────────────┐
│  Lv.25         │
│  ████████░░░  │
└────────────────┘
```

#### 属性

| 属性 | 说明 |
|------|------|
| level | 等级数字 |
| theme | 主题色 |
| showProgress | 显示升级进度 |

#### 代码示例

```tsx
<LevelBadge
  level={25}
  theme="purple"
  showProgress
/>
```

---

## 四、页面组件

### 1. HomePage 首页

#### 组件树

```
HomePage
├── Header
├── ProgressBar (Hero)
├── InsightCard (AI 洞察)
├── RecordCard (今日记录入口)
├── StreakCard (连续记录)
├── AchievementPreview (成就预览)
└── BottomNav
```

---

### 2. RecordSheet 记录抽屉

#### 组件树

```
RecordSheet
├── Sheet.Header
├── MoodSelector
├── EnergySlider
├── TagSelector
├── NoteInput
└── Sheet.Footer
    └── Button (存档今日)
```

---

### 3. ChatPage AI对话页

#### 组件树

```
ChatPage
├── Header (人生向导)
├── ChatList
│   └── ChatBubble[]
└── ChatInput
    └── Textarea + SendButton
```

---

### 4. AchievementPage 成就页

#### 组件树

```
AchievementPage
├── Header
├── ProgressSummary (解锁进度)
├── AchievementGrid
│   └── AchievementCard[]
└── Empty (若无成就)
```

---

### 5. ProfilePage 个人中心

#### 组件树

```
ProfilePage
├── UserHeader
│   ├── Avatar
│   ├── LevelBadge
│   └── Stats
├── ChapterList (章节历史)
├── AchievementSummary
├── WeeklyReport (周报入口)
└── Settings
```

---

## 五、使用规范

### 5.1 组件选择原则

1. **功能匹配** — 选择最符合功能的组件
2. **一致性** — 相同场景使用相同组件
3. **可组合性** — 优先组合而非修改
4. **渐进增强** — 先满足核心，逐步丰富

### 5.2 状态处理规范

每个交互组件必须处理：
- ✅ Loading 状态
- ✅ Error 状态
- ✅ Empty 状态
- ✅ Disabled 状态

### 5.3 响应式规范

- 触摸设备优先
- 最小触摸区域 44x44px
- 文字可缩放但不小于 12px

---

[返回设计目录](./README.md) | [返回文档中心](../README.md)
