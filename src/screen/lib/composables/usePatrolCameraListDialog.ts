import { ref } from 'vue';

export const patrolCameraListOpen = ref(false);
export const patrolCameraListTitle = ref('防控摄像头');

export function openPatrolCameraList(title = '防控摄像头') {
  patrolCameraListTitle.value = title;
  patrolCameraListOpen.value = true;
}

export function closePatrolCameraList() {
  patrolCameraListOpen.value = false;
}

export function usePatrolCameraListDialog() {
  return {
    patrolCameraListOpen,
    patrolCameraListTitle,
    openPatrolCameraList,
    closePatrolCameraList,
  };
}
