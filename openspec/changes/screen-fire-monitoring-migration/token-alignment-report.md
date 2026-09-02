# Task 2: variables.css 对 tokens.css 对齐报告

依据（D 节修正版）：UI 规范优先，规范未覆盖处才用源项目体系。tokens.css（`:root` 大屏默认块）为唯一权威值源；本任务只改 `src/screen/styles/variables.css`，未改 tokens.css。

## 一、改动表（变量 | 旧值 | 新值(token)）

| 变量             | 旧值                                                                  | 新值(token)                                                           | 对应 token                       | 依据                                                                                                               |
| ---------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `--border-glow`  | `rgba(0, 180, 255, 0.35)`                                             | `rgb(0 180 255 / 45%)`                                                | `--border-glow`（同名）          | 同名变量，值以 tokens.css 为准（0.45）                                                                             |
| `--text-muted`   | `#d8d8d8`                                                             | `#d8e4f4`                                                             | `--color-text`（正文角色）       | 见下「歧义裁决」1                                                                                                  |
| `--accent-red`   | `#d33232`                                                             | `#ff5a4a`                                                             | `--color-danger`（danger 角色）  | 任务规则：danger 角色以 UI 规范为准；#d33232 在 token 体系中仅作为 `--gradient-risk` 深端/`--map-danger-deep` 存续 |
| `--font-display` | `'Noto Sans SC', 'Microsoft YaHei', sans-serif`                       | `'Microsoft YaHei', 'Noto Sans SC', sans-serif`                       | 品牌红线「中文默认微软雅黑优先」 | brief Step 3 指定                                                                                                  |
| `--font-body`    | `'Noto Sans SC', 'Source Han Sans SC', 'Microsoft YaHei', sans-serif` | `'Microsoft YaHei', 'Source Han Sans SC', 'Noto Sans SC', sans-serif` | 品牌红线                         | brief Step 3 指定                                                                                                  |

## 二、语义相同且值已一致（无需改动，15 项）

| 变量                    | 值                                                                     | 对应 token                |
| ----------------------- | ---------------------------------------------------------------------- | ------------------------- |
| `--bg-primary`          | `#001630`                                                              | `--color-bg`              |
| `--bg-panel`            | `rgba(0, 35, 75, 0.72)`                                                | `--glass-bg`              |
| `--bg-panel-header`     | `linear-gradient(90deg, rgba(0,80,160,.45) 0%, rgba(0,40,90,.2) 100%)` | `--panel-head-gradient`   |
| `--border-panel`        | `rgba(0, 140, 220, 0.25)`                                              | `--color-border`          |
| `--text-primary`        | `#ffffff`                                                              | `--color-text-strong`     |
| `--text-secondary`      | `#8795b0`                                                              | `--color-text-muted`      |
| `--accent-blue`         | `#00b4ff`                                                              | `--color-accent`          |
| `--accent-cyan`         | `#6acab2`                                                              | `--accent-cyan`（同名）   |
| `--accent-gold`         | `#eca641`                                                              | `--accent-gold`（同名）   |
| `--accent-green`        | `#3dd68c`                                                              | `--color-success`         |
| `--accent-purple`       | `#b07aff`                                                              | `--accent-purple`（同名） |
| `--header-height`       | `77px`                                                                 | `--layout-header-h`       |
| `--footer-height`       | `67px`                                                                 | `--layout-bottom-h`       |
| `--sidebar-width`       | `419px`                                                                | `--layout-aside-w`        |
| `--sidebar-width-left`  | `338px`                                                                | `--layout-aside-w-narrow` |
| `--sidebar-width-right` | `419px`                                                                | `--layout-aside-w`        |

（上表 16 行中 `--sidebar-width`/`--sidebar-width-right` 同值映射同一 token，均无需改动。）

## 三、无 token 对应，原样保留（1 项）

| 变量                 | 值        | 说明                                                                                                 |
| -------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| `--accent-red-light` | `#ffc4c4` | tokens.css 中仅 `--map-popup-red-text`（地图弹窗专用色）同值，非语义角色 token，不构成对应关系，保留 |

## 四、歧义裁决记录

1. **`--text-muted`（#d8d8d8）**：命名上像 `--color-text-muted`（#8795b0），但该角色已由 `--text-secondary`（值恰为 #8795b0）承担；若映射到 `--color-text-muted` 会与 `--text-secondary` 变成同值异名冗余。从值阶看 `#d8d8d8` 是介于 `--text-primary`（#fff，= strong）与 `--text-secondary`（#8795b0，= muted）之间的正文档，对应 token 体系的 `--color-text`（#d8e4f4，正文亮灰蓝）。故裁决为对齐 `--color-text`。全库仅 `VideoWallSidebar.vue` 一处带 `#aaa` 兜底引用，视觉风险极小。
2. **`--accent-red`（#d33232）**：tokens.css 中存在同值的 `--map-danger-deep`（地图专用）与 `--gradient-risk` 深端，但均为非通用语义角色；任务规则明确把 danger 列入「UI 规范优先」角色，语义 red/danger 对应 `--color-danger`（#ff5a4a），故对齐。

