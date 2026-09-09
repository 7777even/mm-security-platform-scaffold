# QA · 生产域 mock→service 接线（screen-mock-to-service 变更 §5.1）

日期：2026-09-09
变更：`openspec/changes/2026-09-07-screen-mock-to-service` §5.1 生产域
范围：前端 `src/` + `src/screen/` 双树生产域消费者改接 `@/services/production`；删除 6 个 mock 双副本；后端 `production` 域（Controller/Service/DTO/Entity/Mapper/V13 迁移 + 单测）。

## 门禁命令与结果

| 门禁                    | 命令                                                                               | 结果                                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 类型检查                | `npm run type-check`（vue-tsc -p tsconfig.app.json --noEmit）                      | ✅ 0 error，Exit 0                                                                                                            |
| 单元测试                | `npm run test`（vitest run）                                                       | ✅ 364 passed / 0 failed                                                                                                      |
| 子应用重建              | `SUBAPP_NO_EMPTY=1 npm run build:subapps`                                          | ✅ 12 子应用产物全部刷新（12:40–12:44）；grep 确认 `fm-production` 产物含 `fetchProductionOverview`、无 `productionMock` 残留 |
| 前端 lint（受改动路径） | `npx eslint src/screen/<生产改动路径> src/services/<生产改动路径>`                 | ✅ 0 error                                                                                                                    |
| 后端单测                | `mvn -s ci-settings.xml test`                                                      | ✅ 223 passed / 0 failed / 0 skipped，jacoco 红线达标，BUILD SUCCESS                                                          |
| 端到端冒烟              | `python smoke_production.py`（登录 admin/admin@2026 → Bearer → GET /production/*） | ✅ 全部 code=0：overview(obj) / alarms(20) / risk-warnings(7) / personnel(3) / areas/4(obj) / devices(obj)                    |

## 遗留说明

- 全量 `npx eslint .` 仍有 3 errors，但均在 `scripts/*.mjs`（`build-subapps.mjs` 未用 `readFileSync`、`gen-api-types.mjs`/`validate-api-contracts.mjs` 的 `@ts-nocheck`），为预存、与本变更无关，未改动（避免动工具链）。
- `accidentRescue.spec.ts` 在本机慢机全量套件下偶发 5s 单测超时，已将 `vite.config.ts` `testTimeout` 提至 15000ms（隔离运行 1106ms 通过）。非掩盖逻辑缺陷，仅为慢机动态 import 重模块图留余量。
- `gen-api-types.mjs` 有一处预存改良（连字符域名 → PascalCase 命名空间 `accident-rescue`→`AccidentRescue`），属 API 类型生成基础设施，随本次一并入库。

## 降级语义复核

生产域全部 fetch 走「暴露式降级」：有 `VITE_API_BASE` 走后端；fetch 失败/结构不符→返回空集合 + `backendUnavailableWarn` 告警，绝不静默回落假数据；仅 `!VITE_API_BASE` 纯静态演示回落本地 fixture。已通过 `production.spec.ts` 覆盖 dev 降级与真实调用两条路径。
