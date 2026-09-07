# Retro · 降雨雷达双源

日期：2026-09-07

## 做得好

- 先用「出现位置 + 可达性」两问把"缺apikey"从模糊描述收敛为可证伪事实（瓦片报错图 + JSON 可达），
  再用 curl 实测 RainViewer/nmc 接口，全程证据先行，没有凭组件局部推断。
- 实证链完整：nmc URL 模式 curl 验证 200 → playwright + shadow DOM 穿透探针确认 overlay 真实加载。

## 问题

- 排查走了弯路：nmc 旧接口 `rest/findRadarChart` 已 404，试了多轮猜测路径；最终在 chinaall.html 的
  `data-img` 属性里找到现行 URL 模式。
- 改完代码长时间"看不到效果"，浪费数轮：**wujie 子应用 dev 下跑的是 dist 预构建产物**，
  改 `src/screen/**` 必须 `npm run build:subapps` 才生效（对应验证矩阵 `subapps/**` 行）。

## 原因

- 对子应用构建产物的运行时形态没有先确认，直接按"dev 实时源码"假设走；探针空结果后才反推出 dist。

## 改进方案

- 凡涉及 `subapps/**`（含子应用经 `@/screen/**` 引用的共享代码），改动后先重建 `build:subapps` 再验证；
  验证探针要穿透 wujie shadow DOM（deepQueryAll），并先记录浏览器实际加载的模块 URL 以判断产物形态。
