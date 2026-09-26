# 人生进度条 RPG

一个本地优先的个人记录 MVP：用可关闭的估算进度吸引第一次注意，让低负担记录立即得到具体回应，并把累积记录逐渐变成可核对的个人线索。

> 更新时间：2026-09-27
> 当前版本：v0.1 实施阶段
> 唯一实施基线：[MVP 规划](./docs/项目规划/里程碑v1.md)

## v0.1 范围

- 可关闭、明确标注为“估算”的人生进度
- 心情 1～5、能量 0～10、标签和可选备注
- IndexedDB 本地持久化
- 历史记录的查看、编辑和删除
- JSON 导入、导出和清空
- 默认本地规则生成有事实依据的当日回应
- 回应的“有帮助 / 没帮助 / 事实不准确”反馈
- 经用户同意的可选 AI 文字整理：客户端契约与失败回退已实现；服务端代理尚未实施，当前启用后实际回退本地回应
- 离线、错误回退、隐私控制和基础无障碍

v0.1 不包含账号、云同步、公开分享、排行榜、正式成就/XP、报告、深度 AI 对话或人生规划。

## 技术栈

- React 18 + TypeScript
- Vite 5
- React Router 6（loader 路由守卫）
- Dexie / IndexedDB
- date-fns + clsx
- 原生 CSS 变量主题
- Vitest（单元）+ Playwright（E2E）

## 开发

要求 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

常用验证：

```bash
npm run lint
npm run test -- --run
npm run test:e2e
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

## 文档

- [文档中心](./docs/README.md)
- [项目概念](./docs/产品设计/产品概念.md)
- [MVP 规划](./docs/项目规划/里程碑v1.md)
- [实施状态](./docs/项目规划/实施状态.md)
- [功能点清单](./docs/功能清单/功能点.md) / [功能测试清单](./docs/功能清单/功能测试.md)
- [UX 规范](./docs/产品设计/交互规范.md)
- [界面、交互与内容质量基线](./docs/产品设计/质量门槛.md)
- [内容价值与个人分析策略](./docs/产品设计/内容策略.md)
- [系统架构](./docs/技术设计/架构设计.md)
- [代码结构与技术栈边界](./docs/技术设计/代码结构.md)
- [数据设计](./docs/技术设计/数据库设计.md)
- [AI 接入与安全](./docs/技术设计/AI设计.md)
- [开发快速开始](./docs/使用指南/快速开始.md)
- [常见问题](./docs/使用指南/常见问题.md)

## 项目规则

所有贡献者和编码 AI 必须遵守根目录 [AGENTS.md](./AGENTS.md)。发生冲突时，以 MVP 规划和技术安全文档为准。

## 许可证

[MIT License](./LICENSE)
