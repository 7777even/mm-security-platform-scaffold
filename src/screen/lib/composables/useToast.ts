import { ref } from 'vue';

export const toastMessage = ref('');
let toastTimer: number | undefined;

export function showToast(message: string) {
  toastMessage.value = message;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastMessage.value = '';
  }, 2600);
}

export function clearToast() {
  window.clearTimeout(toastTimer);
  toastMessage.value = '';
}
