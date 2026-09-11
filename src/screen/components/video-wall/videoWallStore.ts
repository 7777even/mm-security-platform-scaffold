import { ref } from 'vue';
import { fetchVideoWallNavigation, type VideoWallNavItem } from '@/services/video';
import { backendUnavailableWarn } from '@/services/backendFallback';

// --- Video Mode and Plan logic ---

export interface CellConfig {
  id: string;
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
  hidden: boolean;
  videoId?: string;
  videoName?: string;
  selected?: boolean;
}

export interface VideoPage {
  id: string;
  name: string;
  rows: number;
  cols: number;
  cells: CellConfig[];
}

export interface VideoMode {
  id: string;
  name: string;
  pages: VideoPage[];
}

export interface PlanStep {
  modeId: string;
  pageIndex: number;
}

export interface VideoPlan {
  id: string;
  name: string;
  steps: PlanStep[];
  intervalSeconds: number;
}

// --- 视频墙导航（2026-09-11 起由后端提供：GET /video/wall-navigation，V37 fac_video_wall_node）---
// 目标树 / 厂区视频目录 / 通道→目标映射 / 默认高空AR相机均由后端下发（三态取数，
// 后端不可用时为空树 + 显式告警，绝不回灌本地生成数据）；
// savedModes / savedPlans / 网格布局为前端交互状态，保留本地。

interface TargetChild {
  id: string;
  name: string;
}

interface TargetGroup {
  id: string;
  name: string;
  children: TargetChild[];
}

export interface VideoChild {
  id: string;
  name: string;
}

interface VideoGroup {
  id: string;
  name: string;
  children: VideoChild[];
}

/** 监测目标树：分类 → 目标（后端下发） */
export const targetTree = ref<TargetGroup[]>([]);
/** 厂区视频目录：厂区分区 → 摄像头通道（后端下发） */
export const videoTree = ref<VideoGroup[]>([]);
/** 摄像头通道编码 → 绑定目标编码列表（后端下发） */
export const cameraTargetMap = ref<Record<string, string[]>>({});
/** 默认高空AR相机（后端下发；视频墙默认 2x2 模式与 prepareDefaultHighAltitudeWall 用） */
export const defaultHighAltitudeCameras = ref<Array<{ id: string; name: string }>>([]);

/** 导航加载状态（VideoWallView 挂载时调用 loadVideoWallNavigation） */
export const wallNavLoading = ref(false);
export const wallNavLoaded = ref(false);

/** 后端导航树（label 语义）→ 侧栏树（name 语义） */
function toSidebarTree(
  nodes: VideoWallNavItem[],
): Array<{ id: string; name: string; children: VideoChild[] }> {
  return (nodes ?? []).map((node) => ({
    id: node.id,
    name: node.label,
    children: (node.children ?? []).map((child) => ({ id: child.id, name: child.label })),
  }));
}

/** 重点防区预设：取前 2 个绑定目标各前 2 路通道（与原前端预设 v-1-1/v-1-2/v-2-1/v-2-2 一致） */
function focusPresetCells(): CellConfig[] {
  const byTarget = new Map<string, Array<{ id: string; name: string }>>();
  for (const group of videoTree.value) {
    for (const child of group.children) {
      const owner = (cameraTargetMap.value[child.id] ?? [])[0] ?? '';
      if (!byTarget.has(owner)) byTarget.set(owner, []);
      byTarget.get(owner)!.push({ id: child.id, name: child.name });
    }
  }
  const cells: CellConfig[] = [];
  for (const channels of byTarget.values()) {
    for (const channel of channels.slice(0, 2)) {
      if (cells.length >= 4) return cells;
      const index = cells.length;
      cells.push({
        id: `r${Math.floor(index / 2) + 1}-c${(index % 2) + 1}`,
        row: Math.floor(index / 2) + 1,
        col: (index % 2) + 1,
        rowSpan: 1,
        colSpan: 1,
        hidden: false,
        videoId: channel.id,
        videoName: channel.name,
      });
    }
  }
  return cells;
}

