import { computed, ref } from 'vue';
import router from '../../../router';
import { fetchPatrolCameras, type PatrolCameraItem } from '@/services/security';
import { openPatrolCameraVideo } from './usePatrolCameraVideoDialog';
import { prepareAutoFillCameras } from '../../components/video-wall/videoWallStore';

// 巡更联动点位（A1 去 mock）：复用后端 /security/patrol-cameras，按 zone 过滤，
// 不再从 patrolLinkageMock 读取本地常量。其 zone 值与 security.patrolZones 的 label 完全对齐。
export interface PatrolLinkagePoint {
  id: number;
  name: string;
  location: string;
  status: '正常' | '离线' | '故障';
  camera: {
    id: number;
    name: string;
    zone: string;
    status: string;
    longitude: number;
    latitude: number;
  };
}

export const patrolLinkageOpen = ref(false);
export const activePatrolZoneLabel = ref('');

const patrolCameras = ref<PatrolCameraItem[]>([]);
const loading = ref(false);
let loaded = false;

async function ensureLoaded(): Promise<void> {
  if (loaded || loading.value) return;
  loading.value = true;
  try {
    patrolCameras.value = await fetchPatrolCameras();
    loaded = true;
  } finally {
    loading.value = false;
  }
}

export const patrolLinkagePoints = computed<PatrolLinkagePoint[]>(() =>
  patrolCameras.value
    .filter((c) => c.zone === activePatrolZoneLabel.value)
    .map((c) => ({
      id: c.id,
      name: c.name,
      location: c.zone,
      status: c.status as PatrolLinkagePoint['status'],
      camera: {
        id: c.id,
        name: c.name,
        zone: c.zone,
        status: c.status,
        longitude: c.longitude,
        latitude: c.latitude,
      },
    })),
);

export async function openPatrolLinkage(zoneLabel: string): Promise<void> {
  activePatrolZoneLabel.value = zoneLabel;
  patrolLinkageOpen.value = true;
  void ensureLoaded();
}

export function closePatrolLinkage(): void {
  patrolLinkageOpen.value = false;
  activePatrolZoneLabel.value = '';
}

/** 单个视频调阅：复用巡逻相机视频弹窗 */
export function selectPatrolPoint(point: PatrolLinkagePoint): void {
  openPatrolCameraVideo(point.camera);
}

/** 视频墙调阅：把当前联动点位相机填入视频墙网格后跳转 */
export function openPatrolLinkageVideoWall(): void {
  prepareAutoFillCameras(patrolLinkagePoints.value.map((point) => point.camera));
  void router.push({ name: 'tvVideoWall', query: { from: 'security' } });
}

export function usePatrolLinkage() {
  return {
    patrolLinkageOpen,
    activePatrolZoneLabel,
    patrolLinkagePoints,
    openPatrolLinkage,
    closePatrolLinkage,
    selectPatrolPoint,
    openPatrolLinkageVideoWall,
  };
}
