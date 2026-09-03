## Status

进行中 · 2026-09-03 启动

## 1. 提案与计划

- [x] 1.1 编写 `openspec/changes/agent-workflow-and-test-baseline/proposal.md`。
- [x] 1.2 编写 `openspec/changes/agent-workflow-and-test-baseline/tasks.md`。

## 2. AGENTS.md 重构（docs）

- [x] 2.1 重写 §1 分级工作流：L0–L4 决策树 + 一句话判定模板 + 流程权重（不豁免红线），前置现 §7.1 仲裁与 §7.2 分级。
- [x] 2.2 重写 §2 最小验证矩阵：保留现 §7.3 矩阵，新增"测试金字塔策略"子节（基线 = 关键 composable + bridge + http 拦截器 Vitest 集成测试；先红后绿；回归门禁 = `npm test`；不照搬 training 162+16 例，已有 48 例不重造）。
- [x] 2.3 新增 §3 API 契约规则：零下行控制、B3 包络 unwrap、20 位 MDM 设备编码、防重放 HMAC 签名、令牌内存态、services/adapter 分离（提炼自 config.yaml + http.ts + hardControlGuard）。
- [x] 2.4 新增 §4 工程记录闭环：现 §9.2 三类目录 + §7.4 单一任务源。
- [x] 2.5 新增 §5 完成标准（DoD）：verification-before-completion 清单（验收达成 / 回归全绿 / 文档同步 / 提交按 scope 拆分）。
- [x] 2.6 新增 §6 既有项目约束：压缩原 §1–§8 + §9 分层为子节；§6.3 绝对红线保留醒目，加"改动前先读对应端 UI 规范"指向。

## 3. 移动端 bridge 测试地基（mobile + test，TDD 先红后绿）

- [x] 3.1 [TDD] 先写 `apps/mobile/bridges/bridges.spec.ts` 期望测试（H5LocationBridge getPosition mock navigator.geolocation、startWatch/stopWatch 生命周期；H5OfflineBridge save/load 往返、pendingCount、clear；H5TokenSource getToken 读 sessionStorage、onTokenExpired 触发；index.ts 装配点返回正确实例）。
- [x] 3.2 运行 `npx vitest run apps/mobile` 先红：暴露 `h5.ts` geolocation 守卫缺陷（`'geolocation' in navigator` 在 jsdom 下为真但值为 undefined，导致裸 TypeError 而非优雅 reject）；仅在 bridges 内修正守卫为 `!navigator.geolocation`。
- [x] 3.3 确认 `npx vitest run apps/mobile/bridges/bridges.spec.ts` 转绿（12 passed），且整体 `npm test` 不回归。

## 4. 验证与归档

- [x] 4.1 `npm run type-check` 0 error（AGENTS 为文档，仅对新增 spec 校验）。
- [x] 4.2 `npx eslint apps/mobile/bridges/bridges.spec.ts` 0 error（含 h5.ts / index.ts）。
- [x] 4.3 按 scope 拆分提交：`docs:` AGENTS 重构 与 `test(mobile):` 新增移动端桥接层 Vitest 集成测试。
- [ ] 4.4 归档 openspec/changes → archive。
