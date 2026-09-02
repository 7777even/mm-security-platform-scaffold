import { computed, ref } from 'vue';
export type MapVideoSource = {
  id: number;
  name: string;
  zone: string;
  status: string;
  longitude: number;
  latitude: number;
};

export const patrolCameraVideoOpen = ref(false);
export const patrolCameraVideoCamera = ref<MapVideoSource | null>(null);

export const patrolCameraVideoTitle = computed(
  () => patrolCameraVideoCamera.value?.name ?? '视频播放',
);

export function openPatrolCameraVideo(camera: MapVideoSource) {
  patrolCameraVideoCamera.value = camera;
  patrolCameraVideoOpen.value = true;
}

export function closePatrolCameraVideo() {
  patrolCameraVideoOpen.value = false;
  patrolCameraVideoCamera.value = null;
}

export function usePatrolCameraVideoDialog() {
  return {
    patrolCameraVideoOpen,
    patrolCameraVideoCamera,
    patrolCameraVideoTitle,
    openPatrolCameraVideo,
    closePatrolCameraVideo,
  };
}