/** 由后端数据构建常用模式（高空AR默认 2x2 / 全景巡检 3x3 / 重点防区 2x2） */
function buildPresetModes(): void {
  const defaultCells: CellConfig[] = defaultHighAltitudeCameras.value.map((camera, index) => ({
    id: `r${Math.floor(index / 2) + 1}-c${(index % 2) + 1}`,
    row: Math.floor(index / 2) + 1,
    col: (index % 2) + 1,
    rowSpan: 1,
    colSpan: 1,
    hidden: false,
    videoId: camera.id,
    videoName: camera.name,
  }));
  savedModes.value = [
    {
      id: 'm_default',
      name: '高空AR默认模式 (2x2)',
      pages: [{ id: 'p_default', name: '高空AR', rows: 2, cols: 2, cells: defaultCells }],
    },
    {
      id: 'm1',
      name: '全景巡检模式 (3x3)',
      pages: [{ id: 'p1', name: '区域1', rows: 3, cols: 3, cells: [] }],
    },
    {
      id: 'm2',
      name: '重点防区模式 (2x2)',
      pages: [{ id: 'p1', name: '防区1', rows: 2, cols: 2, cells: focusPresetCells() }],
    },
  ];
}

function wallHasVideo(): boolean {
  return Boolean(
    currentLayout.value?.mode.pages.some((page) => page.cells.some((cell) => cell.videoId)),
  );
}

let wallNavPromise: Promise<void> | null = null;

/**
 * 加载视频墙导航（幂等，VideoWallView 挂载时调用）。
 * 三态由 service 层保证：后端不可用/失败时空树 + 显式告警；
 * 加载完成且墙面仍无画面、也无待自动填充/事件上下文时，应用默认高空AR墙。
 */
export function loadVideoWallNavigation(): Promise<void> {
  if (wallNavLoaded.value) return Promise.resolve();
  if (wallNavPromise) return wallNavPromise;
  wallNavPromise = (async () => {
    wallNavLoading.value = true;
    try {
      const nav = await fetchVideoWallNavigation();
      targetTree.value = toSidebarTree(nav.targetTree);
      videoTree.value = toSidebarTree(nav.videoTree);
      cameraTargetMap.value = nav.cameraTargetMap;
      defaultHighAltitudeCameras.value = nav.defaultHighAltitudeCameras.map((camera) => ({
        id: camera.id,
        name: camera.label,
      }));
      buildPresetModes();
      wallNavLoaded.value = true;
      if (
        !wallHasVideo() &&
        pendingAutoFillCameras.value.length === 0 &&
        !activeEventVideoContext.value
      ) {
        prepareDefaultHighAltitudeWall();
      }
    } catch {
      // service 层已三态（失败返回空态并告警）；此处兜底确保失败可见、不静默。
      backendUnavailableWarn('video', '/video/wall-navigation');
    } finally {
      wallNavLoading.value = false;
      wallNavPromise = null;
    }
  })();
  return wallNavPromise;
}

/** 常用模式（本地 UI 偏好；m_default/m1/m2 内容在导航加载完成后由 buildPresetModes 构建） */
export const savedModes = ref<VideoMode[]>([]);

export interface ActiveLayout {
  mode: VideoMode;
  activePageIndex: number;
}

export interface WallDisplayContext {
  key: string;
  name: string;
  source: string;
}

export const wallDisplayContext = ref<WallDisplayContext>({
  key: 'default-high-ar',
  name: '高空AR',
  source: '默认场景',
});

export function setWallDisplayContext(context: WallDisplayContext) {
  wallDisplayContext.value = context;
}

// 当前正在编辑或预览的布局；导航加载完成前为 null（空墙），加载后应用默认高空AR墙
export const currentLayout = ref<ActiveLayout | null>(null);

