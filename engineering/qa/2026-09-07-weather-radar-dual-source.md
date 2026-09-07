# QA · 降雨雷达双源（国内免密 + RainViewer 可选）

日期：2026-09-07　变更：`openspec/changes/weather-radar-dual-source/`

## 范围

`/emergency/typhoon`（wujie 子应用 fm-typhoon → screen 弹窗）与主弹窗（panels/typhoon）的降雨雷达：
默认国内免密雷达（中央气象台 nmc.cn 中国雷达拼图 imageOverlay），RainViewer 降级为可选全球源（`VITE_RAINVIEWER_KEY`）。

## 根因

用户网络访问 RainViewer 瓦片（tilecache.rainviewer.com）被其边缘要求 API Key，
瓦片返回「API key required」报错图；源码本无 apikey 逻辑（全文无该字样）。
nmc.cn 免密雷达 URL 模式经实测 200 可用，故默认切国内源保证开箱即用。

## 验收口径与执行

| 项         | 命令                                      | 结果                       |
| ---------- | ----------------------------------------- | -------------------------- |
| 类型检查   | `npm run type-check`                      | 0 error                    |
| 子应用重建 | `npm run build:subapps`                   | fm-typhoon → dist 重建成功 |
| 运行时实证 | `node scripts/shoot-china-radar.mjs 5174` | 见下                       |

实证结果（playwright + wujie shadow DOM 穿透探针）：

- 雷达 overlay：`img.leaflet-image-layer` ×1，`naturalWidth>0`（已真实加载）。
- 实际 URL：`https://image.nmc.cn/product/2026/09/07/RDCP/medium/SEVP_AOC_RDCP_SLDAS3_ECREF_ACHN_L88_PI_20260907023000000.PNG`（免密、200）。
- 控制台错误：0。
- 源切换浮层：`国内雷达`（默认激活）/ `全球雷达`（未配 key 时 disabled + title 提示）。

截图：`engineering/qa/scm-china-radar.png`（过程照 `scm-china-radar-step1.png`）。

## 未运行项

- RainViewer 全球视图实际出图：本机网络免密可达、无法复现"要求 key"的环境；且未配置真实 key，仅验证了禁用态与 `?key=` 拼接逻辑（单测外代码走查）。
- 主弹窗（panels/typhoon，非子应用路径）运行时实证：与 screen 弹窗同构改动、type-check 通过，但该路径未被 fm-typhoon 引用，未单独截图。
- 主弹窗（panels/typhoon）未单独跑浏览器实证：该路径未被 fm-typhoon 子应用引用，改动与 screen 弹窗同构且 type-check 通过。

## 结论

通过：国内免密雷达开箱即用已实证；全球雷达为可选能力，待配置 `VITE_RAINVIEWER_KEY` 后人工复核一次。
