export type {
  SatelliteCloudMapMode,
  SatelliteCloudTimeRange,
} from '../composables/useSatelliteCloudMap';

/** 基本反射率 dBZ 图例（RainViewer Universal Blue） */
export const satelliteCloudReflectivityLegend = [
  { dbz: 10, color: '#a8ecff' },
  { dbz: 15, color: '#5ad4ff' },
  { dbz: 20, color: '#00b4ff' },
  { dbz: 25, color: '#00e676' },
  { dbz: 30, color: '#b8ff3c' },
  { dbz: 35, color: '#ffe066' },
  { dbz: 40, color: '#ff9f43' },
  { dbz: 45, color: '#ff5c5c' },
  { dbz: 50, color: '#e843ff' },
  { dbz: 55, color: '#b030ff' },
  { dbz: 60, color: '#8b2be2' },
  { dbz: 65, color: '#6a1bb8' },
  { dbz: 70, color: '#4a0f8c' },
];
