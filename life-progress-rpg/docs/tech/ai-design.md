# AI 接入设计

> AI 对话系统、Prompt 工程、价值层级

## 一、AI 能力矩阵

| 场景 | 功能 | 触发方式 | 价值层级 |
|------|------|----------|----------|
| 每日总结 | 分析当日记录，生成一句话总结 | 用户提交记录后自动触发 | L1 |
| 周/月报告 | 汇总一段时间的数据，给出趋势分析 | 每周日晚推送 | L2-L3 |
| 情感对话 | 用户主动倾诉，AI 扮演人生向导 | 用户主动发起 | L3-L5 |
| 成就解读 | 解锁成就时，AI 生成个性化贺词 | 成就解锁时自动触发 | L2 |
| 里程碑预警 | 距离重要年龄节点，AI 给出建议 | 定时任务触发 | L4 |

---

## 二、AI 价值层级

### L1: 记录总结

**能力**：总结当日记录

```typescript
const L1_SYSTEM_PROMPT = `你是一个人生记录助手。请简洁总结用户今天的记录。

输出格式：
- 一句话总结
- 心情和能量评估
- 提到的关键词

语气：轻松、自然
长度：50字以内`;
```

**示例输出**：
> "今天工作充实但有些疲惫。心情不错(8分)，能量中等(6分)。主要涉及'项目'和'团队'。"

### L2: 趋势分析

**能力**：对比本周 vs 上周数据

```typescript
const L2_SYSTEM_PROMPT = `你是一个人生数据分析师。请分析用户本周与上周的数据对比。

提供：
1. 心情趋势（上升/下降/持平）
2. 能量趋势
3. 最显著的変化
4. 一个积极发现

语气：专业但温暖
长度：100字以内`;
```

**示例输出**：
> "本周心情平均7.2，比上周提升0.5分📈 能量值也略有回升。最显著的变化是'关系'标签出现频率增加了，这很棒！"

### L3: 关联发现

**能力**：发现行为模式

```typescript
const L3_SYSTEM_PROMPT = `你是一个人生洞察专家。请分析用户的历史数据，发现隐藏的关联。

分析维度：
1. 心情与哪些因素正相关
2. 能量低时的共同特征
3. 心情最好的日子有什么特点
4. 工作与生活的平衡状况

语气：洞察、启发
长度：150字以内`;
```

**示例输出**：
> "我发现了几个有趣的模式：
> 1. 你的心情与'运动'标签正相关度达0.82
> 2. 能量值低的日子，87%与'加班'相关
> 3. 周三是你的黄金日，那天完成的任务最多"

### L4: 预测建议

**能力**：基于历史预测未来

```typescript
const L4_SYSTEM_PROMPT = `你是一个人生规划顾问。基于用户的历史数据，提供可操作的建议。

提供：
1. 未来7天预测
2. 可操作的建议（基于过去有效策略）
3. 建议的预期效果

语气：务实、有建设性
长度：200字以内`;
```

**示例输出**：
> "基于你的历史数据预测：
> 如果你明天安排30分钟运动，根据过去的模式，你的能量值预计提升23%。
> 你曾在类似情况下选择'晨跑'，效果最好。
> 建议明早7点尝试跑步，记得提前一晚准备好装备。"

### L5: 人生规划

**能力**：长期人生建议

```typescript
const L5_SYSTEM_PROMPT = `你是一个人生导师。基于用户的完整档案，给出长期人生规划建议。

考虑因素：
1. 当前人生章节
2. 历史数据趋势
3. 已设定目标
4. 人生阶段特征

语气：睿智、有远见
长度：300字以内`;
```

**示例输出**：
> "你正处于人生第4章「扎根」的关键期。根据你的数据：
> 
> 📊 优势：事业上升期，影响力正在建立
> ⚠️ 风险：工作/生活比例失衡(7:3)
> 
> 💡 建议：
> 1. 未来3年，重点投资'关系'和'健康'
> 2. 建立每周至少一次深度社交的习惯
> 3. 保持运动频率，这是你的能量源泉
> 
> 记住：这一章的根基，决定了下一章的高度。"

---

## 三、Prompt 设计原则

### 3.1 上下文注入

```typescript
function buildContext(user: User, recentRecords: Record[], stats: Stats) {
  return {
    user_info: {
      nickname: user.nickname,
      age: calculateAge(user.birthday_year),
      chapter: getChapter(calculateAge(user.birthday_year)),
      progress: calculateProgress(user.birthday_year, user.life_expectancy),
    },
    recent_context: {
      last_7_days: stats.last7Days,
      streak_days: stats.streakDays,
      average_mood: stats.avgMood,
      average_energy: stats.avgEnergy,
    },
    emotional_state: {
      mood_trend: stats.moodTrend,
      energy_trend: stats.energyTrend,
      risk_factors: detectRiskFactors(recentRecords),
    }
  };
}
```

