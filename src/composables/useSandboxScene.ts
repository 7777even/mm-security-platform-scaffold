import { reactive, ref } from 'vue';

export type SandboxToolKind =
  'cmd-node' | 'fire-truck' | 'medical-point' | 'isolation-circle' | 'evac-route' | 'water-curtain';

export interface SandboxPointItem {
  id: string;
  kind: 'cmd-node' | 'fire-truck' | 'medical-point';
  label: string;
  longitude: number;
  latitude: number;
}

export interface SandboxLineItem {
  id: string;
  kind: 'evac-route' | 'water-curtain';
  label: string;
  points: Array<{ longitude: number; latitude: number }>;
}

export interface SandboxCircleItem {
  id: string;
  kind: 'isolation-circle';
  label: string;
  longitude: number;
  latitude: number;
  radiusMeters: number;
}

export type SandboxItem = SandboxPointItem | SandboxLineItem | SandboxCircleItem;

export interface SandboxToolMeta {
  kind: SandboxToolKind;
  label: string;
  icon: string;
  placement: 'point' | 'circle' | 'line';
}

export const SANDBOX_TOOLS: SandboxToolMeta[] = [
  { kind: 'cmd-node', label: '现场指挥部标点', icon: '⌘', placement: 'point' },
  { kind: 'fire-truck', label: '消防车/水炮部署', icon: '🚒', placement: 'point' },
  { kind: 'medical-point', label: '医疗救护点', icon: '🚑', placement: 'point' },
  { kind: 'isolation-circle', label: '防爆警戒圈', icon: '◎', placement: 'circle' },
  { kind: 'evac-route', label: '疏散避险路线', icon: '➤', placement: 'line' },
  { kind: 'water-curtain', label: '水幕隔离带', icon: '💧', placement: 'line' },
];

export const SANDBOX_TOOL_LABEL: Record<SandboxToolKind, string> = Object.fromEntries(
  SANDBOX_TOOLS.map((tool) => [tool.kind, tool.label]),
) as Record<SandboxToolKind, string>;

const sandboxOpen = ref(false);
const activeTool = ref<SandboxToolKind | null>(null);
const items = ref<SandboxItem[]>([]);
const plumeRunning = ref(false);
const plumeParams = reactive({
  windDirectionDeg: 135,
  windSpeed: 3.5,
  leakRate: 15,
});
const layerToggles = reactive({
  isolationCircle: true,
  plumeModel: true,
  evacuationRoutes: true,
  hydrants: true,
});

let idSeed = 1;

function enterSandbox() {
  sandboxOpen.value = true;
}

function exitSandbox() {
  sandboxOpen.value = false;
  activeTool.value = null;
  items.value = [];
  plumeRunning.value = false;
}

function setActiveTool(tool: SandboxToolKind | null) {
  activeTool.value = activeTool.value === tool ? null : tool;
}

function addSandboxItem(item: Omit<SandboxPointItem, 'id'>): void;
function addSandboxItem(item: Omit<SandboxLineItem, 'id'>): void;
function addSandboxItem(item: Omit<SandboxCircleItem, 'id'>): void;
function addSandboxItem(item: Omit<SandboxItem, 'id'>) {
  items.value.push({ ...item, id: `sb-${idSeed++}` } as unknown as SandboxItem);
}

function clearSandboxItems() {
  items.value = [];
}

function runPlumeAnalysis() {
  plumeRunning.value = true;
}

function stopPlumeAnalysis() {
  plumeRunning.value = false;
}

export function useSandboxScene() {
  return {
    sandboxOpen,
    activeTool,
    items,
    plumeRunning,
    plumeParams,
    layerToggles,
    enterSandbox,
    exitSandbox,
    setActiveTool,
    addSandboxItem,
    clearSandboxItems,
    runPlumeAnalysis,
    stopPlumeAnalysis,
  };
}
