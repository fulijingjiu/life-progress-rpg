# 游戏化设计

> 核心数值、游戏机制、成就系统

## 一、核心数值体系

### 1.1 基础数值

| 数值 | 计算方式 | 用途 |
|------|----------|------|
| 人生进度 | 已活天数 / 预期总天数 × 100% | 主进度条 |
| 章节进度 | 当前年龄在章节内的位置 | 章节进度条 |
| 等级 (Lv) | = 年龄 | 角色等级 |
| 经验值 (XP) | 每日记录 +1XP | 升级经验 |
| 天数 | 从出生到今天的总天数 | 震撼数字 |

### 1.2 人生章节

| 章节 | 年龄范围 | 主题色 | 描述 |
|------|----------|--------|------|
| 🌱 萌芽 | 0-6 | 绿色 | 生命的开始 |
| 📚 求学 | 7-22 | 蓝色 | 学习与成长 |
| 🔍 探索 | 23-30 | 紫色 | 寻找方向 |
| 🌿 扎根 | 31-45 | 橙色 | 建立根基 |
| 🌸 绽放 | 46-60 | 粉色 | 影响力爆发 |
| 🍂 沉淀 | 61-75 | 棕色 | 智慧传承 |
| 🌅 归途 | 76+ | 金色 | 回首与珍惜 |

### 1.3 章节切换机制

```typescript
interface Chapter {
  id: number;
  name: string;
  emoji: string;
  ageStart: number;
  ageEnd: number;
  description: string;
  theme: string;
  objectives: ChapterObjective[];
}

interface ChapterObjective {
  type: 'influence' | 'relationship' | 'skill';
  target: number;
  description: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    name: '萌芽',
    emoji: '🌱',
    ageStart: 0,
    ageEnd: 6,
    description: '生命的开始，每一天都是新技能',
    theme: '#10B981',
    objectives: [],
  },
  // ...
];
```

---

## 二、经验值系统

### 2.1 XP 来源

| 行为 | XP | 条件 |
|------|-----|------|
| 每日记录 | +1 XP | 每天首次记录 |
| 连续记录 | +2 XP | 连续3天以上 |
| AI 对话 | +0.5 XP | 每轮对话 |
| 分享卡片 | +3 XP | 实际分享 |
| 解锁成就 | +5 XP | 每个成就 |
| 章节切换 | +20 XP | 进入新章节 |

### 2.2 升级机制

```typescript
// 升级所需 XP = 等级 × 10
function getXPForLevel(level: number): number {
  return level * 10;
}

// 检查是否升级
function checkLevelUp(currentXP: number, currentLevel: number): {
  newXP: number;
  newLevel: number;
  leveledUp: boolean;
} {
  const xpNeeded = getXPForLevel(currentLevel);
  
  if (currentXP >= xpNeeded) {
    return {
      newXP: currentXP - xpNeeded,
      newLevel: currentLevel + 1,
      leveledUp: true,
    };
  }
  
  return {
    newXP: currentXP,
    newLevel: currentLevel,
    leveledUp: false,
  };
}
```

### 2.3 连续记录加成

```typescript
const STREAK_BONUS: Record<number, number> = {
  3: 2,    // 连续3天 +2 XP
  7: 5,    // 连续7天 +5 XP
  14: 10,  // 连续14天 +10 XP
  30: 20,  // 连续30天 +20 XP
  100: 50, // 连续100天 +50 XP
  365: 100,// 连续365天 +100 XP
};

function getStreakBonus(streakDays: number): number {
  const bonuses = Object.entries(STREAK_BONUS)
    .map(([days, bonus]) => ({ days: Number(days), bonus }))
    .sort((a, b) => b.days - a.days);
  
  return bonuses.find(b => streakDays >= b.days)?.bonus ?? 1;
}
```

---

## 三、成就系统

### 3.1 成就分类

| 分类 | 说明 | 示例 |
|------|------|------|
| 🌱 入门 | 首次行为 | 萌芽者、首次记录 |
| 🔥 坚持 | 连续记录 | 连续7天、连续30天 |
| 📊 数据 | 达到数据目标 | 记录满100天、心情累计 |
| 💎 洞察 | AI 互动 | 首次 AI 对话、查看周报 |
| 🚀 社交 | 分享传播 | 分享达人、被点赞 |
| 🏆 章节 | 人生里程碑 | 进入新章节、章节通关 |
| 🎯 目标 | 自定义目标 | 完成自定义目标 |

### 3.2 成就列表

