import { ref } from 'vue';
import { getSharedMap } from './sharedCesiumBridge';
import type { MapPoint } from '@/services/map';

export interface MonitoringPointDetailField {
  label: string;
  value: string;
}

// 模块级单例状态：安全监测点位「点击 → 飞入地图 + 详情弹窗」在侧栏面板与地图标记间共享。
const detailOpen = ref(false);
const detailTitle = ref('');
const detailFields = ref<MonitoringPointDetailField[]>([]);

function buildFields(p: MapPoint, kind: 'alarm' | 'device'): MonitoringPointDetailField[] {
  const statusText =
    kind === 'device'
      ? p.status === 'ONLINE'
        ? '在线'
        : p.status === 'FAULT'
          ? '故障'
          : (p.status ?? '--')
      : p.level === 3
        ? '三级报警'
        : p.level === 2
          ? '二级报警'
          : p.level === 1
            ? '一级报警'
            : '监测报警';
  const fields: MonitoringPointDetailField[] = [
    { label: '点位名称', value: p.name },
    {
      label: '类型',
      value: kind === 'device' ? '设备点位' : '报警点位',
    },
    { label: '状态', value: statusText },
  ];
  if (p.category) fields.push({ label: '分类', value: p.category });
  if (p.org) fields.push({ label: '单位', value: p.org });
  if (p.lastTime) fields.push({ label: '最近更新', value: p.lastTime });
  if (Number.isFinite(p.lng) && Number.isFinite(p.lat)) {
    fields.push({ label: '经纬度', value: `${p.lng.toFixed(4)}, ${p.lat.toFixed(4)}` });
  }
  return fields;
}

/** 飞入地图到该点位（沿用摄像头/防撞柱/门禁的 flyToWorldPositions 模式）。 */
export function flyToMonitoringPoint(p: MapPoint): void {
  if (!Number.isFinite(p.lng) || !Number.isFinite(p.lat)) return;
  const map = getSharedMap();
  if (!map?.flyToWorldPositions) return;
  void map.flyToWorldPositions({
    positions: [{ longitude: p.lng, latitude: p.lat, height: 72 }],
    duration: 0.85,
    pitchDeg: -48,
    rangeMultiplier: 2.1,
    panOnly: true,
  });
}

/** 飞入地图并弹出点位详情。kind 由调用方标注（'alarm' | 'device'）。 */
export function useMonitoringPointFocus() {
  function openDetail(p: MapPoint, kind: 'alarm' | 'device'): void {
    flyToMonitoringPoint(p);
    detailTitle.value = p.name;
    detailFields.value = buildFields(p, kind);
    detailOpen.value = true;
  }

  function closeDetail(): void {
    detailOpen.value = false;
  }

  return { detailOpen, detailTitle, detailFields, openDetail, flyToMonitoringPoint, closeDetail };
}
