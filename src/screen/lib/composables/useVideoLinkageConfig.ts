import { computed, ref } from 'vue';
import {
  fetchVideoLinkageRules,
  fetchVideoLinkages,
  type VideoLinkageItem,
  type VideoLinkageRuleRow,
} from '@/services/video';
import { backendUnavailableWarn } from '@/services/backendFallback';

export const linkageDialogOpen = ref(false);
export const linkageEditMode = ref(false);
export const editingConfigId = ref<string | null>(null);

/** 联动配置列表（/video/linkages）；失败时降级为空列表并打印域级告警。 */
export const configs = ref<VideoLinkageItem[]>([]);
export const configsLoading = ref(false);

export async function loadLinkageConfigs(force = false) {
  if (configsLoading.value) return;
  if (!force && configs.value.length > 0) return;
  configsLoading.value = true;
  try {
    configs.value = await fetchVideoLinkages();
  } catch (error) {
    configs.value = [];
    const message = error instanceof Error ? error.message : '请求失败';
    backendUnavailableWarn('video', '/video/linkages', message);
  } finally {
    configsLoading.value = false;
  }
}

export const editingConfig = computed<VideoLinkageItem | null>(
  () => configs.value.find((item) => item.id === editingConfigId.value) ?? null,
);

export const editingRules = ref<VideoLinkageRuleRow[]>([]);

export function openLinkageDialog() {
  linkageDialogOpen.value = true;
  linkageEditMode.value = false;
  editingConfigId.value = null;
  void loadLinkageConfigs();
}

export function closeLinkageDialog() {
  linkageDialogOpen.value = false;
  linkageEditMode.value = false;
  editingConfigId.value = null;
  editingRules.value = [];
}

export async function startLinkageEdit(id: string | null = null) {
  editingConfigId.value = id;
  linkageEditMode.value = true;
  if (!id) {
    editingRules.value = [];
    return;
  }
  // 规则行走 /video/linkages/{code}/rules（按监控编号查询）。
  const code = editingConfig.value?.code;
  if (!code) {
    editingRules.value = [];
    return;
  }
  try {
    editingRules.value = (await fetchVideoLinkageRules(code)).map((r) => ({ ...r }));
  } catch (error) {
    editingRules.value = [];
    const message = error instanceof Error ? error.message : '请求失败';
    backendUnavailableWarn('video', `/video/linkages/${code}/rules`, message);
  }
}

export function cancelLinkageEdit() {
  linkageEditMode.value = false;
  editingConfigId.value = null;
  editingRules.value = [];
}

export function saveLinkageEdit() {
  // 占位：高保真演示，保存后回到列表（联动规则暂无写端点）
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
    configs,
    loadLinkageConfigs,
  };
}
