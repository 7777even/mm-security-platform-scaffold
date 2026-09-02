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
