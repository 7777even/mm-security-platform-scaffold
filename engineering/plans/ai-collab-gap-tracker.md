# AI 协作工程化差距 — 端到端进度 Tracker

> 追踪「前端脚手架 对标 safety-training-system 的 AI 协作工程化差距」逐项补齐的端到端进度。
> 与 `engineering/plans/end-to-end-development-progress-tracker.md`（五域功能成熟度）**职责不同**：本表追踪「工程化能力补齐」这一专项，不重复功能进度。
> 状态图例：**⬜ 未开始** / **🟡 进行中** / **✅ 已完成**。
> 单一真源优先级：`AGENTS.md` → `docs/api/*.openapi.json` ↔ `src/services/*`（互为镜像）；本表只读进度。

## 差距项清单与进度

| #   | 差距项                              | 状态 | 提交                 | 关键产物                                                                                                        | 证据               |
| --- | ----------------------------------- | ---- | -------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------ |
| 1   | 跨工具适配层（CLAUDE.md + .cursor） | ✅   | `6f0db59`            | `CLAUDE.md`、`.cursor/rules/*`、`.cursor/commands/opsx-*`、`.cursor/README.md`                                  | `git show 6f0db59` |
| 2   | 机器可读 API 契约                   | ✅   | `d8a5414`            | `docs/api/*.openapi.json`（alarm/auth 由桩升级 + dashboard/emergency/map/uplink/realtime 新增）+ `_shared.json` | `git show d8a5414` |
| 3   | 知识库纵深（架构/业务域）           | ✅   | `9512d97`            | `docs/architecture/{README,micro-frontend,auth-token}.md`、`docs/requirement/README.md`                         | `git show 9512d97` |
| 4   | 可执行 openspec 技能                | ✅   | `a281d72`            | `.cursor/skills/openspec-*{propose,apply,archive,explore,sync,update}`（6）                                     | `git show a281d72` |
| 5   | 机器消费闭环（契约→类型）           | ✅   | `12cbbb6`（未 push） | `scripts/gen-api-types.mjs`、`src/types/generated/*`、`docs/api/README.md` 四同步                               | `git show 12cbbb6` |
| 6   | AI 协作速查指南                     | ✅   | 本次                 | `docs/ai-collaboration-guide.md`                                                                                | 本提交             |
| 7   | 术语表                              | ✅   | 本次                 | `docs/glossary.md`                                                                                              | 本提交             |
| 8   | 端到端进度 Tracker                  | ✅   | 本次                 | `engineering/plans/ai-collab-gap-tracker.md`                                                                    | 本提交             |

## 完成度

- **8 / 8 项已落地**（初始 5 项 + 本次 3 项）。
- 补齐后，本仓库在 AI 协作工程化上已具备：跨工具一致约束（#1）、机器可读契约（#2）、上下文知识库（#3）、可执行变更流程（#4）、契约→代码消费闭环（#5）、协作速查（#6）、统一术语（#7）、进度可视化（#8）。

## Push 状态

| 提交                                    | 远端状态                                        |
| --------------------------------------- | ----------------------------------------------- |
| `6f0db59` `d8a5414` `9512d97` `a281d72` | 已 push                                         |
| `12cbbb6`                               | **未 push**（本地，受 `scaffold-bot` 重置风险） |
| 本次（#6/#7/#8）                        | **未 push**（本地）                             |

> 建议：将 `12cbbb6` 与本次提交一并 `push`，规避本地分支被自动化重置导致成果丢失。

## 维护方式

- 任一差距项状态变化，更新对应行与提交哈希；新增差距项追加行。
- 不在此另立任务清单（任务明细以对应 OpenSpec Change 的 `tasks.md` 为准，AGENTS §4）。
- 本表为短期过程记录，归 `engineering/` 职责，不写入 `docs/`（长期共识）。
