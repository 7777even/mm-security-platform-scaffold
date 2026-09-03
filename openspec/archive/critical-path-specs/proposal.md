# 关键路径补 spec（wujieBridge / subappRouter / http / tokens）

## Why

既有 48 例覆盖 http 拦截器与 composable。经核查，item 15 点名的 wujieBridge / subappRouter 实际**已有 spec 且已覆盖**对应能力；真实缺口为 http 的鉴权签名 / XSS / 硬控拦截，以及 tokens.css 的 z-index 五层单调递增契约。按 AGENTS §2 测试金字塔"关键路径增量"补齐真实缺口，且不动生产代码。

## What Changes

- `src/shell/wujieBridge.spec.ts`：经核查已存在（4 例，覆盖事件收发 / 注册注销 / route-navigate 负载）。**非新建**，保留既有测试并验证绿灯。
- `src/shell/subappRouter.spec.ts`：经核查已存在（11 例，覆盖子应用跳转 / 主壳兜底 / 失败回退）。**非新建**，保留既有测试并验证绿灯。
- `src/services/http.spec.ts`（扩展，node）：新增鉴权签名头（mock `requestSigner`）、XSS `strictSanitizeDeep` 净化、硬控 URL 命中 `HardControlViolation` 即拒；原 2 例保留，共 7 例。
- `src/styles/tokens.spec.ts`（扩展，node）：保留既有 fire-monitoring 视觉迁移断言，新增 z-index 五层单调递增（0<5<10<30<40）+ 变量存在性；共 8 例。

## Capabilities

### New Capabilities

- `http-critical-path-tests`：http 鉴权签名 / XSS 净化 / 硬控拦截测试（扩展既有 http.spec.ts）。
- `tokens-contract-tests`：tokens.css 变量存在性与 z-index 五层单调递增测试（扩展既有 tokens.spec.ts）。
- `wujie-bridge-tests` / `subapp-router-tests`：既已覆盖，仅做验证闭环（无需新建）。

## Impact

- 仅新增 / 扩展 spec 文件与文档，**未改动任何生产代码**（`http.ts` / `wujieBridge.ts` / `subappRouter.ts` / `tokens.css` 均原样保留）。
- 回归：4 个 spec 文件共 30 例全绿（wujieBridge 4 + subappRouter 11 + http 7 + tokens 8）；全量其余失败均为 `src/views/**` 的 jsdom / ECharts 既有环境性失败，与本次无关。
- 风险：低。
