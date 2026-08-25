# 前端 UI 设计规格书（安全管控指挥系统）

## 1. 设计 Token（精确值）

> 表格中"大屏 / 后台 / 移动"三列分别对应 `:root` / `[data-theme='mgmt']` / `[data-theme='mobile']` 的取值。代码中**只引用 token 名**，不写具体值。

### 1.1 语义色板

| token                 | 大屏      | 后台      | 移动      | 用途                           |
| --------------------- | --------- | --------- | --------- | ------------------------------ |
| `--color-bg`          | `#0b1526` | `#eff5f9` | `#f4f7fa` | 页面背景                       |
| `--color-panel`       | `#13233c` | `#ffffff` | `#ffffff` | 卡片 / 面板                    |
| `--color-panel-soft`  | `#1a2f4e` | `#e8f3ff` | `#e8f2ff` | 面板浅层 / 选中浅底            |
| `--color-border`      | `#2a4a78` | `#ddebf0` | `#e6edf4` | 分割线 / 边框                  |
| `--color-accent`      | `#00d8ff` | `#0b69d7` | `#1677ff` | 主强调（选中 / 链接 / 主操作） |
| `--color-accent-2`    | `#2e7cf6` | `#0b69d7` | `#1677ff` | 次强调（按钮主色）             |
| `--color-success`     | `#2ee6a8` | `#22c55e` | `#22c55e` | 成功 / 在线 / 已闭环           |
| `--color-warning`     | `#ffb020` | `#fa8c16` | `#fa8c16` | 警示 / 待处置 / 已确认         |
| `--color-danger`      | `#ff5a5a` | `#f5222d` | `#f5222d` | 危险 / 火灾 / 待处理           |
| `--color-alarm-1`     | `#f46767` | `#f5222d` | `#f5222d` | 报警等级一                     |
| `--color-alarm-2`     | `#f6882e` | `#fa8c16` | `#fa8c16` | 报警等级二                     |
| `--color-alarm-3`     | `#f6ba2e` | `#fa8c16` | `#fa8c16` | 报警等级三                     |
| `--color-alarm-4`     | `#2e7cf6` | `#0b69d7` | `#1677ff` | 报警等级四                     |
| `--color-text-strong` | `#ffffff` | `#1a3550` | `#183b5b` | 标题文字                       |
| `--color-text`        | `#eaf4ff` | `#1a3550` | `#1e3a52` | 正文文字                       |
| `--color-text-muted`  | `#8fa6c8` | `#94a4b1` | `#8aa0b3` | 次要 / 辅助文字                |

> 后台 / 移动端报警等级简化为"浅底同色字标签"，色阶仍对应上表 `--color-alarm-*`；大屏保留完整色阶供告警卡左边框使用。

### 1.2 大屏专属（玻璃 / 渐变 / 光带）

| token                  | 值                                       | 用途              |
| ---------------------- | ---------------------------------------- | ----------------- |
| `--glass-bg`           | `rgb(19 35 60 / 62%)`                    | 玻璃面板底        |
| `--glass-border`       | `rgb(42 74 120 / 60%)`                   | 玻璃面板边        |
| `--glass-blur`         | `12px`                                   | 背景模糊          |
| `--gradient-tech-blue` | `linear-gradient(90deg,#00d8ff,#2e7cf6)` | 主按钮 / 科技条   |
| `--gradient-risk`      | `linear-gradient(90deg,#ff5a5a,#f6882e)` | 危险按钮 / 风险条 |
| `--panel-title-glow`   | `0 0 8px var(--color-accent-glow)`       | 面板标题发光      |
| `--color-accent-glow`  | `rgb(0 216 255 / 35%)`                   | 发光色            |

> 以上玻璃 / 发光 / 渐变**仅限大屏端**；后台 / 移动端禁止复用。

### 1.3 字号阶梯（同屏档位：大屏 ≥7 / 后台 ≤4 / 移动 ≤4）

| token           | 大屏                       | 后台                        | 移动                      | 角色              |
| --------------- | -------------------------- | --------------------------- | ------------------------- | ----------------- |
| 显示 / 大标题   | `--font-size-display:38px` | `--mgmt-fz-page-title:28px` | `--mb-fz-hero:28px`       | 系统大标题        |
| 页面主标题      | `--font-size-h1:22px`      | `--mgmt-fz-section:22px`    | `--mb-fz-page:20px`       | 页标题            |
| 区块标题        | `--font-size-h2:16px`      | —                           | `--mb-fz-section:17px`    | 区块 / 面板标题   |
| 关键数字        | `--font-size-keynum:28px`  | —                           | —                         | 顶部时间 / 指标数 |
| 数据指标        | `--font-size-metric:24px`  | —                           | —                         | StatCard 值       |
| 表头 / 侧栏一级 | —                          | `--mgmt-fz-header:16px`     | —                         | 表头              |
| 正文            | `--font-size-body:14px`    | `--mgmt-fz-body:14px`       | `--mb-fz-form-label:15px` | 正文 / 表单标签   |
| 辅助            | `--font-size-helper:12px`  | `--mgmt-fz-caption:12px`    | `--mb-fz-tip:12px`        | 说明 / 提示       |

