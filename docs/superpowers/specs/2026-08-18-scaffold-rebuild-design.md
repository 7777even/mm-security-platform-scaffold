# 设计文档：安全管控指挥系统前端脚手架重搭（2026-08-18）

> 本文件为 Superpowers 流程的设计文档（brainstorming 产出）。详细规格以 `frontend-scaffold/openspec/` 为准（OpenSpec 为规格驱动源）。

## 背景与目标

前一轮脚手架因沙箱 Overlay 未落盘，且未按 OpenSpec / Superpowers 规范组织。本次重搭目标：建立一套**严格遵循 S1 规范 + OpenSpec 规格驱动 + Superpowers 完整仪式（含 TDD）** 的前端脚手架样本，作为后续 demo 的可验证地基。mm-safety-master 保持参考不动。

## 关键决策（已与用户确认）

1. **OpenSpec 落点**：脚手架内独立一套 `frontend-scaffold/openspec/`，不复用/不并入 mm-safety-master。
2. **Superpowers 仪式强度**：完整仪式——openspec specs + change proposal/tasks + writing-plans 实现计划 + TDD(Vitest 测试先行) + 收尾 verification/code review。

## 范围

- 工程基座：Vue3 + Vite5 + TS(strict 禁 any) + Element Plus + ECharts + Pinia + Router(懒加载) + Axios + Vitest。
- 合规内建：CSP(dev header)、gzip 预压缩、设计 token `#0F1E36`+玻璃拟态、services/adapter 分离、20 位 MDM 编码、统一 logger、只监不控红线。
- 4 个能力 spec：scaffold-foundation / realtime-channel / device-code / rbac-permission。
- 页面：dashboard(含 ECharts) / fire-alarm / industrial-video / system-users / error(404)。

## OpenSpec 结构

```
frontend-scaffold/openspec/
  config.yaml
  specs/{scaffold-foundation,realtime-channel,device-code,rbac-permission}/spec.md
  changes/rebuild-scaffold-foundation/{proposal.md, tasks.md}
```

## 测试策略（TDD 先行）

- `device-code`：合法/非法长度/非数字/分段正确。
- `rbac-permission`：hasPerm 命中/未命中、动态菜单过滤。
- `realtime-channel`：重连退避计时、心跳发送、消息解析。
- 关键路径对齐验收红线（接警/指令/权限）。

## 实现顺序

1. openspec 骨架（文档）
2. scaffold-foundation 基座 + 测试
3. device-code + 测试
4. rbac-permission + 测试
5. realtime-channel + 测试
6. 页面装配 + 设计 token
7. 验证（type-check/build/lint/test 全绿）+ 非沙箱落盘核对

## 落盘与验证（防沙箱丢弃）

每批 Write 后用「非沙箱 Bash ls」核对真实磁盘存在；最终 install/build/lint/test 用 `dangerouslyDisableSandbox` 跑，确保产物真实存在。

## 非目标（YAGNI）

- 不在此阶段做 3D/Cesium、OpenLayers 天地图、flv.js（属 A 档后续 demo）。
- 不接入真实后端/IDP SSO（用 Mock 角色与占位鉴权头）。
- 不预先裁定微前端(S5) 与移动端(Q6)（待 M0 评审）。
