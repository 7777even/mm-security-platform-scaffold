# Capability: Mobile Accessibility Modes（移动端无障碍模式）

移动端无障碍双模式：户外高对比 + 适老开关。由 Change `mobile-accessibility-modes`（已归档）回填。

## Requirements

### Requirement: 户外高对比模式

移动端须提供户外高对比模式：在「白底黑字」基础上叠加 2px 硬黑描边，保证强光下可读。

#### Scenario: 强光可读

- **WHEN** 开启户外高对比模式后在户外强光下查看
- **THEN** 文本与关键控件带 2px 硬黑描边，白底黑字

### Requirement: 适老开关式大字号

移动端适老为**开关式**——开启即最大字号（特大档 19-22-17），不提供三选一档位选择器。

#### Scenario: 开关即最大档

- **WHEN** 开启适老开关
- **THEN** 直接应用特大字号档，无档位选择器

### Requirement: 双模式持久化与启动注入

两种模式均经 localStorage 持久化，并在 `main.ts` 挂载前注入，避免刷新闪烁。

#### Scenario: 刷新恢复

- **WHEN** 任一模式开启后刷新页面
- **THEN** 模式在应用挂载前恢复，无可感知闪烁