### 1.4 间距 / 圆角 / 布局

| token                 | 大屏              | 后台                              | 移动                                           | 用途     |
| --------------------- | ----------------- | --------------------------------- | ---------------------------------------------- | -------- |
| `--space-xs/sm/md/lg` | `4/8/16/24px`     | 同左                              | 同左                                           | 间距档   |
| `--radius-sm/md/lg`   | `6/10/16px`       | `--mgmt-radius-sm/md/lg:4/6/10px` | `--mb-radius-card:16px` `--mb-radius-ctrl:8px` | 圆角     |
| `--layout-header-h`   | `64px`            | `--mgmt-header-h:56px`            | `--mb-header-h:48px`                           | 顶栏高   |
| `--layout-aside-w`    | `419px`           | `--mgmt-aside-w:220px`            | —                                              | 侧栏宽   |
| `--layout-bottom-h`   | `56px`            | —                                 | `--mb-bottom-bar-h:56px`                       | 底部栏高 |
| `--layout-page-pad`   | `var(--space-md)` | `--mgmt-content-pad:24px`         | `--mb-pad-x:16px`                              | 页面边距 |

### 1.5 Z-index 五层（禁止其他层级）

| token         | 值   | 层级                |
| ------------- | ---- | ------------------- |
| `--z-base`    | `0`  | L0 地图底图         |
| `--z-marker`  | `5`  | L1 地图标注         |
| `--z-chrome`  | `10` | L2 顶 / 侧 / 消息栏 |
| `--z-overlay` | `30` | L3 Drawer / Dialog  |
| `--z-toast`   | `40` | L4 Toast / 紧急浮层 |

### 1.6 控件阈值（标准 → 适老）

| 控件          | 大屏                | 后台                                    | 移动                         |
| ------------- | ------------------- | --------------------------------------- | ---------------------------- |
| 主按钮高      | `--btn-h-md:34px`   | `--mgmt-btn-h:32px`→适老`40px`          | `--mb-btn-h:44px`→适老`48px` |
| 筛选 / 输入高 | —                   | `--mgmt-ctrl-h:40px`→适老`48px`         | —                            |
| 表格行高      | `--list-row-h:56px` | `--mgmt-table-row-h:48px`→适老`56px`    | `--mb-row-h:48px`→适老`56px` |
| 侧栏项高      | —                   | `--mgmt-sidebar-item-h:40px`→适老`48px` | —                            |
| 地图工具栏宽  | `320–420px`         | —                                       | —                            |

### 1.7 户外高对比阈值（移动端，相对白底）

| 角色 | token                  | 推荐色    | 对比目标 |
| ---- | ---------------------- | --------- | -------- |
| 标题 | `--text-outdoor-title` | `#0b1f33` | `≥7:1`   |
| 正文 | `--text-outdoor-body`  | `#1e3a52` | `≥4.5:1` |
| 辅文 | `--text-outdoor-muted` | `#3d5a73` | `≥3:1`   |

### 1.8 状态标签类（后台 / 移动端浅底同色深字）

| 类             | 背景                              | 前景                              | 对应状态               |
| -------------- | --------------------------------- | --------------------------------- | ---------------------- |
| `.tag-success` | `var(--tag-success-bg)` `#ebf9ef` | `var(--tag-success-fg)` `#22c55e` | 成功 / 在线 / 已闭环   |
| `.tag-warning` | `var(--tag-warning-bg)` `#fff7ec` | `var(--tag-warning-fg)` `#fa8c16` | 警示 / 待处置 / 已确认 |
| `.tag-danger`  | `var(--tag-danger-bg)` `#fdecec`  | `var(--tag-danger-fg)` `#f5222d`  | 危险 / 故障 / 待处理   |
| `.tag-info`    | `var(--tag-info-bg)` `#e8f3ff`    | `var(--tag-info-fg)` `#0b69d7`    | 已派单 / 注意          |

---

## 2. 组件规格（生成契约）

> 每个组件给出：适用端、变体、引用 token、状态、MUST / MUST NOT。生成代码时按此实现。

### 2.1 Button 按钮

