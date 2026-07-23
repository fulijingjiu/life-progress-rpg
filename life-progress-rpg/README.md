# 人生进度条 RPG

> 把人生变成一场 RPG 游戏——爽感驱动打开，价值驱动留存，AI 让每一天都有意义。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-0.1.0-orange.svg)]()

## 核心特性

- **人生进度可视化** — 用 RPG 游戏的视角看待人生，量化每一天的价值
- **AI 人生向导** — 基于你的数据，AI 给出个性化的洞察和建议
- **游戏化成就系统** — 记录即经验值，解锁徽章，见证成长
- **精美分享卡片** — 一键生成，让朋友圈见证你的成长轨迹

## 快速开始

```bash
# 克隆项目
git clone https://github.com/yourusername/life-progress-rpg.git

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

详细说明请查看 [快速开始指南](./guide/getting-started.md)。

## 项目结构

```
life-progress-rpg/
├── docs/                   # 项目文档
│   ├── guide/            # 用户指南
│   ├── design/           # 设计文档
│   ├── tech/             # 技术文档
│   ├── planning/         # 规划文档
│   └── research/         # 研究文档
├── src/                   # 源代码
└── tests/                 # 测试文件
```

## 文档导航

### 新手上路

- [快速开始](./guide/getting-started.md) — 5 分钟快速上手
- [用户手册](./guide/user-guide.md) — 完整功能介绍
- [常见问题](./guide/faq.md) — FAQ

### 设计文档

- [产品概念](./design/concept.md) — 产品定位与愿景
- [UX 设计规范](./design/ux-spec-v2.md) — 最新交互设计
- [视觉设计](./design/visual-design.md) — 视觉规范
- [动效设计](./design/motion-design.md) — 动效规范
- [文案设计](./design/copywriting.md) — 文案风格指南

### 技术文档

- [系统架构](./tech/architecture.md) — 技术架构设计
- [数据库设计](./tech/database.md) — 数据模型
- [前端技术](./tech/frontend.md) — 前端技术栈
- [AI 接入设计](./tech/ai-design.md) — AI 对话系统
- [游戏化设计](./tech/gamification.md) — 游戏机制

### 规划文档

- [产品路线图](./planning/roadmap.md) — 开发计划
- [版本里程碑](./planning/milestone-v1.md) — MVP 规划
- [变更日志](./planning/changelog.md) — 版本更新

### 研究文档

- [竞品分析](./research/competitive-analysis.md) — 市场竞争分析
- [用户研究](./research/user-research.md) — 用户画像与需求

## 核心概念

### 爽感 + 价值 双轮驱动

```
        ┌─────────────┐
        │   用户打开   │
        └──────┬──────┘
               │
        ┌──────┴──────┐
        │             │
   ┌────┴────┐   ┌────┴────┐
   │  爽感层  │   │  价值层  │
   │ (情绪)   │   │ (理性)   │
   └────┬────┘   └────┬────┘
        │             │
        │ 爽感让你打开 │
        │ 价值让你留下 │
        └─────────────┘
```

### AI 价值层级

| 层级 | 能力 | 示例 |
|------|------|------|
| L1 | 记录总结 | "今天能量值 7，心情不错" |
| L2 | 趋势分析 | "本周心情比上周提升 0.5" |
| L3 | 关联发现 | "能量值低的日子 87% 与加班相关" |
| L4 | 预测建议 | "下周三如果完成运动，能量值预计提升 23%" |
| L5 | 人生规划 | "基于你的数据，建议 35 岁前完成..." |

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

[MIT License](./LICENSE)

---

*让每一秒都值得被记录。*
