# Capability: Device Code

## ADDED Requirements

### Requirement: 20 位 MDM 编码校验
系统须校验中石化统一集采 20 位 MDM 主数据设备编码，拒绝非法长度或非数字输入。

#### Scenario: 合法编码
- **WHEN** 输入 20 位纯数字编码
- **THEN** parseDeviceCode 返回 isValid=true 且 raw 原样保留。

#### Scenario: 非法编码
- **WHEN** 输入长度非 20 或含非数字字符
- **THEN** 返回 isValid=false，不抛异常。

### Requirement: 编码分段解析
合法编码须可分段提取（类别/区域/序列），分段语义以 MDM 规范为准（adapter 补全）。

#### Scenario: 分段提取
- **WHEN** 解析合法编码
- **THEN** 返回 category/region/sequence 分段，且三段拼接等于原编码。
