# Proposal: 降雨雷达双源（国内免密 + RainViewer 可选）

## Why

用户网络访问 RainViewer 瓦片（`tilecache.rainviewer.com`）被其边缘节点要求携带 API Key，
未带 key 时返回「API key required」报错瓦片，导致降雨雷达长期空白。源码中不存在 apikey 校验逻辑，
问题根因是 RainViewer 对部分网络/出口 IP 的瓦片服务启用 key 策略。

## What

- 默认雷达源改为**中央气象台（nmc.cn）中国雷达拼图**：免密钥、国内可达、对华南/茂名更贴合。
  瓦片为整图（`image.nmc.cn/product/.../RDCP/medium/...PNG`），以 Leaflet `imageOverlay` 叠加，
  时间轴按 UTC 6 分钟级时间反算 URL，加载失败自动回退更早时次。
- 保留 **RainViewer** 作为可选「全球雷达」视图：新增 `VITE_RAINVIEWER_KEY`，配置后在瓦片 URL 追加 `?key=`，
  源切换开关在全球视图下无 key 时禁用并提示。
- 雷达源切换开关（国内雷达 / 全球雷达）置于雷达控制区。

## Capabilities

- `radar-china-source`：默认国内免密雷达，开箱即用。
- `radar-rainviewer-key`：可选全球雷达，配置 key 后可用。
- `radar-source-switch`：UI 切换国内/全球雷达。

## Impact

- 改动文件：`src/services/weather/rainViewerApi.ts`、`src/screen/lib/weather/rainViewerApi.ts`、
  `src/services/weather/chinaRadarApi.ts`（新增）、`src/composables/useSatelliteCloudMap.ts`、
  `src/screen/lib/composables/useSatelliteCloudMap.ts`、`src/components/panels/typhoon/SatelliteCloudMapDialog.vue`、
  `src/screen/components/panels/typhoon/SatelliteCloudMapDialog.vue`、`src/components/typhoon/SatelliteCloudMapDialog.vue`、
  `env.d.ts`、`.env.development`。
- 不涉及接口契约/权限语义变更，属 L3（业务能力：雷达数据源切换），已通过人工确认关卡（用户选定"两者都要"）。

## 人工确认关卡

用户已选定方案「两者都要：默认国内免密雷达 + RainViewer 可选（配置 key 后切换全球视图）」。✅
