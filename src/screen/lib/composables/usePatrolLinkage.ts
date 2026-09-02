import { computed, ref } from 'vue';
import router from '../../../router';
import { patrolLinkagePointsForZone, type PatrolLinkagePoint } from '../data/patrolLinkageMock';
import { openPatrolCameraVideo } from './usePatrolCameraVideoDialog';
import { prepareAutoFillCameras } from '../../components/video-wall/videoWallStore';

export const patrolLinkageOpen = ref(false);
export const activePatrolZoneLabel = ref('');

export const patrolLinkagePoints = computed(() =>
  activePatrolZoneLabel.value ? patrolLinkagePointsForZone(activePatrolZoneLabel.value) : [],
);

export function openPatrolLinkage(zoneLabel: string) {
  activePatrolZoneLabel.value = zoneLabel;
  patrolLinkageOpen.value = true;
}

export function closePatrolLinkage() {
  patrolLinkageOpen.value = false;
  activePatrolZoneLabel.value = '';
}

/** 单个视频调阅：复用巡逻相机视频弹窗 */
export function selectPatrolPoint(point: PatrolLinkagePoint) {
  openPatrolCameraVideo(point.camera);
}

/** 视频墙调阅：把当前联动点位相机填入视频墙网格后跳转 */
export function openPatrolLinkageVideoWall() {
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