// 预案数据
export const savedPlans = ref<VideoPlan[]>([
  {
    id: 'plan1',
    name: '夜间定时巡航预案',
    steps: [
      { modeId: 'm_default', pageIndex: 0 },
      { modeId: 'm2', pageIndex: 0 },
    ],
    intervalSeconds: 5,
  },
]);

export const activePlanId = ref<string | null>(null);

// 定时器引用
let planInterval: number | null = null;

export const applyMode = (mode: VideoMode, pageIndex: number = 0) => {
  currentLayout.value = {
    mode: JSON.parse(JSON.stringify(mode)),
    activePageIndex: pageIndex,
  };
  setWallDisplayContext({ key: `mode:${mode.id}`, name: mode.name, source: '常用模式' });
};

export const startPlan = (planId: string) => {
  stopPlan();
  const plan = savedPlans.value.find((p) => p.id === planId);
  if (!plan || plan.steps.length === 0) return;

  activePlanId.value = planId;
  let stepIndex = 0;

  const applyStep = (step: PlanStep) => {
    const mode = savedModes.value.find((m) => m.id === step.modeId);
    if (mode) {
      applyMode(mode, step.pageIndex);
    }
  };

  // 立即执行第一次
  applyStep(plan.steps[0]);

  // 设置定时循环
  planInterval = window.setInterval(() => {
    stepIndex = (stepIndex + 1) % plan.steps.length;
    applyStep(plan.steps[stepIndex]);
  }, plan.intervalSeconds * 1000);
};

export const stopPlan = () => {
  if (planInterval !== null) {
    clearInterval(planInterval);
    planInterval = null;
  }
  activePlanId.value = null;
};

// --- Playback Mode State ---
export const videoMode = ref<'realtime' | 'playback'>('realtime');
export const playbackTimeRange = ref<{ start: string; end: string }>({
  start: '',
  end: '',
});
export interface VideoWallAlarmRecord {
  id: number;
  time: string;
  location: string;
  desc: string;
  level: string;
}

// 告警行点击后待回放（AlarmPanel 写入；Grid/Player 按需读取）
export const selectedAlarmEvent = ref<VideoWallAlarmRecord | null>(null);

// 用于组件间通信的全局队列，触发自动填入视频网格的操作（兼容数值/字符串相机编号）
export type VideoWallFillCamera = { id: string | number; name: string };
export const pendingAutoFillCameras = ref<VideoWallFillCamera[]>([]);

export function replaceWallWithCameras(
  cameras: Array<{ id: string; name: string }>,
  label: string,
  context: WallDisplayContext,
  forcedGrid?: { rows: number; cols: number },
) {
  const rows = forcedGrid?.rows ?? (cameras.length <= 4 ? 2 : cameras.length <= 9 ? 3 : 4);
  const cols = forcedGrid?.cols ?? rows;
  const pageSize = rows * cols;
  const chunks = cameras.length
    ? Array.from({ length: Math.ceil(cameras.length / pageSize) }, (_, index) =>
        cameras.slice(index * pageSize, (index + 1) * pageSize),
      )
    : [[]];

  const pages: VideoPage[] = chunks.map((chunk, pageIndex) => {
    const cells: CellConfig[] = [];
    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= cols; col++) {
        const camera = chunk[(row - 1) * cols + col - 1];
        cells.push({
          id: `r${row}-c${col}`,
          row,
          col,
          rowSpan: 1,
          colSpan: 1,
          hidden: false,
          videoId: camera?.id,
          videoName: camera?.name,
        });
      }
    }
    return {
      id: `wall-page-${Date.now()}-${pageIndex}`,
      name: chunks.length > 1 ? `${label} 第${pageIndex + 1}页` : label,
      rows,
      cols,
      cells,
    };
  });

  currentLayout.value = {
    mode: { id: `wall-layout-${Date.now()}`, name: label, pages },
    activePageIndex: 0,
  };
  setWallDisplayContext(context);
}

