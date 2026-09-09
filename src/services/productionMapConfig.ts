// 生产地图的静态控件配置（前端几何，不来自后端）。
// 从原 productionMock 抽出，避免与已下线的硬编码 fixture 一起被删除。
// 地图覆盖层与控件详见 docs/api/production.openapi.json 说明（明确不在此契约内）。

export interface ProductionMapControl {
  key: string;
  label: string;
}

export const productionMapControls: readonly ProductionMapControl[] = [
  { key: 'layers', label: '图层' },
  { key: 'areas', label: '区域' },
  { key: 'search', label: '搜索' },
  { key: '3d', label: '三维视角' },
  { key: 'heatmap', label: '热力模式' },
  { key: 'labels', label: '标签默认' },
  { key: 'toggle', label: '地图控件切换' },
] as const;
