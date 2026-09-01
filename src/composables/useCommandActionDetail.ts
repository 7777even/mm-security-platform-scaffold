import { computed, nextTick, ref } from 'vue';

const DRAWER_TRANSITION_MS = 320;

export const selectedCommandActionId = ref<string | null>(null);
export const commandDrawerVisible = ref(false);

let transitionToken = 0;

export const commandActionDetailOpen = computed(() => commandDrawerVisible.value);

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function openCommandActionDetail(commandId: string) {
  const token = ++transitionToken;
  const switching =
    commandDrawerVisible.value &&
    selectedCommandActionId.value !== null &&
    selectedCommandActionId.value !== commandId;

  if (switching) {
    commandDrawerVisible.value = false;
    await delay(DRAWER_TRANSITION_MS);
    if (token !== transitionToken) return;
  }

  selectedCommandActionId.value = commandId;
  await nextTick();
  if (token !== transitionToken) return;
  commandDrawerVisible.value = true;
}

export async function closeCommandActionDetail() {
  const token = ++transitionToken;
  commandDrawerVisible.value = false;
  await delay(DRAWER_TRANSITION_MS);
  if (token !== transitionToken) return;
  if (!commandDrawerVisible.value) {
    selectedCommandActionId.value = null;
  }
}
