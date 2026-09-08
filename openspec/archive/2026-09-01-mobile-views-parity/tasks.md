# 任务清单：移动端补齐 15 个缺失页面并对齐 ui-redesign 样式

## 1. mobile.css 补齐共享类

- [x] 新增 `.mb-auth*` 登录外框（居中整屏 + 品牌胶囊 + 卡片限宽），背景按「移动端禁渐变」取纯色软底。
- [x] 新增 `.mb-legend*`（地图图例圆点，语义色 token）、`.mb-search*`（搜索框，热区 ≥48）。
- [x] 新增 `.mb-textarea` / `.mb-photo` / `.mb-steps*`（工单处置表单与流程节点）。
- [x] 新增 `.mb-upload` / `.mb-stepno`（操作票执行页附件与步骤序号）。
- [x] 新增 `.mb-select`（列表筛选下拉）、`.mb-page--bar`（固定操作条页面的底部留白）。

## 2. 账户与系统类页面

- [x] 新建 `login.vue`（账号 / 密码 / 双因素验证码，协议点名双因素）。
- [x] 新建 `settings.vue`（修改密码 / 消息推送 / 离线缓存 / 清除缓存 / 版本 / 退出登录）。
- [x] 新建 `contacts.vue`（搜索框 + 部门分组联系人 + 一键拨号）。
- [x] 新建 `duty.vue`（值班月历 7 列栅格 + 今日值班列表 + 拨号）。

## 3. 地图与路径

- [x] 新建 `map.vue`（报警态势地图：筛选 chips + MapPanel + 图例 + 统计）。
- [x] 新建 `path-nav.vue`（路径规划：MapPanel 轨迹 + 图例 + 路径信息 + 避让提示 + 导航）。

## 4. 应急事件

- [x] 新建 `events.vue`（事件列表，跳详情）。
- [x] 新建 `event-detail.vue`（详情 + 处置阶段时间轴 + 关联入口 + 一键确认接收）。
- [x] 新建 `event-resources.vue`（周边应急资源分组卡 + 一键拨打 + 调集资源）。

## 5. 任务 / 工单 / 操作票

- [x] 新建 `task-detail.vue`（任务字段 + 路径规划入口 + 确认接收 / 处置反馈）。
- [x] 新建 `orders.vue`（设备类型 / 状态筛选 + 工单卡片）。
- [x] 新建 `order-detail.vue`（流程节点 + 字段 + 处置结果录入 + 照片 + 完成 / 验收）。
- [x] 新建 `ticket-exec.vue`（操作票步骤清单 + 现场照片 + 固定底部主操作条）。

## 6. 现场执行

- [x] 新建 `patrol-exec.vue`（进度头 + 打卡 + 分组检查项「正常 / 异常 / 不适用」+ 固定底部提交条）。
- [x] 新建 `anomalies.vue`（参数异常 / 漏检任务 / 设备异常 分段页签 + 列表）。

## 7. 守门验证

- [x] `vue-tsc --noEmit` 类型检查通过（35 条路由全部可解析）。
- [x] `vite build` 移动端入口构建通过。
- [x] `eslint` / `stylelint` / `prettier` 对新增文件零报错。
- [x] `vitest` 全量用例不回归。
- [x] token 引用自检：新增文件无硬编码色值、无未定义 `var(--*)`。
