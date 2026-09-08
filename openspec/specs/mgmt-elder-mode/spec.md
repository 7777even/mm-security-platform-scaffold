# Capability: Mgmt Elder Mode（后台端适老模式）

后台管理端顶栏「适老」开关的视觉承接与持久化。由 Change `mgmt-elder-mode`（已归档）回填。

## Requirements

### Requirement: 适老档 token 承接

mgmt 主题须提供 `[data-theme='mgmt'][data-elder='on']` 适老档 token：字号不低于标准档（正文 16 / 页标题 30 / 区块 24 / 小标题 18 / 辅助 14 / 筛选 15）、控件与行高放大（筛选 48 / 主按钮 40 / 表格行高 56 / 侧栏 ≥48）、正文对比加深（`--color-text` 加深至 `#1a3550`）；状态标签保持浅底深字描边（沿用全局类，不重定义）。

#### Scenario: 开关视觉响应

- **WHEN** 点击 mgmt 顶栏「适老」按钮
- **THEN** 根节点写入 `data-elder="on"`，字号、行高、触控热区与对比度按适老档生效

### Requirement: 适老偏好持久化

适老开关经 `localStorage`（键 `mm-mgmt-elder`）持久化，刷新后恢复；账号级记忆由后端承接（不在前端范围）。

#### Scenario: 刷新恢复

- **WHEN** 开启适老后刷新页面
- **THEN** 适老档自动恢复，无闪烁回退
