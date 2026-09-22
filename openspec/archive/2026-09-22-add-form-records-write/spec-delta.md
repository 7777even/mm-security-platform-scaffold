# Spec Delta: mgmt 流程填报向导真后端化

## ADDED Requirements

### Requirement: 流程填报向导服务驱动渲染

mgmt 端 `/form` SHALL 由服务驱动视图渲染（不再使用 `module-embed` 空壳），数据来源 SHALL 为 `GET/POST/PUT /api/v1/form-records`。

#### Scenario: 进入流程填报页

- **WHEN** 用户访问 `/form`
- **THEN** 页面标题为「流程填报」，展示填报记录列表，并提供「新建填报」多步向导入口

#### Scenario: 一线人员提交填报

- **WHEN** 任意登录用户填写向导并提交
- **THEN** 系统以 POST 落库（status=SUBMITTED），不要求 ADMIN 角色

#### Scenario: 管理员审核

- **WHEN** ADMIN 对未审核记录点击「审核通过」
- **THEN** 系统以 PUT 将 status 置为 REVIEWED

#### Scenario: 接口失败不落假数据

- **WHEN** 接口请求失败
- **THEN** 表格置空并提示错误，SHALL NOT 回退渲染任何演示数据

## 约束

- `formType` SHALL 为固定枚举（隐患排查 / 设备巡检 / 值班交接 / 其他）。
- 结构化内容 SHALL 以 `detailJson`（JSON 字符串）存储，按 formType 维度组织。
- 审核写回 SHALL 要求 ADMIN 角色（后端 `PUT` 硬控）。

## 关联 Spec

- 目标 spec 文件：`openspec/specs/form-records/spec.md`（新建 capability）。
