import { ref, watch } from 'vue';

// 移动端无障碍模式：户外高对比皮肤 + 适老模式（开关式，开即最大字号）。
// 状态持久化到 platform/storage（H5 经 localStorage，App 经 uni 存储），并在根节点注入
// data-skin / data-elder（H5 平台生效；App 平台 P1 再做页面级样式注入）。

const OUTDOOR_KEY = 'mm-mb-outdoor';
const ELDER_KEY = 'mm-mb-elder';

import { getItem, setItem } from '@/platform/storage';

const outdoor = ref(false);
const elder = ref(false);

function apply(): void {
  try {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (outdoor.value) root.dataset.skin = 'outdoor';
      else delete root.dataset.skin;
      if (elder.value) root.dataset.elder = 'on';
      else delete root.dataset.elder;
    }
  } catch {
    /* 非 H5 平台忽略 */
  }
  setItem(OUTDOOR_KEY, outdoor.value ? '1' : '0');
  setItem(ELDER_KEY, elder.value ? '1' : '0');
}

watch(outdoor, apply, { flush: 'sync' });
watch(elder, apply, { flush: 'sync' });

export function initAccessibilityModes(): void {
  outdoor.value = getItem(OUTDOOR_KEY) === '1';
  elder.value = getItem(ELDER_KEY) === '1';
  apply();
}

export function useAccessibilityModes() {
  return { outdoor, elder, initAccessibilityModes };
}
