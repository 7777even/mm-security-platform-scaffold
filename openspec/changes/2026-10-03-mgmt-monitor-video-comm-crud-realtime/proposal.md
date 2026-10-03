# Proposal: 视频摄像头与通讯设备写端点契约四同步与 5 视图实时订阅

## 背景

监测 / 通信域的 5 个后台视图（视频监控管理、视频健康度、广播 / 电话 / 无线对讲设备管理）此前只接了只读 GET，且未订阅任何实时通道；后端在本批之前也无写端点，实时链路两端都缺。第 1 批随后端补 `video.camera` 与 `communication.device` 两个域的写能力与广播。

## 目标

- 契约真源 `docs/api/video.openapi.json` / `communication.openapi.json` 补写端点与写请求 schema，完成跨库四同步第 2 步。
- 5 个视图接入 `useDomainAutoRefresh`，订阅 `video.camera` / `communication.device`，变更到达即只读重拉。

## 非目标

- 本批不落写 UI（无新增 / 编辑 / 删除弹窗与 `v-permission` 按钮），仅闭合「订阅 → 重拉」半环；写 UI 与权限码留待后续批次。
- 不改动 `src/services/video.ts` / `communication.ts` 的读函数签名。
