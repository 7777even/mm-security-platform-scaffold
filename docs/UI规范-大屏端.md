# UI 规范 — 大屏端（可视化指挥大屏）

> **本文档定位**：AI 助手 / 开发者在生成或评审**大屏可视化端**页面代码时的**权威执行规范**（CLAUDE.md 风格，规则必须逐条遵守）。
> **数值真源**：`src/styles/tokens.css` 中 `:root` 默认块（本文只引用 token 名，不复制 hex 进代码）。
> **设计依据**：视觉体系已迁移自 fire-monitoring 大屏项目（2026-08-31，见 `openspec/changes/screen-fire-monitoring-skin`）；历史依据《安全管控平台设计说明 V1.2》§5.3.1.1 / §5.3.2 / §5.3.3.1 / §5.3.4.1 / §5.3.5.1。
> **后台管理端规范**：见 `docs/UI规范-后台管理端.md`；**移动端规范**：见 `docs/UI规范-移动端.md`。

---

## 0. 快速接入（每次生代码前先做）

1. 大屏走 `:root` 默认主题：应用根节点**不挂** `data-theme` 属性（`mgmt` / `mobile` 是后台 / 移动端专用）。
2. 引入 `src/styles/tokens.css`，**禁止**在组件或页面里重定义任何 `--token`。
3. 所有颜色 / 字号 / 间距 / 圆角 / 尺寸一律 `var(--token)` 引用，**禁止硬编码**。
4. 需要状态 / 报警等级 / 风险区着色 → 只用 §7 映射表，**禁止自造色阶**。
5. 新增面板 / 页面先查 §5 页面模板与形态索引，找同形态既有页面作参照。
6. 完成后按 §8 自检清单逐条核对；任一「禁止」命中必须重写。

---

## 1. 通用硬性规则

1. **MUST** 深色科技风格：深藏蓝底 + 亮蓝渐变强调 + 半透明深蓝面板，**GIS 地图占据主视觉区**，界面元素通过半透明面板与柔和光效与地图融合。
2. **MUST** 三级信息层级「全局态势 — 专题分析 — 细节处置」组织内容，避免信息平铺造成认知负担。
3. **MUST** 安全优先：风险、报警、应急资源等关键信息在首屏获得**最高视觉权重**，复杂环境下可第一时间定位。
4. **MUST** 操作效率：地图工具、图层切换、报警处置等高频能力**常驻或半常驻**；关键操作入口始终可见，支持一键定位、一键调阅、一键处置。
5. **MUST** 动态与反馈：地图要素加载、报警提示、数据刷新用**柔和过渡动效**，避免突兀闪烁；按钮、卡片悬停 / 点击有明确状态变化；报警通过高亮动效、颜色变化、弹窗提示主动触达。
6. **MUST** 字号层级分明：数值突出、标题加粗、说明缩小（设计说明 §5.3.3.1）；大屏允许多档位，取值见 §3.1（档位为工程适配值）。
7. **MUST** z-index 只用五层 token：`--z-base(0) 地图底图 / --z-marker(5) 地图标注 / --z-chrome(10) 顶侧栏 / --z-overlay(30) 弹层 / --z-toast(40) 浮层`，禁止随手写 `z-index:999`。
8. **MUST NOT** 使用后台 / 移动的浅色风格：禁止白底白卡、浅灰页面底、浅色标签当主要状态语言。大屏是**深色态势端**。
9. **MUST NOT** 硬编码亮蓝等颜色；渐变 / 发光 / 半透明面板仅限大屏使用（后台 / 移动端反向禁止，本端反向**必须用**）。
10. **MUST NOT** 信息过密：面板间保持适度留白，避免信息拥挤。

---

## 2. 色彩 Token

### 2.1 语义色板（大屏取值）

