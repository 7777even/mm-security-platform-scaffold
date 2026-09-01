import { ref } from 'vue';

/** 事故救援页：顶视平面模式（true）/ 三维模型模式（false） */
export const accidentRescueFlatViewActive = ref(false);

export function setAccidentRescueFlatViewActive(active: boolean) {
  accidentRescueFlatViewActive.value = active;
}
