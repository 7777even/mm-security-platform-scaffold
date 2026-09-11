import { computed, ref } from 'vue';
import {
  createVideoLinkage,
  deleteVideoLinkage,
  fetchVideoLinkageRules,
  fetchVideoLinkages,
  updateVideoLinkage,
  type VideoLinkageItem,
  type VideoLinkageRuleInput,
  type VideoLinkageRuleRow,
  type VideoLinkageSaveRequest,
} from '@/services/video';
import {
  backendUnavailableWarn,
  isOfflineNoBackend,
  notifyBackendOffline,
} from '@/services/backendFallback';

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

/** 是否落库：配置了 VITE_API_BASE 时才走写接口，否则维持本地演示改（纯静态模式）。 */
function videoLinkageWritesToBackend(): boolean {
  return Boolean(import.meta.env.VITE_API_BASE);
}

/** 由规则行推导「联动业务对象」概览（与后端 applyLinkageFields 同口径：去重 + 顿号连接）。 */
function deriveBusinessObjects(rules: VideoLinkageRuleInput[]): string {
  return Array.from(new Set(rules.map((r) => r.objectName).filter((n) => n && n.trim()))).join(
    '、',
  );
}

function resetLinkageEditState(): void {
  linkageEditMode.value = false;
  editingConfigId.value = null;
  editingRules.value = [];
}

/** 本地演示改（无后端时）：按 payload 新增/覆盖列表项，linkageCount/businessObjects 同步推导。 */
function applyLocalLinkageSave(id: string | null, payload: VideoLinkageSaveRequest): void {
  const item: VideoLinkageItem = {
    id: id ?? `lk-local-${Date.now()}`,
    name: payload.name,
    code: payload.code,
    category: payload.category,
    linkageCount: payload.rules.length,
    businessObjects: deriveBusinessObjects(payload.rules),
  };
  const index = id ? configs.value.findIndex((entry) => entry.id === id) : -1;
  if (index >= 0) configs.value.splice(index, 1, item);
  else configs.value.push(item);
}

/**
 * 保存联动配置（新建或更新，由 editingConfigId 判定）。
 *
 * <p>有后端时落库并把返回的配置写回列表；失败不假成功（返回 false 且列表不动）。
 * 无 VITE_API_BASE 的纯静态演示模式维持本地改，不请求后端。</p>
 */
export async function saveLinkageEdit(payload: VideoLinkageSaveRequest): Promise<boolean> {
  const id = editingConfigId.value;
  // 未连后端且未开演示：写操作显式报错，不做本地改
  if (isOfflineNoBackend()) {
    notifyBackendOffline(
      'video',
      id ? `/video/linkages/${id}` : '/video/linkages',
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    return false;
  }
  if (!videoLinkageWritesToBackend()) {
    applyLocalLinkageSave(id, payload);
    resetLinkageEditState();
    return true;
  }
  try {
    const saved = id ? await updateVideoLinkage(id, payload) : await createVideoLinkage(payload);
    if (!saved) {
      backendUnavailableWarn('video', `/video/linkages/${id}`, '配置不存在');
      return false;
    }
    const index = configs.value.findIndex((item) => item.id === saved.id);
    if (index >= 0) configs.value.splice(index, 1, saved);
    else configs.value.push(saved);
    resetLinkageEditState();
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : '请求失败';
    backendUnavailableWarn('video', id ? `/video/linkages/${id}` : '/video/linkages', message);
    return false;
  }
}

/** 删除联动配置：有后端时落库，失败不删（不假成功）；无后端时仅本地移除。 */
export async function removeLinkageConfig(config: VideoLinkageItem): Promise<void> {
  const index = configs.value.findIndex((item) => item.id === config.id);
  if (index < 0) return;
  // 未连后端且未开演示：写操作显式报错，不做本地改
  if (isOfflineNoBackend()) {
    notifyBackendOffline(
      'video',
      `/video/linkages/${config.id}`,
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    return;
  }
  if (videoLinkageWritesToBackend()) {
    try {
      await deleteVideoLinkage(config.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : '请求失败';
      backendUnavailableWarn('video', `/video/linkages/${config.id}`, message);
      return;
    }
  }
  configs.value.splice(index, 1);
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
    removeLinkageConfig,
    configs,
    loadLinkageConfigs,
  };
}
