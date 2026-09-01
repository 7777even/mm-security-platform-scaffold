import { ref } from 'vue';

/** 地图纯净模式为页面公共状态，工具栏与公共地图外壳共用。 */
const cleanMode = ref(false);

export function useMapCleanMode() {
  function toggleCleanMode() {
    cleanMode.value = !cleanMode.value;
  }

  return { cleanMode, toggleCleanMode };
}
