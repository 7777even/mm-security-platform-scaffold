# 系统事实基线（前端）· System Facts

> **用途**：描述「系统现在是什么样」，是人维护、随代码演进的当前事实基线。**不是** AI 指令（约束写法的是 `AGENTS.md`）。AI 改动前端代码前应读本文确认现状；改动导致下列事实变化时**必须回来同步本文件**。
>
> 分库说明：原根目录「长期共识文档」已废弃（根不是 git 仓库，文件不会进版本控制）。本文件与 `backend-scaffold/docs/system-facts.md` 为各自仓库提交的事实真源。AI 工作记忆（`.workbuddy/memory/MEMORY.md`）是本文件的镜像，以本文件为准。
>
> 跨端联调约定（端口 / 默认账号 / WS 包络 / 白名单）见 `backend-scaffold/docs/system-facts.md` §7、§6，本文不重复。

## 1. 微前端（Wujie）令牌桥

- 子应用**从不独立登录**：`ensureLogin()` 只在主壳 `src/main.ts` 调用一次。
- 各子应用 bundle 持有独立 `token.ts` 实例 → 在子应用上下文里恒为空。
- 修复：`src/services/token.ts` 的 `getAccessToken()` 在子应用上下文读 `globalThis.$wujie.props.getAccessToken`（只读桥）；`src/shell/WujieHost.vue` 的 `sharedProps` **必须含 `getAccessToken`**。缺它表现为「主壳 200 / 子应用 401」。

## 2. 子应用产物重建铁律

- dev 下 `vite.config.ts` 的 `serve-subapp-dist` 直接传 `subapps/*/dist/` 预打 IIFE，**不经 Vite 编译**。
- 改了 `src/` 后**必须重建子应用产物**，否则源码改了、产物没重建 → 同样表现为「主壳 200 / 子应用 401」。
- 铁律命令：`SUBAPP_NO_EMPTY=1 npm run build:subapps`（单个 `SUBAPP=fm-emergency`）。dev 启动会打印 `[subapp-stale]` 提示。
- 12 个 `subapps/*` 的 `src/` 为空是**刻意复用主应用代码**，勿判为未实现。

## 3. 大屏树 composable 范式（反复会踩）

`usePreliminaryEventList` / `useFireEmergencyEventList` 之类在文件末尾 `void loadXxx()` 拉真实服务的，必须满足两条：

1. **初始态预填本地 fixture**（`ref(cloneEventGroups(fixture))`），保证 import 期 `findXxxById` 有数据；
2. loader 对返回值**先 `Array.isArray` 守卫**——非数组（无后端 / mocked http 返 `undefined`）时 `console.warn` 并 return，**绝不覆盖**状态。
   （曾漏守卫导致 `splitGroupsByKind(undefined)` 抛错 → 状态清空 → `accidentRescue.spec.ts` 失败。）

## 4. 演示 / 几何常量（刻意本地，非后端缺口）

- 卫星云图时间轴本地生成（`buildLocalTickTimes`，15min：24h=96 / 6h=24 / current=8），默认源风云四号B / 中央气象台雷达。**切忌改回 JMA 帧驱动 / 10min 步长**（`useSatelliteCloudMap.spec.ts` 确定性失败）。
- `typhoonEmergency.ts` 的 mock **动态 import** 是「无 `VITE_API_BASE` 演示模式」合法兜底，勿删。
- 演练(drill)模式、`accidentRescueRouteWaypoints` 路线几何、值班人员 / 工具栏 / 辅助面板静态项，按设计就是本地常量，非后端缺口。
- RealtimeClient topic 分发已覆盖（ws.spec 15 + realtime.spec 4），勿重复补测。

## 5. 服务层与 type-check 约定

- `src/services/*.ts` 用手写 TS 接口 + `request()` + DEV 兜底常量（`!VITE_API_BASE` 时返回静态数据）+ 类型守卫，与 `src/types/generated/` 生成类型**分离**。
- `npm run gen:api-types` 已内置 `prettifyGenerated()`：生成链路末尾按仓库 prettier 配置自动回写（resolveConfig → format），**无需再手动 `npx prettier --write`**。验证重新生成后 `src/types/generated/` 工作区 diff 为 0。
- `vue-tsc` 报 `TS2503 Cannot find namespace 'vi'` → 改 `import { vi, type Mock } from 'vitest'`。
- Vue 模板 `img.src` 拒 `string|null` → 契约可空字段需 `?? ''` 兜底。
- `vite.config.ts` `testTimeout` 已提至 **15000ms**（本机慢机偶发 5s 超时非缺陷）。

## 6. 去 mock 决策判据（复用）

面板若「按 module 分流——一分支走 service、一分支走 mock 常量」，先查：

1. 后端端点是否已就绪；
2. mock 分支是否真有引用方（传该 module 的调用点）。
   两者满足即为死代码，可直接统一走 service 并删常量，**零行为回归**。

> 状态（2026-09-09 复核）：早年「12 缺口清单」已全部过时——清单里 12 个面板前端早已接好 service（带本地 fixture 兜底演示）。真正残留 mock 已清零：消防设施顶部汇总条改由 `monitorSummaries` 聚合派生；演练/几何/静态项为刻意本地常量。P4 渲染层去 mock 序列实际已完成；唯一剩的演示/几何常量若想接后端需新增端点（V+ 迁移 + 契约四同步），已非纯前端接线。

## 7. 门禁基线

- `vitest run` 约 **378 passed**；`vue-tsc -p tsconfig.app.json --noEmit` **0 错**。
- 单测 fake timers **禁用 `setTimeout(r,0)`** 冲刷 fetch，改 `await Promise.resolve()` 循环。

## 8. 里程碑速记

- 2026-09-08：两仓 CI/CD + 跨库契约守门；openspec 回填。
- 2026-09-09：生产应急域、video/tv/special-operation 三域全栈接线；大屏去 mock 收尾（V24 + 4 域端点）；服务层 DEV 兜底 + 全局错误兜底 + WS 实时化。
- 2026-09-10：续验 `vue-tsc` 全绿、4 端点冒烟 `code=0`；本系统事实基线分库落地。
