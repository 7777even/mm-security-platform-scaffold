# Tasks: mobile-tile-outdoor-unify

## 样式修正

- [x] 修改 `src/styles/tokens.css` 户外块 `.mb-tile--solid` 覆盖规则：改为 `background: var(--tile-bg); color: var(--tile-fg)`（白底黑图），与 soft 一致
- [x] 修正 tone 块末尾注释：由「实色瓦片反相为黑底白图」改为与 soft 收口一致的表述
- [x] 修正户外覆盖规则上方注释，说明户外不靠颜色区分层级（依据 `docs/UI规范-移动端.md` §6）

## 验证与归档

- [x] `stylelint src/styles/tokens.css` 通过（exit 0，无诊断）；IDE lint 0 诊断
- [x] 逻辑核验：户外下 quick-grid(solid) 与 其它(soft) 瓦片均为白底黑图、对比度 21:1 字形清晰
- [x] 常规态核验：solid 仍为实色底白字、soft 仍为浅底实色字，区分保留（未改 IconTile.vue）
- [x] 勾选 tasks.md 并归档至 `openspec/archive/`