- **适用端**：全部
- **变体**：`primary`（实色主） / `secondary`（白底描边） / `ghost`（浅底，表内主操作） / `danger`（危险）
- **Token**：`background:var(--btn-bg-primary)`（大屏渐变）或 `var(--color-accent)`（后台 / 移动实色）；`color:var(--btn-color-primary)`；`height:var(--btn-h-md)`；`border-radius:var(--btn-radius)`（移动端 `--mb-radius-btn:999px` 胶囊）；`border:1px solid var(--btn-border)`
- **状态**：hover → 叠加 `var(--color-accent-soft)` 浅底；disabled → `opacity:.5` 且 `cursor:not-allowed`
- **MUST**：移动端主按钮为胶囊形 + 实色蓝白字；后台主按钮实色 `#0b69d7` 白字
- **MUST NOT**：后台 / 移动端使用玻璃质感或发光；自写 `#00d8ff` 等硬编码色

### 2.2 PanelCard 面板（大屏）

- **适用端**：大屏
- **Token**：`background:var(--glass-bg)`；`backdrop-filter:blur(var(--glass-blur))`；`border:1px solid var(--glass-border)`；`border-radius:var(--panel-radius)`；标题行高 `var(--panel-head-h)`；标题色 `var(--panel-title-color)` + `text-shadow:var(--panel-title-glow)`
- **MUST**：标题白色发光；面板玻璃质感
- **MUST NOT**：后台 / 移动端复用此玻璃样式

### 2.3 StatCard 统计卡（大屏）

- **适用端**：大屏
- **Token**：高 `var(--stat-card-h:96px)`；图标底 `var(--stat-card-icon-bg)`；值 `font-size:var(--stat-value-size:28px)` + `color:var(--stat-value-color)`（=accent）；标签 `var(--stat-label-size:12px)` + `var(--stat-label-color)`
- **MUST**：数值用主强调色，非白色
- **MUST NOT**：在卡片内再叠一套大数字破坏字号档位

### 2.4 AlarmCard 告警卡（大屏）

- **适用端**：大屏
- **Token**：左色条 `border-left:3px solid var(--alarm-card-border-l{1..4})`（按 §3.1 等级）；背景 `var(--alarm-card-bg)`（玻璃）
- **MUST**：用等级色阶左边框，玻璃底
- **MUST NOT**：纯色块铺满整卡

### 2.5 AlarmListItem 报警列表项（大屏）

- **适用端**：大屏
- **Token**：缩略图 `var(--alarm-list-thumb-w:96px)×(--alarm-list-thumb-h:72px)`；状态点 `var(--alarm-list-status-{active/acked/dispatched/closed})` 对应 §3.2；分隔 `var(--alarm-list-divider)`；行高 `var(--list-row-h:56px)`
- **MUST**：状态用映射表色，禁文字颜色自造

### 2.6 数据表格 / 筛选（后台）

- **筛选区**：控件高 `var(--mgmt-ctrl-h:40px)`；主查询 + 次重置成组；标准密度字号 `var(--mgmt-fz-filter:13px)`
- **表格**：表头浅主色底 `var(--color-accent-soft)` + 字 `var(--text-title-mgmt)`；行白底 `var(--card-mgmt)`；分隔 `var(--border-mgmt)`；行高 `var(--mgmt-table-row-h)`；状态列用 `.tag-*` 浅底标签
- **操作列**：主操作为 `.tag-info` 风浅底小按钮，弱操作为文字链接
- **MUST NOT**：状态列用纯色字或大屏发光标注；行高叠加破坏 ≤4 档字号

### 2.7 步骤条 / 表单（后台）

- **步骤条**：当前步实心主色、已到描边主色、未到灰；详情审核轨迹用垂直时间轴，节点卡浅底与节点色一致
- **表单**：左色条 + 分区标题；提示条浅橙底 `var(--warning-mgmt-soft)`；内嵌"编辑"主色 + "删除"危险红链接
- **MUST NOT**：步骤条用大屏发光

### 2.8 弹层 Drawer / Dialog

- **大屏**：`z-index:var(--z-overlay)`；玻璃底 `var(--map-tool-bg)`
- **后台 / 移动**：白底圆角；遮罩 `rgba(0,0,0,.45)`；可叠二级确认
- **MUST NOT**：后台 / 移动端照搬大屏发光抽屉边框；移动端用玻璃

### 2.9 移动端专用