## 五、统计

- variables.css 变量总数：22
- 改值对齐 token：3（`--border-glow`、`--text-muted`、`--accent-red`）
- 字体栈重排（品牌规则，非 token 值变更）：2（`--font-display`、`--font-body`）
- 值已一致无需改动：16
- 无 token 对应保留：1

## 六、Step 4 核验

`src/screen/style.css` 首行为 `@import './styles/variables.css';`，相对导入成立，未改动。

## 附：Task 4 Step 4 全量强换（语义色 + z-index 对齐 UI 规范映射表）

> 依据 `docs/UI规范-大屏端.md` §1.7 z-index 五层 / §2.1 语义色板 / §6 状态映射；由 `.tmp-migrate/force_semantic.py`（一次性）强换执行，人工按上下文核对语义族后放行。视觉验收在后续逐屏 smoke 任务进行。

### 一、语义色强换映射表（合计 **314** 处：danger 141 / warning 68 / success 105）

- CSS 处替换为 `var(--token)`（314 处中 295 处）；JS/canvas/echarts 与模板运行时色用 token 字面值（`#ff5a4a/#f0b429/#3dd68c`，19 处），视觉与规范一致，后续可再做 token 化。

| 源色      | 语义               | 规范 token/值               | 替换数 |
| --------- | ------------------ | --------------------------- | ------ |
| `#34d399` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 13     |
| `#f87171` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 9      |
| `#ff6b5a` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 8      |
| `#fbbf24` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 7      |
| `#fca5a5` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 6      |
| `#5ecfb8` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 5      |
| `#f33`    | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 5      |
| `#ff4d4f` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 5      |
| `#ff6b5e` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 5      |
| `#ff7a6a` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 5      |
| `#00ff66` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 4      |
| `#0f6`    | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 4      |
| `#10b981` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 4      |
| `#3ecf8e` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 4      |
| `#ff4e57` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 4      |
| `#ff514b` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 4      |
| `#ff5c5c` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 4      |
| `#ff6464` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 4      |
| `#ffb020` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 4      |
| `#6dd58c` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 3      |
| `#9fe8c2` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 3      |
| `#f43f5e` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 3      |
| `#ff8187` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 3      |
| `#ff8f8f` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 3      |
| `#ff9f43` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 3      |
| `#ffb55a` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 3      |
| `#ffbd42` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 3      |
| `#27df8c` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 2      |
| `#31ed9b` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 2      |
| `#35e795` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 2      |
| `#3bd28d` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 2      |
| `#3cec9c` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 2      |
| `#42e3a2` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 2      |
| `#4fd49a` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 2      |
| `#51e8bd` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 2      |
| `#5de4b7` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 2      |
| `#5ef0c2` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 2      |
| `#6affd2` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 2      |
| `#6fd08a` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 2      |
| `#7dffb0` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 2      |
| `#facc15` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 2      |
| `#ff4740` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 2      |
| `#ff514a` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 2      |
| `#ff525a` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 2      |
| `#ff525c` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 2      |
| `#ff665e` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 2      |
| `#ff6b6b` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 2      |
| `#ff7070` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 2      |
| `#ff7179` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 2      |
| `#ff777d` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 2      |
| `#ff9096` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 2      |
| `#ff9a8e` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 2      |
| `#ff9f2f` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 2      |
| `#ffaaa5` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 2      |
| `#ffb936` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 2      |
| `#ffba38` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 2      |
| `#ffbc4d` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 2      |
| `#ffc052` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 2      |
| `#ffc857` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 2      |
| `#ffc928` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 2      |
| `#ffc97a` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 2      |
| `#21d89b` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#29d383` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#35e394` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#3ad18c` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#42d69f` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#42d998` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#43d695` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#49d5a4` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#4bd4a6` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#4be4b4` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#4be5b5` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#50d99a` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#52e6b6` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#53e3b1` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#54d7ae` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#54e6b2` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#55d789` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#55d99c` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#56d9a3` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#58cf82` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#58d8ae` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#5ad8a6` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#5ccf98` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#5cd99f` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#5cdda4` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#62d99e` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#62d9b2` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#62dc87` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#62dda3` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#63ffba` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#64ffda` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#65f4b8` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#67e190` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#68cfa8` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#70df91` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#70e8a1` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#70efbd` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#78d394` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#8ee0a8` | 成功/在线/闭环绿   | `--color-success` `#3dd68c` | 1      |
| `#c43d3d` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#d86b14` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#e18d7c` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#e64149` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#e7424b` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#e9433c` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#e9b86d` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#f0b45a` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#fa0`    | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ff3b3b` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff3d4f` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff5059` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff515c` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff555d` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff564f` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff5650` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff575f` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff5b55` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff5b5b` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff5d5d` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff5d64` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff6068` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff6259` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff625a` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff6262` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff6269` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff626a` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff626b` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff666e` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff6670` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff6861` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff6a62` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff6b64` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff6d74` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff706a` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff7078` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff7373` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff746e` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff7772` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff7a80` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff7a81` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff7b82` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff858a` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff8a7a` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff8a90` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff8c00` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ff8d92` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff9297` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff9494` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff9b32` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ff9b9b` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ff9d8e` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ffb0b0` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ffb1b1` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ffb23b` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffb23f` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffb34f` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffb45c` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffb4a8` | 危险/火灾/待处理红 | `--color-danger` `#ff5a4a`  | 1      |
| `#ffb62e` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffba36` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffba58` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffbc3f` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffbd58` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffbd5c` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffbd67` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffbf47` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffbf49` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffc13d` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffc16f` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffc19d` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffc247` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffc25e` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffc35a` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffc457` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffc54d` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffc757` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffd04d` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |
| `#ffd16a` | 警示/待处置橙/琥珀 | `--color-warning` `#f0b429` | 1      |

