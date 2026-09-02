import { ref } from 'vue';

const open = ref(false);
const presetPatrolId = ref<number | null>(null);

export function useFirePatrolDialog() {
  function openFirePatrol(options?: { patrolId?: number }) {
    presetPatrolId.value = options?.patrolId ?? null;
    open.value = true;
  }

  function closeFirePatrol() {
    open.value = false;
  }

  return {
    firePatrolOpen: open,
    firePatrolPresetId: presetPatrolId,
    openFirePatrol,
    closeFirePatrol,
  };
}