- **底部标签栏**：4 入口（首页 / 任务 / 消息 / 我的）；选中 `var(--primary-mobile)` 图标 + 文字，未选中 `var(--text-muted-mobile)`；高 `var(--mb-bottom-bar-h)`
- **列表**：行高 `var(--mb-row-h)`；卡片间距 `var(--mb-card-gap)`；分隔弱依赖 `var(--border-mobile)`
- **表单**：标签 `var(--text-title-mobile)`；主按钮胶囊实色蓝白字 `height:var(--mb-btn-h)`；占位符不得替代必填说明
- **安全区**：顶 / 底 / 主操作条预留 `env(safe-area-inset-*)`，用 `var(--mb-bottom-safe)`
- **MUST NOT**：内页用沉浸头图；底栏选中态用次要灰；大面积铺主色

---

## 3. 状态与等级映射（枚举，复制即用）

```ts
// 报警等级（大屏色阶；后台/移动端简化为浅底标签）
export type AlarmLevel = 1 | 2 | 3 | 4;
export const ALARM_LEVEL_COLOR: Record<AlarmLevel, string> = {
  1: 'var(--color-alarm-1)',
  2: 'var(--color-alarm-2)',
  3: 'var(--color-alarm-3)',
  4: 'var(--color-alarm-4)',
};

// 报警状态
export type AlarmStatus = 'ACTIVE' | 'ACKED' | 'DISPATCHED' | 'CLOSED';
export const ALARM_STATUS_META: Record<
  AlarmStatus,
  { label: string; color: string; tagClass: string }
> = {
  ACTIVE: { label: '待处理', color: 'var(--color-danger)', tagClass: 'tag-danger' },
  ACKED: { label: '已确认', color: 'var(--color-warning)', tagClass: 'tag-warning' },
  DISPATCHED: { label: '已派单', color: 'var(--color-accent-2)', tagClass: 'tag-info' },
  CLOSED: { label: '已闭环', color: 'var(--color-success)', tagClass: 'tag-success' },
};

// 设备状态
export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'FAULT';
export const DEVICE_STATUS_COLOR: Record<DeviceStatus, string> = {
  ONLINE: 'var(--color-success)',
  OFFLINE: 'var(--color-text-muted)',
  FAULT: 'var(--color-danger)',
};

// 风险区地图填充（大屏）
export const RISK_FILL: Record<string, string> = {
  high: 'rgba(255,90,90,0.22)',
  warning: 'rgba(246,186,46,0.20)',
  notice: 'rgba(46,124,246,0.18)',
  normal: 'rgba(143,166,200,0.14)',
};
```

> 标签类样式（`.tag-success/-warning/-danger/-info`）背景 / 前景取自 §1.8；大屏直接用语义色。

---

## 4. 硬性约束（MUST / MUST NOT，生成时逐项校验）

1. **MUST** 所有颜色 / 字号 / 间距 / 圆角 / 层级通过 `var(--token)` 引用，禁止硬编码数值。
2. **MUST NOT** 在组件内自定义或重声明颜色变量；新增 / 调整 token 一律改 `tokens.css` 单一真源。
3. **MUST** 状态 / 等级色只用 §3 映射表，禁止自造色阶或文案。
4. **MUST** z-index 只用 §1.5 五层；禁止随手写 `z-index:999`。
5. **MUST NOT** 移动端使用玻璃面板、青色光带、发光抽屉边框。
6. **MUST NOT** 后台 / 移动端复用大屏深色态势配色（深蓝黑底、科技青、玻璃质感）。
7. **MUST** 同屏字号档位：大屏 ≥7 / 后台 ≤4 / 移动 ≤4，不得叠加更多。
8. **MUST** 适老开关 / 户外高对比**全局生效**（首页 / 列表 / 表单 / 弹层 / 底栏同步），仅放大字号 / 控件 / 间距，不改业务流程。
9. **MUST** 移动端户外关键可读性：标题 ≥18、正文 ≥15（达不到则加深一级）。
10. **MUST** 三端根节点按 `[data-theme]` 切换主题；组件不写端特异硬编码分支（用 token 自然区分）。

---

## 5. 代码生成流程

1. 确定目标端 → 在应用根节点挂载 `data-theme="mgmt" | "mobile"`（大屏默认无属性，走 `:root`）。
2. 引入 `src/styles/tokens.css`，不重复定义 token。
3. 选择组件 → 查 §2 取得变体、引用 token、状态、MUST / MUST NOT。
4. 需要状态 / 等级着色 → 查 §3 取枚举或 `.tag-*` 类，禁止自造。
5. 取色取尺寸 → 一律 `var(--token)`，不从 §1 表中拷贝具体 hex 进 style。
6. 完成后逐条核对 §4 约束；任一 MUST NOT 命中则重写。
7. 版式 / 布局细节（具体页面结构、原型截图）→ 回查《设计说明 V1.2》§5.3.5 原型图与第 7 章。
