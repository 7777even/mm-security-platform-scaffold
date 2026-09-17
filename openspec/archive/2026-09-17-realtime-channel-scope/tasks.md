# Tasks

## 1. WS 握手令牌注入

- [x] `src/services/ws.ts`：`RealtimeClientOptions` 新增 `getToken` / `refreshToken` 构造参数（非公开方法）；`_buildUrl()` 有令牌时追加 `?token=<encodeURIComponent(token)>`；`connect()` 用 `_buildUrl()` 建连
- [x] `src/services/realtime.ts`：`startRealtime` 注入 `getToken: () => getAccessToken()`；导出 `setRealtimeTokenRefresher(fn)` 与模块级 `tokenRefresher`
- [x] `src/stores/auth.ts`：注册 `refreshRealtimeToken`（调 `/auth/refresh` 写内存态），经 `setRealtimeTokenRefresher` 注入实时层

## 2. 鉴权失败刷新重连

- [x] `src/services/ws.ts`：`_onClosed()` 分流——从未连上且未尝试过刷新时调 `refreshToken()` 一次，成功立即重建、失败/异常退回指数退避；已连上掉线不刷新（防抖动锤击）；`openedEver` / `refreshTried` 状态管控

## 3. 契约与守门

- [x] 扩展 `docs/api/realtime.openapi.json`（`?token=` 握手鉴权说明，`info.version` 升 1.2.0，connection 与 401 描述更新）

## 4. 验证与归档

- [x] `ws.spec.ts` 补测：token 注入 URL（含已带查询参数用 `&`）、未登录不注入、刷新成功立即重建、刷新失败退回退避且仅一次、已连上掉线不刷新；红线断言仅 `connect`/`close` 仍成立
- [x] `realtime.spec.ts` 补测：`startRealtime` 将 access token 注入 `?token=`，不破坏既有用例
- [x] `vitest run` + `vue-tsc --noEmit` 全绿（330 / 330 测试通过，类型干净）
- [x] spec-delta 合入 `openspec/specs/realtime-channel/spec.md`；归档 `git mv` 到 `openspec/archive/2026-09-17-realtime-channel-scope`
- [x] `node scripts/check-openspec-hygiene.mjs` 通过
