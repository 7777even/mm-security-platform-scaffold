import { ref, watch } from 'vue';

export type ElderTier = 'standard' | 'large' | 'xlarge';

const OUTDOOR_KEY = 'mm-mb-outdoor';
const ELDER_KEY = 'mm-mb-elder';

// 模块级单例：跨移动端页面共享同一份无障碍状态
const outdoor = ref(false);
const elderTier = ref<ElderTier>('standard');

/** 将状态同步到根节点（data-skin / data-elder）并持久化到 localStorage */
function apply(): void {
  const root = document.documentElement;
  if (outdoor.value) {
    root.dataset.skin = 'outdoor';
    localStorage.setItem(OUTDOOR_KEY, '1');
  } else {
    delete root.dataset.skin;
    localStorage.setItem(OUTDOOR_KEY, '0');
  }
  if (elderTier.value !== 'standard') {
    root.dataset.elder = elderTier.value;
    localStorage.setItem(ELDER_KEY, elderTier.value);
  } else {
    delete root.dataset.elder;
    localStorage.setItem(ELDER_KEY, 'standard');
  }
}

watch(outdoor, apply, { flush: 'sync' });
watch(elderTier, apply, { flush: 'sync' });

/**
 * 启动注入：在 main.ts 挂载前调用，从 localStorage 还原状态并写入根节点，
 * 避免首屏闪烁（FOUC）。
 */
export function initAccessibilityModes(): void {
  const o = localStorage.getItem(OUTDOOR_KEY);
  outdoor.value = o === '1';
  const e = localStorage.getItem(ELDER_KEY) as ElderTier | null;
  elderTier.value = e === 'large' || e === 'xlarge' ? e : 'standard';
  apply();
}

export function useAccessibilityModes() {
  return { outdoor, elderTier, initAccessibilityModes };
}
