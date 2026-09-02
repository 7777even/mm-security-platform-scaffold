import { ref } from 'vue';

export const blacklistDialogOpen = ref(false);

export function openBlacklistDialog() {
  blacklistDialogOpen.value = true;
}

export function closeBlacklistDialog() {
  blacklistDialogOpen.value = false;
}

export function useBlacklistDialog() {
  return {
    blacklistDialogOpen,
    openBlacklistDialog,
    closeBlacklistDialog,
  };
}
