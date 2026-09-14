# Spec Delta：后台管理端系统管理域接后端

## ADDED Requirements

### Requirement: 后台管理端共享主壳登录态

后台管理端（`apps/mgmt`，`data-theme="mgmt"` 独立入口）须复用主壳登录态而非独立登录：启动时经 `POST /auth/refresh`（同 origin 自动携带主壳种下的 `rt` HttpOnly Cookie）换取 access 令牌，再以 `GET /auth/me` 填充角色/权限快照；令牌仅存 JS 内存态，不落 localStorage。

#### Scenario: 已登录主壳后进入 mgmt

- **WHEN** 主壳已完成登录（`rt` Cookie 有效），用户打开 `/apps/mgmt/`
- **THEN** mgmt 静默续期成功、`loadMe()` 写入 `roles/perms`，直接进入工作台，全程无需二次输入口令。

#### Scenario: 未登录（无 rt Cookie）

- **WHEN** 无有效 `rt` Cookie 时打开 mgmt，或运行期收到 401
- **THEN** 清空身份快照并跳转主壳登录页 `/login?redirect=/apps/mgmt/...`，不种假令牌、不静默重登循环。

### Requirement: 系统管理域数据全部来自后端

后台管理端系统管理域页面（人员与账号、角色与权限、字典、审计日志、厂区配置）须消费后端真实接口，禁止以内联静态数据冒充台账；未接入后端的叶子页继续走数据驱动兜底页，不阻断。

#### Scenario: 人员与账号管理

- **WHEN** 打开 `/staff-mgmt`
- **THEN** 列表来自 `GET /system/users`（分页 + 关键字/状态/角色过滤）；新增/编辑/启停/重置口令/分配角色分别调用对应 `/system/users/*` 写端点；失败经统一反馈提示且不伪造成功。

#### Scenario: 角色与权限管理

- **WHEN** 打开 `/role-mgmt` 的「授权」
- **THEN** 授权树来自 `GET /system/menus`（含 `perm_code`），已授权集合来自 `GET /system/roles/{id}/menus`，保存经 `PUT /system/roles/{id}/menus`（整表覆盖）；内置角色不可删除。

#### Scenario: 字典管理

- **WHEN** 打开 `/dict-mgmt`
- **THEN** 左侧字典类型来自 `GET /system/dict-types`，右侧字典项来自 `GET /system/dict-items?dictCode=...`；两级均支持增改删并落后端。

#### Scenario: 厂区配置只读

- **WHEN** 打开 `/area-config`
- **THEN** 展示 `GET /system/zones` 的防区主数据；因后端防区为只读主数据，页面不提供增删改入口。

### Requirement: 操作审计留痕

后台管理端关键写操作（用户/角色/字典的新增、修改、删除、启停、授权、重置口令）须经 `reportAudit` 上行 `POST /audit/log` 落库 `fac_audit_log`（等保二级安全审计），为「双向+留痕」的留痕侧。

#### Scenario: 写操作留痕

- **WHEN** 在系统管理页完成任一次写操作
- **THEN** 产生一条 `{ action: 'system.*', module: 'sys' }` 审计事件并经缓冲异步落库；落库失败保留缓冲，不阻断业务。

### Requirement: 审计日志查询（只读端点）

系统须提供 `GET /audit/log`（登录可读）分页查询审计落库记录，支持按 `module` / `action` 过滤，按事件时间倒序返回 `{list,total,page,size}`，供后台管理端审计日志页消费。

#### Scenario: 审计日志页

- **WHEN** 打开 `/audit-log`
- **THEN** 列表来自 `GET /audit/log`（分页 + 模块/动作过滤），展示操作时间、动作、模块、详情；后端不可用时显式提示并空态，不回灌假数据。

### Requirement: 与大屏端实时联动（只读监视流）

后台管理端须订阅与大屏同源的 `/ws/alarm` 只读监视流，将增量告警以顶栏角标实时呈现；不得经本通路下发任何硬控指令（零下行控制红线）。

#### Scenario: 实时告警角标

- **WHEN** 后端推送 `{topic:'alarm.push', payload}` 帧
- **THEN** mgmt 顶栏告警角标计数递增；mgmt 发起的写操作经共享后端被大屏读取，与实时推送共同构成双向联动。

## MODIFIED Requirements

### Requirement: 后台端布局骨架（T 型）

顶栏「用户」区由硬编码占位升级为真实登录用户（`auth.realName || auth.username`）；告警铃铛由静态计数升级为 `/ws/alarm` 实时角标。布局尺寸（顶栏 56 / 侧栏 220 / 主区 24）与 token 纪律不变。

#### Scenario: 顶栏用户与告警

- **WHEN** 渲染后台顶栏
- **THEN** 右侧显示当前登录用户姓名与实时告警角标（无推送时不显示角标）。

## 关联 Spec

- 目标 spec 文件：`openspec/specs/mgmt-system-management/spec.md`（本变更新建该 capability）。
- 修改既有 spec：`openspec/specs/mgmt-scaffold/spec.md`（顶栏用户/告警行为升级）。
- 与 `proposal.md` 的 Capabilities、`tasks.md` 的验收标准三者一一对应、闭环。
