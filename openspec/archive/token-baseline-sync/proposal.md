# Change: 同步设计 token 至规范基准（移动端辅文 / 后台圆角）

## Why

`src/styles/tokens.css` 中两处取值偏离端规范文档基准，已在 `docs/UI规范-移动端.md` 与 `docs/UI规范-后台管理端.md` 标注为「待同步」：

- 移动端 `--text-muted-mobile` 现值 `#8aa0b3`，基准下限 `#3d5a73`（辅文不低于中灰蓝）；
- 后台 `--mgmt-radius-sm/md` 现值 `4/6px`，基准 `6/8px`（设计说明 §5.3.3.2）。

偏差属共享 token 真源未对齐。按 AGENTS.md 红线，禁止在组件内硬编码覆盖，必须在 `tokens.css` 单一真源修正。

## What Changes

- 移动端主题块：`--text-muted-mobile` 与同块 `--color-text-muted` 由 `#8aa0b3` 加深至 `#3d5a73`（保持单一真源同值）。
- 后台管理端主题块：`--mgmt-radius-sm: 4px` → `6px`、`--mgmt-radius-md: 6px` → `8px`。
- 不改任何组件、不新增/删除 token、不改其它取值。

## Capabilities

- design-tokens：维护 `src/styles/tokens.css` 单一真源，保证移动/后台端 token 与规范基准一致。

## Impact

- 仅涉及 `src/styles/tokens.css`（scope=shared）。
- 影响所有引用上述 token 的移动端/后台组件视觉（辅文字色加深、控件圆角略增），无破坏性契约变更。
- 不涉及写控接口、设备编码、权限、路由变更。

## 验证结论（2026-08-28）

- `npm run lint`：通过（exit 0），无新增告警。
- 改动为纯 CSS token 值变更，无 TS 影响、无 TDD 项；scope=shared，未触碰组件、服务或路由。
- 结论：本变更范围内（scope=shared 的 tokens.css）两处 token 已对齐规范基准，可归档。
