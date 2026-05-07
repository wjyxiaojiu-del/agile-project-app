# 研途启航 - 敏捷项目管理系统

一个基于 Scrum 敏捷框架的全栈项目管理 Web 应用，专为研究生入学准备场景设计。

## 功能特性

- **控制台** — 项目总览、燃尽图、里程碑跟踪（含达成动画）、风险概览
- **事件待办** — 事件管理，支持行内状态切换、批量删除、优先级筛选、搜索
- **任务看板** — 5 列拖拽看板（待办→本周计划→进行中→待验收→已完成），支持 WIP 限制
- **迭代规划** — Sprint 创建/删除、目标设定、工作量分布、待办列表
- **每日日程** — 时间线布局、今日概览、任务勾选器、快速记录、阻塞高亮
- **风险管控** — 概率×影响评估矩阵、批量删除、状态流转
- **项目报告** — 自动统计、交付物清单、一键导出报告

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | React 18 + Vite + Tailwind CSS |
| 拖拽 | @dnd-kit/core |
| 图表 | Recharts |
| 图标 | Lucide React |
| 后端 | Vercel Serverless Functions (Node.js) |
| 数据库 | SQLite (sql.js) |
| 部署 | Vercel |
| 样式 | Apple 风格毛玻璃 (Glassmorphism) |

## 设计亮点

- 毛玻璃质感：`backdrop-filter: blur(40-60px) saturate(200-220%)`
- 弹性动画：基于 `cubic-bezier(0.34, 1.56, 0.64, 1)` 的 spring bounce
- 图标呼吸动画：旋转、弹跳、摇晃、闪烁四种动效
- 里程碑达成点赞反馈动画
- 支持 `prefers-reduced-motion` 无障碍适配

## 在线预览

**Vercel**: https://agile-project-app-master.vercel.app

## 本地开发

```bash
# 安装依赖
npm install

# 启动前端开发服务器
npx vite

# 启动后端（本地模式）
node server/index.js
```

## 部署

### Vercel（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wjyxiaojiu-del/agile-project-app)

1. 点击上方按钮，用 GitHub 账号登录 Vercel
2. 项目会自动导入并部署
3. 访问 `/api/seed` 初始化预置数据

### Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## 项目结构

```
├── api/                    # Vercel Serverless Functions
│   ├── _db.js             # 数据库连接与建表
│   ├── seed.js            # 数据初始化
│   ├── projects.js
│   ├── stories.js
│   ├── tasks.js
│   ├── sprints.js
│   ├── standups.js
│   ├── risks.js
│   └── milestones.js
├── server/                 # 本地开发后端
│   ├── db.js
│   ├── index.js
│   ├── seed.js
│   └── routes/
├── src/                    # React 前端
│   ├── components/
│   │   ├── Modal.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Toast.jsx
│   │   ├── LoadingSkeleton.jsx
│   │   └── ErrorState.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Backlog.jsx
│   │   ├── SprintBoard.jsx
│   │   ├── SprintPlan.jsx
│   │   ├── Standup.jsx
│   │   ├── Risks.jsx
│   │   └── Report.jsx
│   ├── context/
│   │   └── ProjectContext.jsx
│   ├── App.jsx
│   ├── api.js
│   ├── main.jsx
│   └── index.css
├── vercel.json
├── package.json
└── vite.config.js
```

## 预置数据

- 1 个项目（研途启航）
- 4 个 Sprint（入学筹备/学术启航/深度积累/整装待发）
- 18 个事件（S/A/B/C/D 五级优先级）
- 34 个任务
- 5 个风险案例
- 4 个里程碑
- 8 项交付物清单

## License

MIT
