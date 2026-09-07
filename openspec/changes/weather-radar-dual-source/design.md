# Design: 降雨雷达双源

## 决策

1. **默认源 = 中央气象台 nmc.cn 中国雷达拼图**（免密钥）。
   - URL 模式（已实测 200）：`https://image.nmc.cn/product/{YYYY}/{MM}/{DD}/RDCP/medium/SEVP_AOC_RDCP_SLDAS3_ECREF_ACHN_L88_PI_{UTC_TS}000.PNG`
   - 时间轴：文件名时间戳为 **UTC**，每 **6 分钟**一帧。由时间反算 `YYYYMMDDHHMMSS000` 构造 URL。
   - 渲染：`L.imageOverlay(url, CHINA_BOUNDS)`，叠加于 CARTO 矢量底图（降雨雷达模式）。
   - 地理范围：`CHINA_BOUNDS = [[10,70],[60,140]]`（等经纬度近似，首版够用，后续可按投影精修）。
   - 容错：`<img>` 加载失败事件 → 回退到更早 6 分钟帧，最多回退若干次。
   - 跨域：imageOverlay 仅用 `<img src>` 展示，不需 CORS（不做像素读取），故浏览器可直接显示。
2. **可选源 = RainViewer 全球雷达**（需 key）。
   - `buildRainViewerTileUrl` 增加可选 `key` 参数，非空时追加 `?key=`。
   - `VITE_RAINVIEWER_KEY` 为空时，全球雷达开关禁用并提示「需配置 VITE_RAINVIEWER_KEY」。
3. **源切换**：`radarSource: 'china' | 'rainviewer'`，默认 `'china'`。切换时重建雷达图层。

## 风险

- nmc 图片为等经纬度近似叠加，华南局部精度有限（后续可换投影精修）；首项以"开箱即用"为优先。
- RainViewer 仍可能在某些网络整体不可达；此时全球视图不可用，但国内源不受影响。

## 依赖

- 无新增生产依赖。
