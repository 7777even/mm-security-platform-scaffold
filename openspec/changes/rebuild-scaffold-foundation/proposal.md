## Why

前一轮脚手架因沙箱 Overlay 未落盘，且未按 OpenSpec / Superpowers 规范组织。本次重搭旨在建立一套严格遵循 S1 规范、OpenSpec 规格驱动、Superpowers 完整仪式（含 TDD）的前端脚手架样本，作为后续各 demo 的可验证地基；mm-safety-master 保持参考不动。

## What Changes

- 在 `frontend-scaffold/openspec/` 下建立独立 OpenSpec 体系（config + 4 个能力 spec + change 提案/任务）。
- 重建工程基座：Vite5 + TS(strict 禁 any) + Element Plus + ECharts + Pinia + Router(懒加载) + Axios。
- 接入 ESLint(flat)/Prettier/Stylelint/Husky+lint-staged、CSP dev header、gzip 预压缩、设计 token。
- 实现 3 个核心能力：realtime-channel（WebSocket 可靠通道）、device-code（20 位 MDM 解析）、rbac-permission（动态菜单 + 按钮级权限）。
- 引入 Vitest，对上述三能力以 TDD 先红后绿实现。

## Capabilities

### New Capabilities
- `scaffold-foundation`：工程基座与技术/合规基线。
- `realtime-channel`：WebSocket 可靠实时通道。
- `device-code`：20 位 MDM 设备编码解析。
- `rbac-permission`：动态路由菜单 + 按钮级权限。

### Modified Capabilities
- 无。

## Impact

- `openspec/**`：新增规格与变更文档。
- `src/services/ws.ts`：RealtimeClient 实现。
- `src/constants/deviceCode.ts`：parseDeviceCode。
- `src/stores/auth.ts` + `src/composables/usePermission.ts`：权限上下文。
- `src/components/layout/AppLayout.vue`：动态菜单。
- `src/**/*.spec.ts`：Vitest 测试。
- `vite.config.ts` / `tsconfig*.json` / eslint+prettier+stylelint 配置：基座与门禁。