| 用途                                  | Token                   | 值                                     |
| ------------------------------------- | ----------------------- | -------------------------------------- |
| 页面背景（深藏蓝）                    | `--color-bg`            | `#001630`                              |
| 卡片 / 面板                           | `--color-panel`         | `#00234b`（半透 `rgb(0 35 75 / 72%)`） |
| 面板浅层 / 选中浅底                   | `--color-panel-soft`    | `#002046`                              |
| 分割线 / 边框                         | `--color-border`        | `rgb(0 140 220 / 25%)`                 |
| 主强调（选中 / 链接 / 主操作 / 亮蓝） | `--color-accent`        | `#00b4ff`                              |
| 次强调（文字链 / 操作色）             | `--color-accent-2`      | `#00aaff`                              |
| 大号数值亮青                          | `--color-accent-bright` | `#00d4ff`                              |
| 成功 / 在线 / 已闭环 / 同比下降       | `--color-success`       | `#3dd68c`                              |
| 警示 / 待处置 / 已确认                | `--color-warning`       | `#f0b429`                              |
| 危险 / 火灾 / 待处理                  | `--color-danger`        | `#ff5a4a`                              |
| 标题文字                              | `--color-text-strong`   | `#ffffff`                              |
| 正文文字                              | `--color-text`          | `#d8e4f4`                              |
| 次要 / 辅助文字                       | `--color-text-muted`    | `#8795b0`（低饱和灰蓝）                |
| 点缀金（预警入口 / 特殊标识）         | `--accent-gold`         | `#eca641`                              |
| 点缀紫（特殊等级）                    | `--accent-purple`       | `#b07aff`                              |

色彩语言：强调色用**亮蓝 / 竖向蓝色渐变**，象征科技、冷静与安全；风险与报警用高饱和红 / 橙；状态正常用蓝色或绿色；文字以白色为主、辅助用低饱和灰蓝。

### 2.2 大屏专属（玻璃 / 渐变 / 光效）

| 用途                  | Token                   | 值                                                                   |
| --------------------- | ----------------------- | -------------------------------------------------------------------- |
| 玻璃面板底            | `--glass-bg`            | `rgb(0 35 75 / 72%)`（靠透明度，不用 backdrop-blur）                 |
| 玻璃面板边            | `--glass-border`        | `rgb(0 140 220 / 25%)`                                               |
| 背景模糊              | `--glass-blur`          | `0px`（占位，源项目未用 blur）                                       |
| 面板标题栏渐变        | `--panel-head-gradient` | `linear-gradient(90deg, rgba(0,80,160,.45), rgba(0,40,90,.2))`       |
| 主按钮 / 科技条渐变   | `--gradient-tech-blue`  | `linear-gradient(180deg, rgb(0 110 210 / 42%), rgb(0 55 130 / 58%))` |
| 危险按钮 / 风险条渐变 | `--gradient-risk`       | `linear-gradient(180deg, #ff5a4a, #d33232)`                          |
| 悬停描边发光          | `--border-glow`         | `rgb(0 180 255 / 45%)`                                               |
| 卡片内发光            | `--glow-inner`          | `inset 0 0 10px rgb(0 170 255 / 8%)`                                 |
| 面板标题发光          | `--panel-title-glow`    | `0 0 8px var(--color-accent-glow)`                                   |
| 头部大标题辉光        | `--header-title-glow`   | `0 0 20px rgb(80 170 255 / 55%)`                                     |
| 发光色                | `--color-accent-glow`   | `rgb(0 180 255 / 35%)`                                               |

### 2.3 易错色对照（AI 生成最常犯）

| 错误做法（生成时出现即重写）                           | 原因                              | 正确做法                                                             |
| ------------------------------------------------------ | --------------------------------- | -------------------------------------------------------------------- |
| 白底 `#ffffff` 卡片 / 浅灰底 `#eff5f9`、`#f4f7fa` 页面 | 后台 / 移动端的浅色办公语言       | 深藏蓝底 `var(--color-bg)` + 半透明面板 `var(--glass-bg)`            |
| 主色写 `#0b69d7`（后台）或 `#1677ff`（移动）           | 这是另外两端的品牌蓝              | `var(--color-accent)` `#00b4ff` 或 `var(--color-accent-2)` `#00aaff` |
| 状态用 `.tag-*` 浅底标签做主表达                       | 浅底标签是后台 / 移动端的状态语言 | 大屏直接用语义色（`var(--color-danger)` 等）或等级色阶               |
| 按钮实色蓝平涂                                         | 大屏主按钮是竖向蓝渐变            | `var(--gradient-tech-blue)`；危险用 `var(--gradient-risk)`           |
| 深藏蓝外另造深色（纯黑 `#000`、深灰 `#333`）           | 破坏深藏蓝统一基调                | 只用 `--color-bg / --color-panel / --color-panel-soft` 三档          |