export function prepareDefaultHighAltitudeWall() {
  replaceWallWithCameras(
    defaultHighAltitudeCameras.value,
    '高空AR',
    { key: 'default-high-ar', name: '高空AR', source: '默认场景' },
    { rows: 2, cols: 2 },
  );
}

/**
 * 供联动巡查等模块调用：跳转视频墙前重置为空白 4x4 网格并排队待填入摄像头，
 * 确保进入视频墙后这些摄像头直接出现在当前页。
 */
export function prepareAutoFillCameras(cameras: VideoWallFillCamera[]) {
  currentLayout.value = {
    mode: {
      id: 'current',
      name: '当前',
      pages: [
        {
          id: 'p_auto',
          name: '联动巡查',
          rows: 4,
          cols: 4,
          cells: [],
        },
      ],
    },
    activePageIndex: 0,
  };
  pendingAutoFillCameras.value = cameras;
  setWallDisplayContext({ key: 'linked-cameras', name: '联动视频', source: '联动巡查' });
}

// --- Event-driven video grouping ---

export type EventVideoKind = 'accident' | 'weather';

export interface EventVideoCamera {
  id: string;
  name: string;
}

export interface EventVideoGroup {
  id: string;
  name: string;
  cameras: EventVideoCamera[];
  temporary?: boolean;
}

export interface EventVideoRecord {
  id: string;
  action: string;
  detail: string;
  createdAt: string;
}

export interface EventVideoContext {
  eventId: string;
  eventTitle: string;
  kind: EventVideoKind;
  sourceRoute: string;
  groups: EventVideoGroup[];
  originalGroups: EventVideoGroup[];
  records: EventVideoRecord[];
}

export const activeEventVideoContext = ref<EventVideoContext | null>(null);
export const pendingEventVideoRemovals = ref<string[]>([]);

export function clearEventVideoContext() {
  activeEventVideoContext.value = null;
}

function cloneGroups(groups: EventVideoGroup[]) {
  return JSON.parse(JSON.stringify(groups)) as EventVideoGroup[];
}

function camera(id: string, name: string): EventVideoCamera {
  return { id, name };
}

function buildEventGroups(kind: EventVideoKind): EventVideoGroup[] {
  if (kind === 'weather') {
    return [
      {
        id: 'weather-overview',
        name: '高空AR与厂区全景',
        cameras: [
          camera('v-1-1', '1#厂区高空AR北向'),
          camera('v-1-2', '炼油区高点全景'),
          camera('v-1-3', '化工区高点全景'),
        ],
      },
      {
        id: 'weather-flood',
        name: '低洼易涝点',
        cameras: [
          camera('v-2-1', '北门低洼点'),
          camera('v-2-2', '成品油路易涝点'),
          camera('v-2-3', '仓储物流区低洼点'),
        ],
      },
      {
        id: 'weather-drainage',
        name: '排水口与应急池',
        cameras: [
          camera('v-3-1', '总排口监控'),
          camera('v-3-2', '事故应急池入口'),
          camera('v-3-3', '雨水泵站'),
        ],
      },
      {
        id: 'weather-hazard',
        name: '重大危险源与储罐区',
        cameras: [
          camera('v-4-1', '储罐区B-3东侧'),
          camera('v-4-2', '液化烃罐区南侧'),
          camera('v-4-3', '罐区装卸平台'),
          camera('v-4-4', '催化裂化装置'),
        ],
      },
      {
        id: 'weather-access',
        name: '厂区出入口与主干道路',
        cameras: [
          camera('v-5-1', '厂区西门'),
          camera('v-5-2', '厂区北门'),
          camera('v-5-3', '应急通道东段'),
        ],
      },
    ];
  }

  return [
    {
      id: 'accident-core',
      name: '事故装置核心监控',
      cameras: [
        camera('v-21-1', '储罐区B-3东侧球机'),
        camera('v-21-2', '储罐区B-3罐顶监控'),
        camera('v-21-3', '事故点南侧管廊'),
      ],
    },
    {
      id: 'accident-hazard',
      name: '周边重大危险源',
      cameras: [
        camera('v-22-1', '液化烃罐区南侧'),
        camera('v-22-2', '催化裂化装置西侧'),
        camera('v-22-3', '加氢装置入口'),
      ],
    },
    {
      id: 'accident-route',
      name: '消防救援路线与道路',
      cameras: [
        camera('v-23-1', '消防站出入口'),
        camera('v-23-2', '救援路线北段'),
        camera('v-23-3', '救援路线南段'),
        camera('v-23-4', '应急通道交叉口'),
      ],
    },
    {
      id: 'accident-evacuation',
      name: '疏散出口与集合点',
      cameras: [
        camera('v-24-1', '厂区西门'),
        camera('v-24-2', '南侧疏散出口'),
        camera('v-24-3', '一号应急集合点'),
      ],
    },
    {
      id: 'accident-mobile',
      name: '高空AR与移动视频',
      cameras: [
        camera('v-25-1', '1#厂区高空AR'),
        camera('v-25-2', '现场布控球01'),
        camera('v-25-3', '救援记录仪01'),
      ],
    },
  ];
}

