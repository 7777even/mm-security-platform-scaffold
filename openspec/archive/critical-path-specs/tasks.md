# 任务清单 — 关键路径补 spec（测试 15）

> 不动生产代码。TDD：先核查既有覆盖，真实缺口补测试，验证绿灯。
> 验证：4 个 spec 文件共 30 例全绿（wujieBridge 4 + subappRouter 11 + http 7 + tokens 8）。

## B1 / B2 wujieBridge / subappRouter（核查既有覆盖，非新建）

- [x] 核查 HEAD：`src/shell/wujieBridge.spec.ts`(4 例) / `src/shell/subappRouter.spec.ts`(11 例) 已覆盖 item 15 对应能力。
- [x] 保留既有测试，**未用覆盖版新建**（避免误删既有测试）。运行验证绿灯。

## B3 http 关键路径（扩展 src/services/http.spec.ts，node）

- [x] 扩展 http.spec.ts：新增签名头 / XSS 净化 / 硬控拦截三组（原 2 例保留，共 7 例）。
- [x] 运行 `npx vitest run src/services/http.spec.ts` → 7 例全绿。

## B4 tokens.css 契约（扩展 src/styles/tokens.spec.ts，node）

- [x] 扩展 tokens.spec.ts：保留 fire-monitoring 迁移断言，新增 z-index 五层单调递增 + 变量存在性（共 8 例）。
- [x] 运行 `npx vitest run src/styles/tokens.spec.ts` → 8 例全绿。

## 收尾（回归）

- [x] 4 文件共 30 例全绿（无测试丢失）。
- [ ] （待确认）归档 openspec/changes/critical-path-specs → archive/。
