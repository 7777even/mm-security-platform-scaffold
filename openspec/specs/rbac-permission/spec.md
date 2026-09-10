# Capability: RBAC Permission

## ADDED Requirements

### Requirement: 动态路由与菜单权限

系统须依据角色权限动态生成菜单与路由，未授权菜单项不渲染。

#### Scenario: 菜单过滤

- **WHEN** 当前角色缺少某菜单的 meta.perm
- **THEN** 该菜单项不在侧边栏出现，直接访问其路由亦被拦截。

### Requirement: 按钮级权限指令

系统须提供 usePermission 组合式 API，支持按钮级（hasPerm/hasAny）判断。

#### Scenario: 按钮显隐

- **WHEN** 组件调用 hasPerm('fire-alarm:ack')
- **THEN** 仅当角色具备该权限码时返回 true，可用于 v-if 联动。

### Requirement: 角色-终端-防区映射

权限模型须覆盖总指挥/值班调度/属地班长/内操/外操五类角色，按 RBAC+ABAC 三维约束驱动。

#### Scenario: 防区约束

- **WHEN** 属地班长(APP端)请求跨运行部防区数据
- **THEN** 前端动态路由/菜单/按钮按本运行部防区过滤，禁止越防区呈现。

### Requirement: 权限来源后端化

前端权限码须以 `GET /auth/me` 的 `perms` 为**唯一来源**，不得维护硬编码角色权限表（`ROLE_PERMS` 已退役）；角色集合由后端 `sys_role` 驱动的可配置列表提供。

#### Scenario: 权限变更生效

- **WHEN** 后端调整某角色授权后用户重新登录
- **THEN** 前端 `hasPerm` 结果与新授权一致，无残留硬编码权限

#### Scenario: 启动时序

- **WHEN** 应用启动装配路由
- **THEN** 在路由守卫判定 `meta.perm` 之前已完成 `/auth/me` 拉取，避免权限空集导致的受保护页面误跳 404

#### Scenario: 令牌失效

- **WHEN** 请求收到 401
- **THEN** 清空内存令牌与身份/权限快照，跳转登录页，不保留旧权限继续放行路由