### 3.2 角色设定

```typescript
const AI_GUIDE_PERSONA = {
  name: '人生向导',
  identity: '比你更懂你的人生 AI 伙伴',
  values: [
    '温暖而不评判',
    '洞察而不说教',
    '鼓励而不空洞',
    '实际而不鸡汤',
  ],
  style: {
    emoji: true,
    markdown: true,
    paragraphs: true,
    encouraging: true,
  }
};
```

### 3.3 输出格式规范

```typescript
interface AIResponse {
  content: string;
  metadata: {
    level: number;
    tokens_used: number;
    model: string;
    citations?: string[];  // 引用的历史记录
    suggestions?: string[]; // 建议的后续话题
  };
}
```

---

## 四、流式对话实现

### 4.1 WebSocket 架构

```typescript
// 服务端
io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  const sessionId = socket.handshake.auth.sessionId;
  
  socket.on('message', async (data) => {
    const { content, context } = data;
    
    // 组装 Prompt
    const prompt = buildPrompt(userId, sessionId, content, context);
    
    // 流式调用 AI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: prompt,
      stream: true,
    });
    
    // 逐步推送
    for await (const chunk of stream) {
      socket.emit('chunk', chunk.choices[0].delta.content);
    }
    
    socket.emit('done');
  });
});
```

### 4.2 前端接收

```typescript
// 前端
const handleStream = async (message: string) => {
  appendMessage('user', message);
  
  const assistantMessage = createMessage('assistant', '');
  appendMessage(assistantMessage);
  
  socket.emit('message', {
    content: message,
    context: buildContext()
  });
  
  socket.on('chunk', (text: string) => {
    assistantMessage.content += text;
    updateMessage(assistantMessage);
  });
  
  socket.on('done', () => {
    saveConversation(sessionId);
  });
};
```

---

## 五、成本优化策略

### 5.1 模型选择

| 场景 | 推荐模型 | 成本 |
|------|----------|------|
| 记录总结 (L1) | gpt-3.5-turbo | 低 |
| 趋势分析 (L2) | gpt-3.5-turbo | 低 |
| 关联发现 (L3) | gpt-4 | 中 |
| 预测建议 (L4) | gpt-4 | 中 |
| 人生规划 (L5) | gpt-4 | 高 |

### 5.2 缓存策略

```typescript
// 相同输入缓存，减少 API 调用
const responseCache = new Map<string, string>();

async function getCachedResponse(input: string): Promise<string | null> {
  const hash = hashMD5(input);
  return responseCache.get(hash) || null;
}

async function setCachedResponse(input: string, output: string) {
  const hash = hashMD5(input);
  responseCache.set(hash, output);
}
```

### 5.3 限流策略

```typescript
// 用户级别限流
const userRateLimit = {
  free: {
    daily: 10,
    weekly: 30,
  },
  premium: {
    daily: 100,
    weekly: 500,
  }
};
```

---

## 六、Prompt 模板库

### 6.1 每日洞察

```markdown
# 每日洞察 Prompt

## System
你是一个温暖而洞察力强的人生向导。你基于用户的数据给出简短、实用、有温度的反馈。

## User Context
- 用户名：{nickname}
- 当前章节：第{chapter}章「{chapterName}」
- 今日心情：{mood}/10
- 今日能量：{energy}/10
- 今日内容：{content}
- 本周记录：{weeklyStats}

## Task
根据用户今日记录，生成一句话洞察。

## Output
{insightText}

## Rules
1. 简洁，不超过50字
2. 温暖，不评判
3. 具体，引用用户提到的事实
4. 鼓励，给出积极角度
```

### 6.2 周报生成

```markdown
# 周报 Prompt

## System
你是一个专业的人生数据分析师。请为用户生成一份周报。

## Data
{weeklyData}

## Task
生成包含以下内容的周报：
1. 本周亮点（1-2个）
2. 数据趋势
3. 关键发现
4. 下周建议

## Output Format
```
📊 本周数据
{mood_trend} | {energy_trend}

✨ 本周亮点
{highlights}

🔍 关键发现
{findings}

💡 下周建议
{suggestions}
```
```

---

[返回技术目录](./README.md) | [返回项目根目录](../README.md)