---

## 3. 布局骨架（一图统览 · 三级视觉布局）

- **顶部全局导航** `--layout-header-h: 77px`：深蓝渐变底 + 底部亮线，承载系统大标题（38px + 蓝辉光 `--header-title-glow`）、时间、全局状态、用户状态与一级导航（20px，`--font-size-nav`）。**左上角品牌 Logo（盾形标 + 系统标题）点击返回主页**（已实现于 `src/components/layout/AppLayout.vue` 的 `.brand`，对齐中石化品牌规范）。
- **中央地图主视觉**：深蓝地理底图 + 业务要素分层叠加，通过透明度和描边区分基础图层与业务标注；支持园区概览 → 装置区 → 装置 → 设备 / 点位逐级下钻。
- **两侧专题面板**：右 `--layout-aside-w: 419px` / 窄侧 `--layout-aside-w-narrow: 338px`，半透明深蓝面板；**左侧放统计类高优先元素，右侧放操作类低优先交互元素**，遵循「主视觉居中、辅助信息对称分布」。
- **底部栏** `--layout-bottom-h: 67px`：底部消息栏以滚动方式播报系统消息、报警通知与处置提示（设计说明 §5.3.3.1.1）；事件处置阶段可按需承载时间轴 / 快捷工具。
- **四层信息架构**：全局控制层（顶部）→ 地图主视觉层（中央）→ 专题信息层（两侧卡片 / 列表 / 图表）→ 详情操作层（弹窗 / 抽屉 / 浮层，单点详情与处置操作）。
- **地图工具栏**：常驻或半常驻，宽度 `320–420px` 为工程适配值（基准仅约定功能：图层、区域、搜索、测距测面、三维视角、热力模式、视图复位等，见设计说明 §5.3.3.1.1）。
- **页面边距**：`--layout-page-pad: var(--space-md)`（16px）。

### 3.1 字号阶梯（大屏专属多档位，档位为工程适配值）

| 角色                          | Token                    | 值     |
| ----------------------------- | ------------------------ | ------ |
| 显示 / 系统大标题             | `--font-size-display`    | `38px` |
| 页面主标题                    | `--font-size-h1`         | `22px` |
| 区块 / 面板标题               | `--font-size-h2`         | `18px` |
| 顶部导航项                    | `--font-size-nav`        | `20px` |
| 关键数字（顶部时间 / 指标数） | `--font-size-keynum`     | `28px` |
| 数据指标（StatCard 值）       | `--stat-card-value-size` | `18px` |
| 正文                          | `--font-size-body`       | `14px` |
| 辅助说明                      | `--font-size-helper`     | `12px` |

### 3.2 间距 / 圆角

间距档 `--space-xs/sm/md/lg: 4/8/16/24px`；圆角 `--radius-sm/md/lg: 2/4/10px`（源项目：卡片 / 按钮 2px、下拉 4px、弹窗 10px）；图形风格以扁平化为基础，半透明深蓝面板 + 1px 蓝描边 + 内发光形成「科技玻璃」质感。

---

## 4. 核心组件规则

**PanelCard 半透明面板（专题面板标准容器）**

- 面板底 `var(--glass-bg)` + `border: 1px solid var(--glass-border)` + `border-radius: var(--panel-radius: 2px)` + 内发光 `var(--glow-inner)`；**不用** backdrop-blur。
- 标题栏 `background: var(--panel-head-gradient)` 渐变底 + `border-bottom: 1px solid var(--panel-head-line)` 分隔线；标题行高 `var(--panel-head-h: 43px)`；标题色 `var(--panel-title-color)`（白）+ `text-shadow: var(--panel-title-glow)`——**标题必须白色发光**。
- 面板内容围绕同一业务主题聚合（标题 + 统计卡 + 列表 + 趋势图）。

**StatCard 统计卡**

- 高 `var(--stat-card-h: 64px)`；数值 `var(--stat-value-size: 18px)` 加粗白色（`--stat-value-color` = `--color-text-strong`，源项目数值用白而非强调色）；标签 `var(--stat-label-size: 12px)`；卡底 `var(--stat-card-bg)` 竖向渐变 + 描边 `var(--stat-card-border)` + `var(--glow-inner)` 内发光。
- **禁止**卡内另叠一套大数字破坏字号档位。

