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
