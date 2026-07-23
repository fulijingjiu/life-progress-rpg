# 开发快速开始

> 适用于 v0.1 本地优先版本

## 环境要求

| 工具 | 要求 |
|------|------|
| Node.js | 使用项目声明的受支持版本 |
| npm | 与锁文件兼容的版本 |
| 浏览器 | 支持 IndexedDB 的现代浏览器 |

## 启动

```bash
git clone <repository-url>
cd life-progress-rpg
npm install
cp .env.example .env.local
npm run dev
```

`<repository-url>` 是占位符，发布文档前必须替换为真实地址。若项目未提供 `.env.example`，应先补齐，不能让开发者猜测变量。

## 默认本地模式

v0.1 默认不需要数据库和 AI Key：

```dotenv
VITE_USE_LOCAL_STORAGE=true
VITE_AI_MODE=rules
```

数据保存在当前浏览器的 IndexedDB。清理浏览器站点数据可能导致记录丢失，请使用设置中的 JSON 导出功能备份。

## 可选 AI 模式

浏览器端禁止配置 `VITE_AI_API_KEY` 或任何供应商密钥。真实 AI 必须由单独的服务端代理调用：

```dotenv
# 前端只知道同源代理地址
VITE_AI_MODE=proxy
VITE_AI_PROXY_PATH=/api/reflections
```

供应商密钥只配置在服务端运行环境，例如：

```dotenv
AI_PROVIDER_API_KEY=<server-only-secret>
AI_PROVIDER_MODEL=<server-configured-model>
```

服务端变量不得以 `VITE_` 开头，不得提交到 Git，不得输出到日志。

## 启动后验证

1. 首次引导只要求出生年份，并可关闭进度展示。
2. 创建记录后刷新页面，数据仍然存在。
3. 断网后仍可创建、编辑和导出记录。
4. 默认规则复盘不发起网络请求。
5. 未同意 AI 时代理调用被阻止。
6. 生产构建产物中搜索不到 API Key。

## 常用检查

以 `package.json` 中已有脚本为准，通常包括：

```bash
npm run build
npm run lint
npm run test
```

若脚本不存在，应先在项目中添加对应配置，而不是在文档中假定它存在。

[返回指南目录](./README.md) | [返回文档中心](../README.md)
