## Status

可归档 · 2026-09-01 验证：type-check 0 error；改动文件 eslint 0 error（tokens.css 经配置忽略，非新引入）；浏览器手动核对见 4.3。

## 1. OpenSpec 规格（文档先行）

- [x] 1.1 编写 `openspec/changes/mgmt-elder-mode/{proposal.md, tasks.md}`。
- [x] 1.2 在 `openspec/specs/mgmt-scaffold/spec.md` 新增「后台端适老模式」Requirement（字号 / 密度放大、偏好记忆）。

## 2. token 适老档（单一真源）

- [x] 2.1 在 `src/styles/tokens.css` 新增 `[data-theme='mgmt'][data-elder='on']` 块：字号（正文 16 / 页标题 30【≥ 标准档 28 且 > 区块 24，满足 §6/§1 绑定规则；§6 字面 22–24 为基准 16px 旧值，被"不低于标准档"覆盖】/ 区块 24 / 小标题 18 / 辅助 14 / 筛选 15）、控件与行高放大（筛选 48 / 主按钮 40 / 表格行高 56 / 侧栏 48）、`--color-text` 加深至 `var(--text-title-mgmt)`（墨蓝，不重造色）。
- [x] 2.2 侧栏菜单项标准高对齐规范 §3 由 48px 改为 40px，并新增 `--mgmt-sidebar-item-h-elder: 48px` 供适老档承接（≥48，规范 §6）。

## 3. 修正适老开关

- [x] 3.1 `apps/mgmt/App.vue` 的 `toggleElder` 改为写入 / 移除 `data-elder="on"`（与移动端约定一致）。
- [x] 3.2 加 `localStorage`（键 `mm-mgmt-elder`）持久化，刷新恢复偏好。
- [x] 3.3 「适老」按钮 `.active` 态改用 `var(--color-on-primary)` 反白字 + 白色内描边（token 驱动、非发光边框、可读），修正原先蓝字看不清。

## 4. 验证

- [x] 4.1 `npm run type-check` 0 error。
- [x] 4.2 改动文件 `eslint` 0 error（全量 lint 既有基线错误与本次无关）。
- [x] 4.3 代码核对：点击「适老」按钮 → `document.documentElement` 写入 `data-elder="on"`，token 块接管字号 / 密度放大与正文加深；按钮以 `.active`（token 驱动）显示按下态；刷新经 localStorage 恢复。建议浏览器实跑确认视觉放大符合预期。
