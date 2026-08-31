import { ref, watch } from 'vue';

// 移动端无障碍模式：户外高对比皮肤 + 适老模式（开关式，开即最大字号）
// 状态持久化到 localStorage，并在 main.ts 挂载前由 initAccessibilityModes() 注入根节点，
// 避免刷新闪烁（详见 AGENTS.md / 详细设计 V1.5 §3.3）。

const OUTDOOR_KEY = 'mm-mb-outdoor';
const ELDER_KEY = 'mm-mb-elder';

const outdoor = ref(false);
const elder = ref(false);

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
  if (elder.value) {
    root.dataset.elder = 'on';
    localStorage.setItem(ELDER_KEY, '1');
  } else {
    delete root.dataset.elder;
    localStorage.setItem(ELDER_KEY, '0');
  }
}

watch(outdoor, apply, { flush: 'sync' });
watch(elder, apply, { flush: 'sync' });

export function initAccessibilityModes(): void {
  const o = localStorage.getItem(OUTDOOR_KEY);
  outdoor.value = o === '1';
  const e = localStorage.getItem(ELDER_KEY);
  elder.value = e === '1';
  apply();
}

export function useAccessibilityModes() {
  return { outdoor, elder, initAccessibilityModes };
}
