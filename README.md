# 研途启航 - 研究生项目管理系统

一个基于 Scrum 敏捷框架的全栈项目管理 Web 应用，专为研究生入学准备场景设计。

## 功能特性

- **控制台** — 项目总览、燃尽图、里程碑跟踪、风险概览
- **事件待办** — 用户故事管理，支持优先级筛选、搜索、CRUD
- **任务看板** — 5列拖拽看板（待办→本周计划→进行中→待验收→已完成），支持 WIP 限制
- **迭代规划** — Sprint 目标设定、故事点分布、待办列表
- **每日日程** — 站会三问日志（昨日回顾/今日计划/障碍风险）
- **风险管控** — 概率×影响评估矩阵、风险 CRUD、状态流转
- **项目报告** — 自动统计、交付物清单、一键导出报告

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | React 18 + Vite + Tailwind CSS |
| 拖拽 | @dnd-kit/core |
| 图表 | Recharts |
| 后端 | Vercel Serverless Functions |
| 数据库 | Vercel Postgres (Neon) |
| 部署 | Vercel |

## 本地开发

```bash
# 安装依赖
npm install

# 启动前端开发服务器
npx vite

# 启动后端（本地模式需额外配置）
node server/index.js
```

## 在线预览

- **GitHub Pages**：https://wjyxiaojiu-del.github.io/agile-project-app/
- **Vercel**：（见下方部署步骤）

## 部署

### 方式一：Vercel Dashboard（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wjyxiaojiu-del/agile-project-app)

1. 点击上方按钮，用 **GitHub 账号** 登录 Vercel
2. 项目会自动导入并部署
3. 进入项目 Dashboard → **Storage** → 创建 **Postgres** 数据库
4. Vercel 会自动将 `POSTGRES_URL` 添加到环境变量
5. 访问 `https://你的域名/api/seed` 初始化数据

> 如果不用一键按钮，也可以手动去 [vercel.com](https://vercel.com) → Add New Project → 导入本仓库。

### 方式二：Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### 方式三：GitHub Pages（纯静态，无后端）

已自动部署：每次 push 到 `master` 分支会自动构建。

- 地址：https://wjyxiaojiu-del.github.io/agile-project-app/
- 注意：GitHub Pages 仅托管前端静态页面，后端 API 和数据库不可用。

## 项目结构

```
├── api/                    # Vercel Serverless Functions
│   ├── _db.js             # 数据库连接与工具函数
│   ├── seed.js            # 数据初始化
│   ├── projects.js
│   ├── stories.js
│   ├── tasks.js
│   ├── sprints.js
│   ├── standups.js
│   └── risks.js
├── server/                 # 本地开发后端
│   ├── db.js
│   ├── index.js
│   ├── seed.js
│   └── routes/
├── src/                    # React 前端
│   ├── components/
│   │   ├── Modal.jsx
│   │   └── Sidebar.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Backlog.jsx
│   │   ├── SprintBoard.jsx
│   │   ├── SprintPlan.jsx
│   │   ├── Standup.jsx
│   │   ├── Risks.jsx
│   │   └── Report.jsx
│   ├── App.jsx
│   ├── api.js
│   ├── main.jsx
│   └── index.css
├── vercel.json
├── package.json
└── vite.config.js
```

## 预置数据

- 1个项目（研途启航）
- 4个 Sprint（入学筹备/学术启航/深度积累/整装待发）
- 18个用户故事（P0/P1/P2 三级优先级）
- 34个任务
- 5个风险案例
- 4个里程碑

## License

MIT
