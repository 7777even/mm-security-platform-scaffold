# mm-security-frontend

安全管控指挥系统 — 前端基座。Vue3 + TS + Vite + wujie 微前端 + Cesium 一张图，纯前端无 Node 后端。

与后端的对接北向约定：遵循本库 `AGENTS.md` §3 API 契约；机器可读契约的**单一真源**在本库 `docs/api/*.openapi.json`（后端为实现方，不得另起第二份契约）。

## 0. AI 协作入口（动手前必读）

> 跨工具通用速查（分级速记 / 验证矩阵 / 红线 / 机器消费闭环）见本库 `docs/ai-collaboration-guide.md`。

本库与后端库 `backend-scaffold` 为**平级双库、非 monorepo**，两端共用同一套 AI 规范骨架：

| 文件 / 目录                                                | 作用                                                                          |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `AGENTS.md`                                                | **AI 编码入口**：L0–L4 分级、验证矩阵、API 契约红线、UI 红线、OpenSpec 工作流 |
| `docs/ai-collaboration-guide.md`                           | 跨工具通用 AI 协作速查指南（五级真源索引、分级速记、验证矩阵、机器消费闭环）  |
| `CLAUDE.md`                                                | Claude Code 侧的入口投影（优先级与红线速览）                                  |
| `docs/AGENTS.md`                                           | docs 层扩展约束                                                               |
| `.cursor/rules/*.mdc`                                      | Cursor / 各 AI 工具的核心约束镜像                                             |
| `.cursor/commands/opsx-*.md`                               | OpenSpec 六步命令（propose/apply/archive/explore/sync/update）                |
| `.cursor/skills/openspec-*/`                               | 同上流程的技能版（意图匹配自动触发）                                          |
| `openspec/`                                                | 唯一业务规格来源（changes / specs / archive）                                 |
| `docs/api/*.openapi.json`                                  | **API 契约单一真源**（自动生成 TS 类型）                                      |
| `docs/UI规范-{大屏端,后台管理端,移动端,门户与后台边界}.md` | 分端 UI 红线硬约束                                                            |
| `docs/architecture/`                                       | 架构共识（auth-token / micro-frontend）                                       |
| `docs/glossary.md`                                         | 状态 / 等级 / 设备状态着色枚举映射表                                          |
| `engineering/`                                             | 短期过程记录（qa / retro / 进度）                                             |
| `.superpowers/sdd/`                                        | SDD 规格驱动开发过程留痕（task brief / report + progress）                    |
| `templates/`                                               | 四件套 / QA / Retro / 契约编写模板                                            |

三条最容易踩的红线：

1. **API 契约真源在本库** `docs/api/*.openapi.json`——后端为**实现方**，不得另起第二份契约；改接口必须同交付走跨库四同步（OpenSpec → 前端契约 → 后端实现 → 前端重跑 `gen:api-types`）。
2. **零下行控制**——前端只监不控，`services` 不得定义硬控写接口；`guardHardControl` 统一在 http 拦截器拦截。
3. **UI 红线**——颜色/字号/间距一律 `var(--token)`；状态/等级着色只用 `docs/glossary.md` 映射表；z-index 只用五层（`--z-base/-marker/-chrome/-overlay/-toast`）。

改接口后重跑类型生成：`npm run gen:api-types`。

## 1. 工程约定

- 微前端结构：`apps/mgmt`（后台管理端）、`apps/mobile`（移动端）、`src/screen/`（一张图存量）、`subapps/`（wujie 子应用，IIFE 构建）；跨端公共服务位于 `src/`（`services` 与 `adapter` 分离）。
- 提交规范：`type(scope): 描述`，scope 固定枚举 `screen/mgmt/mobile/shared/docs/chore`（详见 `AGENTS.md` §9）。
- 三类目录职责不重叠：`docs/`=现在是什么（长期共识）、`openspec/`=将要怎么变（唯一业务规格）、`engineering/`=本次做得怎么样（短期过程）。

## 2. 快速开始

```bash
npm install                       # 安装依赖（husky 自动就绪）

npm run dev                      # 本地开发（Vite，默认关闭 mock 直连后端 8787）
npm run type-check               # vue-tsc 类型检查
npm run lint                     # eslint 全量
npm run test                     # vitest run 回归门禁

npm run gen:api-types            # 由 docs/api/*.openapi.json 生成 src/types/generated/<domain>.ts
npm run build                    # vue-tsc -b && vite build
npm run build:subapps            # 构建 wujie 子应用
```

> 本机 `vite build` 清空 `dist/` 会触发批量删除守卫而失败：验证编译是否通过用 `npx vite build --emptyOutDir=false`，或指到全新 `--outDir`。
> 后端联调运行手册见后端库 `backend-scaffold/docs/integration/README.md`；WS 推送包络 `{topic:'alarm.push', payload:AlarmItem}`。

## 3. 目录树

```
frontend-scaffold/
├── AGENTS.md                    # AI 编码入口（L0–L4 / 验证矩阵 / 红线 / OpenSpec）
├── CLAUDE.md                    # Claude 侧入口投影
├── docs/
│   ├── ai-collaboration-guide.md  # 跨工具 AI 协作速查
│   ├── api/*.openapi.json       # API 契约单一真源
│   ├── UI规范-*.md              # 分端 UI 红线
│   ├── architecture/            # auth-token / micro-frontend
│   └── glossary.md              # 状态/等级着色映射
├── openspec/                    # 唯一业务规格来源
├── engineering/                 # 短期过程记录（qa/retro/进度）
├── .superpowers/sdd/            # SDD 过程留痕
├── apps/{mgmt,mobile}/          # 后台管理端 / 移动端入口
├── src/
│   ├── services/                # http 拦截器、契约客户端（与 adapter 分离）
│   ├── composables/             # 跨端组合式函数
│   ├── styles/tokens.css        # UI token 单一真源
│   └── screen/                  # 一张图存量
├── subapps/                     # wujie 子应用（IIFE 构建）
├── scripts/                     # gen-api-types.mjs / build-subapps.mjs
└── vite.config.ts
```
