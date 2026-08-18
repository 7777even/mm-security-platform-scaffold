## 1. OpenSpec 骨架（文档先行）
- [ ] 1.1 编写 `openspec/config.yaml`（项目上下文 + 提案/任务规则）。
- [ ] 1.2 编写 4 个能力 spec（scaffold-foundation / realtime-channel / device-code / rbac-permission）。
- [ ] 1.3 编写 `changes/rebuild-scaffold-foundation/{proposal.md, tasks.md}`。

## 2. scaffold-foundation 基座
- [ ] 2.1 [TDD] 基座冒烟断言（构建脚本与配置存在性）。
- [ ] 2.2 建立 package.json / vite.config.ts(CSP+gzip) / tsconfig(strict) / eslint+prettier+stylelint / husky。
- [ ] 2.3 设计 token 与全局样式（#0F1E36 + 玻璃拟态）。
- [ ] 2.4 目录结构对齐 S1 §3.2（components/base/composables/views/router/store/services/utils/constants/styles/types）。

## 3. device-code 能力（TDD 先行）
- [ ] 3.1 [TDD] 编写 `deviceCode.spec.ts`：合法/非法长度/非数字/分段。
- [ ] 3.2 实现 `constants/deviceCode.ts` 的 parseDeviceCode，使测试转绿。

## 4. rbac-permission 能力（TDD 先行）
- [ ] 4.1 [TDD] 编写 `usePermission.spec.ts`：hasPerm 命中/未命中、动态菜单过滤。
- [ ] 4.2 实现 `stores/auth.ts`(Mock 角色) 与 `composables/usePermission.ts`。
- [ ] 4.3 在 `AppLayout.vue` 接入动态菜单（按 meta.perm 过滤）。

## 5. realtime-channel 能力（TDD 先行）
- [ ] 5.1 [TDD] 编写 `ws.spec.ts`：重连退避计时、心跳发送、消息解析。
- [ ] 5.2 实现 `services/ws.ts` 的 RealtimeClient。

## 6. 页面与装配
- [ ] 6.1 路由懒加载装配 dashboard/fire-alarm/industrial-video/system-users/error。
- [ ] 6.2 dashboard 接入 ECharts 示例 + 设计 token 卡片。
- [ ] 6.3 只监不控红线注释落位（services 无硬控写接口）。

## 7. 验证与落盘核对
- [ ] 7.1 非沙箱核对所有文件真实落盘（openspec + src）。
- [ ] 7.2 `npm install` → `npm run build`(含 gzip) → `npm run lint` → `npm run test` 全绿（dangerouslyDisableSandbox 跑，确保真实产物）。
