# Tasks: 降雨雷达双源

- [x] 新增 `src/services/weather/chinaRadarApi.ts`：`CHINA_RADAR_BOUNDS`、按 UTC 时间反算 nmc 雷达图 URL、回退逻辑辅助。
- [x] `src/services/weather/rainViewerApi.ts` 与 `src/screen/lib/weather/rainViewerApi.ts`：
      `buildRainViewerTileUrl` 增加可选 `key` 参数，非空追加 `?key=`。
- [x] `env.d.ts` 增加 `VITE_RAINVIEWER_KEY?`；`.env.development` 增加注释示例。
- [x] `src/composables/useSatelliteCloudMap.ts` 与 `src/screen/lib/composables/useSatelliteCloudMap.ts`：
      增加 `radarSource`、`rainViewerKey`、`chinaRadarUrl`、`setRadarSource`。
- [x] `src/components/panels/typhoon/SatelliteCloudMapDialog.vue`：默认国内雷达 imageOverlay + 源切换开关 + RainViewer key 提示。
- [x] `src/screen/components/panels/typhoon/SatelliteCloudMapDialog.vue`：同上（fm-typhoon 子应用实际渲染的弹窗）。
- [x] `src/components/typhoon/SatelliteCloudMapDialog.vue`：确认无任何引用（遗留副本），不改。
- [x] 验证：`npm run type-check` 0 error + `npm run build:subapps` 重建 fm-typhoon dist + Playwright 实证国内雷达 imageOverlay 出图（nmc URL 200、无控制台报错、全球雷达未配 key 时禁用）。
      截图 `engineering/qa/scm-china-radar.png`，脚本 `scripts/shoot-china-radar.mjs`。

## 二阶段（效果对齐中央气象台官网：官方配准 + 高分辨率 + 时间轴国产化）

- [x] 依据用户反馈三点（雷达对位偏差 / 卫星外源空白 / 放大发糊）取证：
      nmc 官网雷达页为 iviewer 看图无配准；台风网 gis.js `addRadarImg`/`addCloudImg` 提供官方 bounds；
      SWAN EZ9 3328×2560、FY4B ETCC 860×540 直连实测 200。
- [x] `chinaRadarApi.ts`：产品升级 SWAN EZ9 + 官方 bounds；`fengyunApi.ts`（新增）FY4B URL + 本地时间轴 `buildLocalTickTimes`。
- [x] 两个 composable：时间轴本地生成（15 分钟步长），JMA 时次表退役；RainViewer 降为可选静默补拉。
- [x] 两个弹窗：卫星分支换 FY4B imageOverlay（含回退 recoverSatellite），
      删除 JMA/GIBS 瓦片装配；雷达 z≥9 隐藏（官方同款）；预取改为国内源 Image 预热。
- [x] 验证：`npm run type-check` 0 error + `build:subapps` 重建 + Playwright 双模式实证
      （FY4B 与 SWAN 均加载成功、回退链路生效）。截图 `scm-fy4b-satellite.png` / `scm-swan-radar.png`。
