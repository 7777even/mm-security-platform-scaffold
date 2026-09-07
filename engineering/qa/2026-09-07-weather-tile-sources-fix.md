# QA — 气象瓦片源装配修复（闪烁 / 卡死 / 雷达糊块）

- 日期: 2026-09-07
- 效率等级: L3（对应 `openspec/changes/fix-weather-tile-sources/`）
- 范围: 大屏端卫星云图弹窗 `src/components/panels/typhoon/SatelliteCloudMapDialog.vue`、组合式 `src/composables/useSatelliteCloudMap.ts`、服务 `src/services/weather/{gibsHimawariApi,weatherTileSources,rainViewerApi}.ts`

## 验收口径

- 单元层：`npx vitest run src/services/weather src/composables` 必绿（TDD 先红后绿）。
- 静态层：`npm run type-check` + `npx eslint` 0 error。
- 行为层（Playwright，dev server :5173）：弹窗打开后卫星/雷达瓦片真实加载（`.leaflet-tile-loaded` 计数上升）、播放使时间游标前进（不卡死）、无 `pageerror`。

## 实际执行命令与用例数

- `npx vitest run src/services/weather src/composables` → 3 文件 39 用例全绿（gibsHimawariApi 16、weatherTileSources 8、useSatelliteCloudMap 15）。
- `npm run type-check` → 0 error；`npx eslint` 两个改动文件 → 0 error。
- Playwright 冒烟：`node scripts/shoot-scm.mjs`（脚本已清理）。结果：
  - ERRORS: none
  - 卫星模式 `.leaflet-tile-loaded` 28 → 56（GIBS IR 真实加载）
  - 播放后游标 `09:20` → `09:50`、进度 100% → 2.08%，`PLAYBACK_ADVANCED=true`（不再卡死）
  - 降雨雷达模式 `.leaflet-tile-loaded` = 56（雷达瓦片真实加载）
- 网络层复核：`curl` 验证 RainViewer 瓦片 `…/v2/radar/<path>/512/5/25/13/2/1_1.png` 返回 200 image/png（原 `/2/1_1` 段有效），确认雷达 URL 格式正确，浏览器内 `ERR_ABORTED` 仅为双层缓冲换层时中断旧层在途请求，非 URL 错误。

## 结论

核心症状（一闪一闪、没有变化、雷达糊块）根因与修复对应关系：

1. 每帧淡入 → `fadeAnimation:false` + 常驻双层缓冲（front 显示 / back 预载下一帧），切帧不再露底图。
2. `weatherFrameLoading` 在并发切帧时永久为 true → 引入 `weatherSyncVersion`，所有早返分支均复位，播放不再卡在第一帧。
3. 雷达退化时整层消失 → `resolveRadarFrameForTick` 沿用上一命中帧，来源行分列标注并附「雷达仅覆盖最近约 2 小时」。
4. 卫星 z≥6 空白 → `resolveTileSource` 抬到 GIBS Level6（z=6→200），z≥7 显示封顶提示；GIBS 不可达时回落 JMA。

截图证据：`engineering/qa/scm-02-dialog.png`、`scm-play-a.png`、`scm-radar.png`（已生成）。
