import { computed, ref, watch } from 'vue';

export type ViewportPresetId =
  | 'native'
  | '1920x1080'
  | '2560x1440'
  | '3840x2160'
  | '1680x1050'
  | '1600x900'
  | '1366x768'
  | '1280x720'
  | 'custom';

export interface ViewportPreset {
  id: ViewportPresetId;
  label: string;
  width: number | null;
  height: number | null;
}

export const viewportPresets: ViewportPreset[] = [
  { id: '1920x1080', label: '1920 × 1080', width: 1920, height: 1080 },
  { id: '2560x1440', label: '2560 × 1440', width: 2560, height: 1440 },
  { id: '3840x2160', label: '3840 × 2160', width: 3840, height: 2160 },
  { id: '1680x1050', label: '1680 × 1050', width: 1680, height: 1050 },
  { id: '1600x900', label: '1600 × 900', width: 1600, height: 900 },
  { id: '1366x768', label: '1366 × 768', width: 1366, height: 768 },
  { id: '1280x720', label: '1280 × 720', width: 1280, height: 720 },
];

const STORAGE_KEY = 'fire-monitoring:viewport-sim';

interface StoredViewportState {
  activePresetId: ViewportPresetId;
  customWidth: number;
  customHeight: number;
}

function readStoredState(): StoredViewportState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredViewportState;
  } catch {
    return null;
  }
}

function writeStoredState(state: StoredViewportState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const stored = readStoredState();

const activePresetId = ref<ViewportPresetId>(stored?.activePresetId ?? 'native');
const customWidth = ref(stored?.customWidth ?? 1920);
const customHeight = ref(stored?.customHeight ?? 1080);
export const sizePanelOpen = ref(false);
export const sizePanelAnchorEl = ref<HTMLElement | null>(null);
/** 本次模拟会话内首次选尺寸时保持顶部尺寸条显示 */
export const isFirstSimEntry = ref(activePresetId.value === 'native');
export const hideToolbarSignal = ref(0);

export const viewportSimulator = {
  activePresetId,
  customWidth,
  customHeight,
  sizePanelOpen,
  sizePanelAnchorEl,
};

export const isNativeViewport = computed(() => activePresetId.value === 'native');

export const isSimPreviewActive = computed(() => !isNativeViewport.value);

export const simulatedViewport = computed(() => {
  if (activePresetId.value === 'native') {
    return { width: null as number | null, height: null as number | null, label: '' };
  }

  if (activePresetId.value === 'custom') {
    return {
      width: customWidth.value,
      height: customHeight.value,
      label: `${customWidth.value} × ${customHeight.value}`,
    };
  }

  const preset = viewportPresets.find((item) => item.id === activePresetId.value);
  return {
    width: preset?.width ?? 1920,
    height: preset?.height ?? 1080,
    label: preset?.label ?? '1920 × 1080',
  };
});

watch(
  [activePresetId, customWidth, customHeight],
  () => {
    writeStoredState({
      activePresetId: activePresetId.value,
      customWidth: customWidth.value,
      customHeight: customHeight.value,
    });
  },
  { deep: true },
);

export function openSizePanel(anchorEl: HTMLElement | null) {
  if (!anchorEl) return;
  sizePanelAnchorEl.value = anchorEl;
  sizePanelOpen.value = true;
}

export function closeSizePanel() {
  sizePanelOpen.value = false;
}

export function toggleSizePanel(anchorEl: HTMLElement | null) {
  if (sizePanelOpen.value && sizePanelAnchorEl.value === anchorEl) {
    closeSizePanel();
    return;
  }
  openSizePanel(anchorEl);
}

export function selectViewportPreset(id: ViewportPresetId) {
  if (id === 'native') return;
  activePresetId.value = id;
}

export function applyCustomViewport(width: number, height: number) {
  customWidth.value = Math.max(320, Math.round(width));
  customHeight.value = Math.max(240, Math.round(height));
  activePresetId.value = 'custom';
}

/** 尺寸面板确认选档后：仅首次进入模拟时保持尺寸条，之后立即隐藏 */
export function notifySizeChangedFromPanel() {
  if (isFirstSimEntry.value) {
    isFirstSimEntry.value = false;
    return;
  }
  hideToolbarSignal.value += 1;
}

export function exitSimPreview() {
  activePresetId.value = 'native';
  isFirstSimEntry.value = true;
  closeSizePanel();
}
