# Tasks: 同步设计 token 至规范基准（token-baseline-sync）

**关联的提案**：[proposal.md](./proposal.md) ｜ **能力**：`design-tokens`（维护）

## 1. 移动端辅文字色同步

- [x] 1.1 在 `src/styles/tokens.css` 移动端主题块，将 `--color-text-muted` 与 `--text-muted-mobile` 由 `#8aa0b3` 加深至 `#3d5a73`（单一真源同值，对齐 `docs/UI规范-移动端.md` 第 48 行基准下限）。

## 2. 后台控件圆角同步

- [x] 2.1 在 `src/styles/tokens.css` 后台主题块，将 `--mgmt-radius-sm` 由 `4px` 改为 `6px`、`--mgmt-radius-md` 由 `6px` 改为 `8px`（对齐 `docs/UI规范-后台管理端.md` 第 111 行基准 6–8px）。

## 3. 校验与收尾

- [x] 3.1 运行 `npm run lint` 验证（纯 token 值变更，无 TDD 项，scope=shared），exit 0，无新增告警。
- [ ] 3.2 验证通过后将本 change 归档至 `openspec/archive/token-baseline-sync/`，并以 `fix(shared):` 提交。