function formatRecordTime() {
  return new Date().toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function addEventVideoRecord(action: string, detail: string) {
  const context = activeEventVideoContext.value;
  if (!context) return;
  context.records.unshift({
    id: `record-${Date.now()}-${Math.random()}`,
    action,
    detail,
    createdAt: formatRecordTime(),
  });
}

function uniqueEventCameras(groups: EventVideoGroup[]) {
  const seen = new Set<string>();
  return groups
    .flatMap((group) => group.cameras)
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
}

export function prepareEventVideoWall(input: {
  eventId: string | number;
  eventTitle: string;
  kind: EventVideoKind;
  sourceRoute: string;
}) {
  const groups = buildEventGroups(input.kind);
  activeEventVideoContext.value = {
    eventId: String(input.eventId),
    eventTitle: input.eventTitle,
    kind: input.kind,
    sourceRoute: input.sourceRoute,
    groups: cloneGroups(groups),
    originalGroups: cloneGroups(groups),
    records: [],
  };
  addEventVideoRecord('自动归集', `已按事件场景归集 ${groups.length} 个视频分组`);
  clearEventVideoWall(false);
}

export function ensureEventVideoWall(input: {
  eventId: string | number;
  eventTitle: string;
  kind: EventVideoKind;
  sourceRoute: string;
}) {
  const current = activeEventVideoContext.value;
  if (current?.eventId === String(input.eventId) && current.kind === input.kind) return;
  prepareEventVideoWall(input);
}

function replaceWallWithEventCameras(
  cameras: EventVideoCamera[],
  label: string,
  contextKey = `event:${label}`,
) {
  const context = activeEventVideoContext.value;
  replaceWallWithCameras(
    cameras,
    label,
    {
      key: contextKey,
      name: label,
      source: context?.kind === 'weather' ? '极端天气事件' : '应急事件',
    },
    { rows: 4, cols: 4 },
  );
  if (activeEventVideoContext.value)
    addEventVideoRecord('替换上墙', `${label}，共 ${cameras.length} 路视频`);
}

export function clearEventVideoWall(withRecord = true) {
  replaceWallWithEventCameras([], '待上墙');
  if (activeEventVideoContext.value) {
    // replaceWallWithEventCameras 会写入一条“替换上墙”，空墙场景改为更准确的操作记录。
    activeEventVideoContext.value.records.shift();
    if (withRecord) addEventVideoRecord('清空画面', '视频墙已清空，可重新选择全部或单个分组上墙');
  }
}

export function showEventGroupOnWall(groupId: string, append = false) {
  const context = activeEventVideoContext.value;
  const group = context?.groups.find((item) => item.id === groupId);
  if (!group) return;
  if (append) {
    pendingAutoFillCameras.value = [...group.cameras];
    setWallDisplayContext({ key: 'mixed', name: '混合编组', source: '事件分组追加' });
    addEventVideoRecord('追加上墙', `${group.name}，共 ${group.cameras.length} 路视频`);
    return;
  }
  replaceWallWithEventCameras(group.cameras, group.name, `event-group:${group.id}`);
}

export function showAllEventVideosOnWall() {
  const context = activeEventVideoContext.value;
  if (!context) return;
  replaceWallWithEventCameras(uniqueEventCameras(context.groups), '全部事件视频', 'event:all');
}

export function removeCameraFromEventGroup(groupId: string, cameraId: string) {
  const context = activeEventVideoContext.value;
  const group = context?.groups.find((item) => item.id === groupId);
  const item = group?.cameras.find((cameraItem) => cameraItem.id === cameraId);
  if (!context || !group || !item) return;
  group.cameras = group.cameras.filter((cameraItem) => cameraItem.id !== cameraId);
  currentLayout.value?.mode.pages.forEach((page) =>
    page.cells.forEach((cell) => {
      if (cell.videoId === cameraId) {
        cell.videoId = undefined;
        cell.videoName = undefined;
      }
    }),
  );
  pendingEventVideoRemovals.value = [cameraId];
  addEventVideoRecord('移出分组', `${item.name} 已从“${group.name}”移出`);
}

export function addCameraToEventGroup(groupId: string, cameraItem: EventVideoCamera) {
  const context = activeEventVideoContext.value;
  const group = context?.groups.find((item) => item.id === groupId);
  if (!context || !group || group.cameras.some((item) => item.id === cameraItem.id)) return false;
  group.cameras.push({ ...cameraItem });
  pendingAutoFillCameras.value = [{ ...cameraItem }];
  setWallDisplayContext({ key: 'mixed', name: '混合编组', source: '临时添加视频' });
  addEventVideoRecord('补充视频', `${cameraItem.name} 已加入“${group.name}”并追加上墙`);
  return true;
}

export function restoreEventVideoGroups() {
  const context = activeEventVideoContext.value;
  if (!context) return { changed: false, groupCount: 0, cameraCount: 0 };
  const changed = JSON.stringify(context.groups) !== JSON.stringify(context.originalGroups);
  context.groups = cloneGroups(context.originalGroups);
  if (changed)
    addEventVideoRecord('恢复初始分组', '已撤销临时分组及视频调整，当前视频墙画面未改变');
  return {
    changed,
    groupCount: context.groups.length,
    cameraCount: uniqueEventCameras(context.groups).length,
  };
}

export function createTemporaryEventGroup(name: string, cameras: EventVideoCamera[]) {
  const context = activeEventVideoContext.value;
  const normalizedName = name.trim();
  if (!context || !normalizedName || cameras.length === 0)
    return { ok: false, message: '请输入分组名称并至少选择一路视频' };
  if (context.groups.some((group) => group.name === normalizedName))
    return { ok: false, message: '分组名称已存在，请重新命名' };

  const uniqueCameras = cameras.filter(
    (item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index,
  );
  const group: EventVideoGroup = {
    id: `temporary-${Date.now()}`,
    name: normalizedName,
    cameras: cloneGroups([{ id: 'copy', name: 'copy', cameras: uniqueCameras }])[0].cameras,
    temporary: true,
  };
  context.groups.push(group);
  addEventVideoRecord('新建临时分组', `${group.name}，共 ${group.cameras.length} 路视频`);
  replaceWallWithEventCameras(group.cameras, group.name, `event-group:${group.id}`);
  return { ok: true, group };
}

export function removeTemporaryEventGroup(groupId: string) {
  const context = activeEventVideoContext.value;
  const group = context?.groups.find((item) => item.id === groupId && item.temporary);
  if (!context || !group) return false;
  context.groups = context.groups.filter((item) => item.id !== groupId);
  addEventVideoRecord('删除临时分组', `已删除“${group.name}”，当前视频墙画面未改变`);
  return true;
}
