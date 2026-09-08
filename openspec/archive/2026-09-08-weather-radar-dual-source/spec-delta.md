# Spec Delta: 降雨雷达双源

## Added

- 能力 `radar-china-source`：默认国内免密（nmc.cn）雷达，开箱即用。
- 能力 `radar-rainviewer-key`：可选全球雷达，配置 `VITE_RAINVIEWER_KEY` 后启用。
- 能力 `radar-source-switch`：UI 国内/全球雷达切换。
- 能力 `satellite-cn-source`（二阶段）：卫星云图默认国内源 FY4B 真彩
  （`SEVP_NSMC_WXBL_FY4B_ETCC_ACHN_LNO_PY`，15 分钟帧，夜间无新帧时回退更早白天帧）；
  JMA/GIBS 外源退役为不再默认装配。
- 能力 `cn-local-timeline`（二阶段）：时间轴本地生成（15 分钟步长，24h/6h/current），
  零外源请求——外源不可达不再导致整窗空白。

## Modified

- `buildRainViewerTileUrl`：新增可选 `key` 参数（非空追加 `?key=`）。
- 二阶段：雷达产品升级为 SWAN EZ9 全国拼图（3328×2560，6 分钟帧），
  配准采用中央气象台台风网 gis.js 官方参数（south/west 11.1784/67.5，north/east 55.7766/140.625）；
  z≥9 隐藏雷达整图（对齐官方做法，避免糊块误导）。

## Removed

- 无（移除"仅 RainViewer 单一雷达源"与"卫星依赖 JMA/GIBS"的隐含前提）。