**AlarmCard 告警卡**

- 左色条 `border-left: 3px solid var(--alarm-card-border-l{1..4})`（按报警等级色阶）；背景 `var(--alarm-card-bg)`（半透明深蓝底），hover 提亮为 `var(--alarm-card-bg-hover)` + `var(--border-glow)` 描边。
- **禁止**纯色块铺满整卡。

**AlarmListItem 报警列表项**

- 缩略图 `var(--alarm-list-thumb-w: 96px) × var(--alarm-list-thumb-h: 72px)`；状态点 `var(--alarm-list-status-{active/acked/dispatched/closed})` 对应 §7 映射；行高 `var(--list-row-h: 56px)`；分隔 `var(--alarm-list-divider)`。
- 数据列表开启**隔行变色（斑马纹）**，复用 `--row-alt-bg`（深蓝半透底），提升战时高压阅读下的视觉舒适度（对齐中石化品牌规范《石化智云 UI 规范》）。
- 状态色只用映射表，**禁止文字颜色自造**。

**按钮**

- 主按钮：`background: var(--btn-bg-primary)`（竖向蓝渐变）+ `color: var(--btn-color-primary)`，高 `var(--btn-h-md: 32px)`，圆角 `var(--btn-radius: 2px)`；危险按钮用 `var(--gradient-risk)`；默认态深蓝实底 `var(--btn-bg)` + 描边 `var(--btn-border)`。
- hover 描边提亮为 `var(--border-glow)`；主按钮 hover `filter: brightness(1.08)`；disabled `opacity:.5` + `cursor:not-allowed`。
- **禁止**后台 / 移动的实色平涂主按钮混入大屏。

**弹层 Drawer / Dialog**

- 深蓝渐变底（源自 `var(--color-panel)` 派生）+ `z-index: var(--z-overlay)`；遮罩 `rgb(0 10 24 / 72%)`；接警 / 登记类弹窗可用居中双列表单，标题栏与操作栏固定、内容滚动。
- **禁止**白底圆角办公弹窗（那是后台 / 移动的语言）。

**图表与地图**

- 图表统一深色主题，强调色只用 `--color-accent / --color-accent-2 / --color-accent-bright` 与语义色，坐标轴 / 分隔用低饱和灰蓝。
- 地图点位标注用 `--z-marker` 层；风险区填充只用 §7 `RISK_FILL`。

**字体与图标**

- 系统默认中文字体 **Microsoft YaHei（微软雅黑）优先**，Noto Sans SC / 思源黑体等无衬线字体兜底（token `--font-family-zh`，首位已对齐中石化品牌规范）；数据指标用几何感强的西文字体（`--font-family-num`），保证数字对齐（`tabular-nums`）与易读。
- 图标线性或面性结合的矢量风格，语义明确、轮廓简洁；地图控制 / 业务功能 / 状态指示图标视觉重量一致。

**多场景视觉适配**

- 常态值守场景：对称平衡布局，两侧面板完整可见，语义色用低饱和基础色调，风格平稳克制、适配远距离观看。

---

## 5. 页面模板与形态索引

| 页面形态             | 骨架                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| 主界面级（一图统览） | 顶部全局导航 + 中央地图 + 左统计面板 + 右操作面板（如消防监测首页）                            |
| 专题视图级           | 同主界面骨架，更换专题数据卡片 / 列表 / 地图要素（反恐安防、生产应急、工业电视、应急指挥专题） |
| 指挥一张图           | 「事件信息 — 响应流程 — GIS 态势 — 辅助信息 — 快捷工具」综合指挥布局，突出事件进展与现场态势   |
| 明细 / 详情          | 弹窗 / 抽屉承载单点详情：装置区域详情、重大危险源清单、预案详情（顶部页签 + 双列键值）         |
| 登记 / 选择弹窗      | 居中双列表单（统一接警登记）；双栏选择（事件信息—预案选择，左事件右候选列表）                  |
| 视频墙               | 多画面分屏布局（工业电视专题）                                                                 |