### 二、z-index 五层归一表（合计 241 处 + 负值保留 1）

| 档位带                                              | 归一到                     | 替换数 |
| --------------------------------------------------- | -------------------------- | ------ |
| `0`（与 token 同值）                                | `var(--z-base)`            | 4      |
| `1–9` 内地图标注/点位（marker/pin/point 上下文）    | `var(--z-marker)`          | 33     |
| 与 `--z-marker` 同值字面量 `5`                      | `var(--z-marker)`（归一）  | 21     |
| `0<v≤10` 浮动条/面板内条/页签/表头（chrome 上下文） | `var(--z-chrome)`          | 99     |
| 与 `--z-chrome` 同值字面量 `10`                     | `var(--z-chrome)`（归一）  | 6      |
| 地图全幅 depth/route/layer 底（保持置于标注之下）   | `var(--z-base)`            | 14     |
| `10<v<1000`                                         | `var(--z-overlay)`         | 12     |
| 与 `--z-overlay` 同值字面量 `30`                    | `var(--z-overlay)`（归一） | 1      |
| `v≥1000`                                            | `var(--z-toast)`           | 50     |
| 与 `--z-toast` 同值字面量 `40`                      | `var(--z-toast)`（归一）   | 1      |
| 负值                                                | 保留                       | 1      |

> 说明：数值等于五层 token 值的存量字面量（33 处）本次一并归一为 `var()`，故实际“值不在 token 值集”的冲突归一 208 处，合计 z 处理 241 处。

### 三、保留清单（未强换）

- **未覆盖保留**：低饱和/中性/蓝紫青族/明度带外字面量约 1250 处（半透明同族保留 2886 处、低饱和 541、蓝紫青族 357、明度带外 352、渐变内部 18、HTML 实体误命中 16——非色值）；与既有 token 同值（已对齐）76 处。
- **待确认/装饰保留（26 个源色，36 处）**：`#dc3737 #ff8c23 #ffd237`（plantPalette 多序列）、`#ffb547 #62d58f #15d7a8`（厂区 zone 分类）、`#c6bc4e #b8ff5a`（lime 分类）、`#ffff00`（TV 巡检圆）、`#ffd54a #fff36a #fff2b4 #ffd64a`（地图聚焦/高光金）、`#fc0`（视频回放黄）、`#c8a878 #c8a060 #e8d4b0`（演练禁用 tan）、`#ffb24d #ffd36d #ffb84d #ffb84c`（天气/温度金）、`#3fe6d0 #45dec9 #36e6c7`（天气预报 teal 同族）、`#ffd18c #ffd08a #ffbd56`（说明性浅琥珀字）。语义难以归属或属装饰分类，保留原值待增量 token 化。
- **z-index 例外**：仅 1 处负值保留；无结构性改坏上报——地图标注/图层档带差异（如 `.alarm-marker` vs `.alarm-marker--active`、`FireSituationMarker` 4/6/7、`AccidentRescueMap` 内部 1–6）已按上下文归一到 marker/base/chrome 层，同一父级内部若需精确分层者列为 **待人工验收**（后续逐屏 smoke 复核）：`components/map/*`（CenterMap、AccidentRescueMap、FireEmergencyMap、PreliminaryMap、ProductionMap、SecurityMap、TvMap、MajorHazardMapOverlay、SandboxMapOverlay、MapPageShell、FireSituationMarker 等）、部分 `*Dialog` toast 位元素（原 2200 级 → overlay 30）。
