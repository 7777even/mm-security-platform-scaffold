import { computed, ref } from 'vue';
import {
  buildLinkageRules,
  getVideoLinkageConfig,
  videoLinkageConfigs,
  type LinkageRuleRow,
  type VideoLinkageConfig,
} from '../data/videoLinkageMock';

export const linkageDialogOpen = ref(false);
export const linkageEditMode = ref(false);
export const editingConfigId = ref<string | null>(null);

export const editingConfig = computed<VideoLinkageConfig | null>(() =>
  getVideoLinkageConfig(editingConfigId.value),
);

export const editingRules = ref<LinkageRuleRow[]>([]);

export function openLinkageDialog() {
  linkageDialogOpen.value = true;
  linkageEditMode.value = false;
  editingConfigId.value = null;
}

export function closeLinkageDialog() {
  linkageDialogOpen.value = false;
  linkageEditMode.value = false;
  editingConfigId.value = null;
  editingRules.value = [];
}

export function startLinkageEdit(id: string | null = null) {
  editingConfigId.value = id;
  linkageEditMode.value = true;
  editingRules.value = id ? buildLinkageRules(id).map((r) => ({ ...r })) : [];
}

export function cancelLinkageEdit() {
  linkageEditMode.value = false;
  editingConfigId.value = null;
  editingRules.value = [];
}

export function saveLinkageEdit() {
  // 占位：高保真演示，保存后回到列表
  linkageEditMode.value = false;
  editingConfigId.value = null;
  editingRules.value = [];
}

export function useVideoLinkageConfig() {
  return {
    linkageDialogOpen,
    linkageEditMode,
    editingConfigId,
    editingConfig,
    editingRules,
    openLinkageDialog,
    closeLinkageDialog,
    startLinkageEdit,
    cancelLinkageEdit,
    saveLinkageEdit,
    configs: videoLinkageConfigs,
  };
}