- 视图级专题保持统一布局骨架，仅通过不同数据卡片、列表与地图要素表达业务差异。
- 状态语义约定：红色 = 事件及高风险，绿色 = 已预警 / 已完成，蓝色 = 进行中 / 当前操作，灰色 = 已结束 / 未开始。

大屏端业务范围（对应设计说明第 7 章，共 62 项功能）：应急指挥及演练（事件总体看板 / 统一接警 / 指挥一张图 / 事故预警一键通知 / 融合通讯调度台 / 智能预案匹配 / 演练）、极端天气风险应急、消防报警（应急安消联动）、治安防恐、工业电视视频墙、设备运维监控，以及 GIS「一张图」底座与物联数据可视化。

---

## 6. 状态与等级映射（枚举，复制即用）

```ts
// 报警等级（大屏保留完整色阶，用于告警卡左色条 / 等级标识）
export type AlarmLevel = 1 | 2 | 3 | 4;
export const ALARM_LEVEL_COLOR: Record<AlarmLevel, string> = {
  1: 'var(--color-alarm-1)',
  2: 'var(--color-alarm-2)',
  3: 'var(--color-alarm-3)',
  4: 'var(--color-alarm-4)',
};

// 报警状态（大屏直接用语义色，不用浅底标签）
export type AlarmStatus = 'ACTIVE' | 'ACKED' | 'DISPATCHED' | 'CLOSED';
export const ALARM_STATUS_META: Record<AlarmStatus, { label: string; color: string }> = {
  ACTIVE: { label: '待处理', color: 'var(--color-danger)' },
  ACKED: { label: '已确认', color: 'var(--color-warning)' },
  DISPATCHED: { label: '已派单', color: 'var(--color-accent-2)' },
  CLOSED: { label: '已闭环', color: 'var(--color-success)' },
};

// 设备状态
export const DEVICE_STATUS_COLOR = {
  ONLINE: 'var(--color-success)',
  OFFLINE: 'var(--color-text-muted)',
  FAULT: 'var(--color-danger)',
} as const;

// 风险区地图填充（大屏专属）
export const RISK_FILL: Record<string, string> = {
  high: 'rgba(255,90,74,0.22)',
  warning: 'rgba(240,180,41,0.20)',
  notice: 'rgba(0,180,255,0.18)',
  normal: 'rgba(135,149,176,0.14)',
};
```

报警等级色阶（token：`--color-alarm-1..4`）：一级 `#ff5a4a` 红、二级 `#ff9a3c` 橙、三级 `#f0c429` 黄、四级 `#b07aff` 紫。

> 说明：本节枚举、色阶与填充值为工程实现约定（《详细设计 V1.5》《设计说明 V1.2》均未给出具体状态枚举文字与色值）；如与最终设计稿冲突，以设计稿为准。

---

## 7. 代码生成自检清单

- [ ] 根节点**未挂** `data-theme`（走 `:root`），未重定义 token，无硬编码色 / 字号 / 尺寸。
- [ ] 深藏蓝底 + 半透明面板 + 竖向蓝渐变；未出现白底卡片、浅灰页面底、后台蓝 `#0b69d7`、移动蓝 `#1677ff`。
- [ ] 主按钮是竖向渐变（`--btn-bg-primary`）而非实色平涂；状态用语义色 / 等级色阶而非 `.tag-*` 浅底标签。
- [ ] 布局权重正确：顶部 77 + 中央地图（主视觉）+ 两侧面板 419/338，左侧统计、右侧操作。
- [ ] 面板标题白色发光；AlarmCard 用等级色左边条而非纯色铺满；StatCard 数值用白色加粗。
- [ ] 状态 / 等级 / 风险区只用 §6 映射表，无自造色阶。
- [ ] 字号多档位且来自 §3.1 表；z-index 只用五层 token。
- [ ] 高频操作常驻 / 半常驻；动效柔和过渡，报警高亮主动触达。
- [ ] 弹层为深蓝底 + `--z-overlay`，不是白底办公弹窗。
- [ ] 左上角品牌 Logo 点击返回主页（AppLayout `.brand`）；数据列表开启隔行变色（复用 `--row-alt-bg`）。
- [ ] 默认中文字体 Microsoft YaHei 优先（`--font-family-zh` 首位，对齐中石化品牌规范）。