```typescript
interface Achievement {
  id: string;
  category: string;
  title: string;
  emoji: string;
  description: string;
  condition: AchievementCondition;
  xp_reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const ACHIEVEMENTS: Achievement[] = [
  // 入门类
  {
    id: 'first_record',
    category: '入门',
    title: '萌芽者',
    emoji: '🌱',
    description: '完成首次记录',
    condition: { type: 'record_count', value: 1 },
    xp_reward: 5,
    rarity: 'common',
  },
  
  // 坚持类
  {
    id: 'streak_7',
    category: '坚持',
    title: '连续7天',
    emoji: '🔥',
    description: '连续记录7天',
    condition: { type: 'streak', value: 7 },
    xp_reward: 10,
    rarity: 'rare',
  },
  {
    id: 'streak_30',
    category: '坚持',
    title: '连续30天',
    emoji: '💎',
    description: '连续记录30天',
    condition: { type: 'streak', value: 30 },
    xp_reward: 30,
    rarity: 'epic',
  },
  {
    id: 'streak_100',
    category: '坚持',
    title: '百日修行',
    emoji: '🏆',
    description: '连续记录100天',
    condition: { type: 'streak', value: 100 },
    xp_reward: 100,
    rarity: 'legendary',
  },
  
  // AI 类
  {
    id: 'first_ai',
    category: '洞察',
    title: '洞察者',
    emoji: '💡',
    description: '首次使用 AI 分析',
    condition: { type: 'ai_conversation_count', value: 1 },
    xp_reward: 5,
    rarity: 'common',
  },
  {
    id: 'ai_master',
    category: '洞察',
    title: '人生导师',
    emoji: '🧙',
    description: '与 AI 对话 50 次',
    condition: { type: 'ai_conversation_count', value: 50 },
    xp_reward: 25,
    rarity: 'epic',
  },
  
  // 社交类
  {
    id: 'first_share',
    category: '社交',
    title: '分享达人',
    emoji: '🚀',
    description: '首次分享卡片',
    condition: { type: 'share_count', value: 1 },
    xp_reward: 5,
    rarity: 'common',
  },
  {
    id: 'viral',
    category: '社交',
    title: '病毒传播',
    emoji: '🌊',
    description: '分享卡片被点赞 100 次',
    condition: { type: 'share_likes', value: 100 },
    xp_reward: 50,
    rarity: 'legendary',
  },
];
```

### 3.3 成就解锁检测

```typescript
async function checkAchievements(userId: string) {
  const user = await getUser(userId);
  const records = await getRecords(userId, { limit: 365 });
  const achievements = await getAchievements(userId);
  
  const unlockedIds = new Set(achievements.map(a => a.type));
  
  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;
    
    if (checkCondition(achievement.condition, user, records)) {
      await unlockAchievement(userId, achievement);
      await notifyAchievement(achievement);
    }
  }
}

function checkCondition(
  condition: AchievementCondition,
  user: User,
  records: Record[]
): boolean {
  switch (condition.type) {
    case 'record_count':
      return records.length >= condition.value;
    case 'streak':
      return calculateStreak(records) >= condition.value;
    case 'ai_conversation_count':
      return user.ai_conversations >= condition.value;
    case 'share_count':
      return user.share_count >= condition.value;
    // ...
  }
}
```

---

## 四、排行榜系统

### 4.1 排行榜类型

| 类型 | 排序方式 | 可见性 |
|------|----------|--------|
| 同龄人进度 | 人生进度百分比 | 公开 |
| 连续记录 | 连续天数 | 公开 |
| 影响力 | 分享次数 + 互动 | 公开 |
| 本周活跃 | 本周记录数 | 公开 |

### 4.2 排行榜查询

```typescript
// 获取排行榜
async function getLeaderboard(
  type: LeaderboardType,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  switch (type) {
    case 'progress':
      return prisma.$queryRaw`
        SELECT u.id, u.nickname, u.avatar_url,
          ROUND(
            (EXTRACT(YEAR FROM AGE(NOW(), make_date(u.birthday_year, 1, 1))) * 365 + 
             EXTRACT(DOY FROM AGE(NOW(), make_date(u.birthday_year, 1, 1))))::numeric / 
            (u.life_expectancy * 365) * 100, 2
          ) as progress
        FROM users u
        ORDER BY progress DESC
        LIMIT ${limit}
      `;
      
    case 'streak':
      return getStreakLeaderboard(limit);
      
    // ...
  }
}
```

---

## 五、游戏化反馈

### 5.1 即时反馈

```typescript
interface FeedbackConfig {
  type: 'xp' | 'streak' | 'achievement' | 'level_up';
  animation: 'pop' | 'bounce' | 'glow';
  sound?: string;
  duration: number;
}

const FEEDBACK_CONFIG: Record<string, FeedbackConfig> = {
  xp_gain: {
    type: 'xp',
    animation: 'pop',
    duration: 1000,
  },
  streak_update: {
    type: 'streak',
    animation: 'bounce',
    sound: 'fire_whoosh',
    duration: 1500,
  },
  achievement_unlock: {
    type: 'achievement',
    animation: 'glow',
    sound: 'victory',
    duration: 3000,
  },
};
```

### 5.2 激励文案

```typescript
const MOTIVATION_TEXTS = {
  xp_gain: [
    '+1 经验值，继续加油！',
    '又进步了一点 ✨',
    '今天的你，比昨天更好',
  ],
  streak_update: [
    '🔥 连续记录！坚持就是力量',
    '你已经坚持 {days} 天了！',
    '每一步都算数，继续！',
  ],
  achievement_unlock: [
    '🏆 新成就解锁！',
    '太棒了！你做到了！',
    '这是你应得的荣耀',
  ],
};
```

---

[返回技术目录](./README.md) | [返回项目根目录](../README.md)
