# 人生进度条 RPG

一个本地优先的个人记录 MVP：用可关闭的估算进度吸引第一次注意，让低负担记录立即得到具体回应，并把累积记录逐渐变成可核对的个人线索。

> 当前版本：v0.1 实施阶段
> 唯一实施基线：[MVP 规划](./docs/planning/milestone-v1.md)

## v0.1 范围

- 可关闭、明确标注为“估算”的人生进度
- 心情 1～5、能量 0～10、标签和可选备注
- IndexedDB 本地持久化
- 历史记录的查看、编辑和删除
- JSON 导入、导出和清空
- 默认本地规则生成有事实依据的当日回应
- 回应的“有帮助 / 没帮助 / 事实不准确”反馈
- 经用户同意、通过服务端代理的可选 AI 文字整理
- 离线、错误回退、隐私控制和基础无障碍

v0.1 不包含账号、云同步、公开分享、排行榜、正式成就/XP、报告、深度 AI 对话或人生规划。

## 技术栈

- React 18 + TypeScript
- Vite
- Zustand
- Dexie / IndexedDB
- Tailwind CSS
- Framer Motion
- Vitest

## 开发

要求 Node.js 18 或更高版本。

```bash
npm install
npm run dev
```

常用验证：

```bash
npm run lint
npm run test -- --run
npm run build
python .codex/skills/implement-life-progress-rpg/scripts/validate_project.py
git diff --check
```

默认本地规则模式不需要 AI Key。真实 AI 密钥只能配置在服务端，禁止使用 `VITE_*_API_KEY`。

## AI 实现入口

项目提供仓库级 Skill：

```text
$implement-life-progress-rpg
```

推荐提示：

```text
使用 $implement-life-progress-rpg 按项目规则实现并验证 v0.1 的下一个 P0 垂直切片。
```

完整自主执行流程见 [AI 实现执行 Loop](./docs/planning/ai-implementation-loop.md)。

## 文档

- [文档中心](./docs/README.md)
- [项目概念](./docs/design/concept.md)
- [MVP 规划](./docs/planning/milestone-v1.md)
- [AI 实现执行 Loop](./docs/planning/ai-implementation-loop.md)
- [UX 规范](./docs/design/ux-spec-v2.md)
- [界面、交互与内容质量基线](./docs/design/quality-bar.md)
- [内容价值与个人分析策略](./docs/design/content-strategy.md)
- [系统架构](./docs/tech/architecture.md)
- [代码结构与技术栈边界](./docs/tech/code-structure.md)
- [数据设计](./docs/tech/database.md)
- [AI 接入与安全](./docs/tech/ai-design.md)
- [开发快速开始](./docs/guide/getting-started.md)
- [常见问题](./docs/guide/faq.md)

## 项目规则

所有贡献者和编码 AI 必须遵守根目录 [AGENTS.md](./AGENTS.md)。发生冲突时，以 MVP 规划和技术安全文档为准。

## 许可证

[MIT License](./LICENSE)
