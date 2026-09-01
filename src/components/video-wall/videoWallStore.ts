import { ref } from 'vue';

export const zones = ref([
  {
    id: 'z1',
    name: '一号储罐区',
    manager: '王建国',
    phone: '13800138001',
    lon: 110.8872,
    lat: 21.675,
    height: 1200,
    sensors: { gas: 15, smoke: 10 },
    fireDevices: { total: 20, online: 19, offline: 1 },
    expanded: false,
    equipments: [
      {
        id: 'e1-1',
        name: 'G-101 储罐',
        type: '设备',
        lon: 110.8872,
        lat: 21.675,
        status: 'normal',
      },
      {
        id: 'e1-2',
        name: 'G-102 储罐',
        type: '设备',
        lon: 110.8875,
        lat: 21.6752,
        status: 'alarm',
      },
    ],
    alarms: [
      {
        id: 2,
        level: 'high',
        levelName: '可燃气体超限',
        source: 'G-102 顶端GDS',
        time: '3分钟前',
        status: '处置中',
        workflowState: 'handling',
        lon: 110.8875,
        lat: 21.6752,
        height: 800,
        desc: '可燃气体浓度达到 25% LEL，已触发区域声光报警。',
        logs: [
          { time: '10:15', msg: '系统自动接警' },
          { time: '10:16', msg: '确认为真实警情，已派发工单' },
        ],
      },
    ],
  },
  {
    id: 'z2',
    name: '反应釜B区',
    manager: '李伟',
    phone: '13911112222',
    lon: 110.8845,
    lat: 21.6722,
    height: 1500,
    sensors: { gas: 5, smoke: 8, temp: 12 },
    fireDevices: { total: 10, online: 10, offline: 0 },
    expanded: false,
    equipments: [
      {
        id: 'e2-1',
        name: 'B-201 反应釜',
        type: '设备',
        lon: 110.8845,
        lat: 21.6722,
        status: 'alarm',
      },
      {
        id: 'e2-2',
        name: 'B-202 反应釜',
        type: '设备',
        lon: 110.8848,
        lat: 21.6725,
        status: 'normal',
      },
    ],
    alarms: [
      {
        id: 1,
        level: 'critical',
        levelName: '重大火警',
        source: '视频AI识别',
        time: '刚刚',
        status: '未复核',
        workflowState: 'unverified',
        lon: 110.8845,
        lat: 21.6722,
        height: 1500,
        desc: '系统检测到明显明火与浓烟，疑似B-201反应釜法兰泄漏引发。',
        logs: [{ time: '10:20', msg: '视频AI检测到明火，生成告警' }],
      },
    ],
  },
  {
    id: 'z3',
    name: '综合办公楼',
    manager: '张敏',
    phone: '13700000000',
    lon: 110.882,
    lat: 21.67,
    height: 800,
    sensors: { smoke: 50 },
    fireDevices: { total: 100, online: 100, offline: 0 },
    expanded: false,
    equipments: [],
    alarms: [
      {
        id: 3,
        level: 'medium',
        levelName: '普通烟感',
        source: '消防主机',
        time: '15分钟前',
        status: '已闭环',
        workflowState: 'closed',
        lon: 110.882,
        lat: 21.67,
        height: 500,
        desc: '员工抽烟误报，安保人员已现场核实。',
        logs: [
          { time: '10:05', msg: '二楼男厕烟感触发' },
          { time: '10:07', msg: '转派安保张敏现场确认' },
          { time: '10:10', msg: '确认为员工违规抽烟误报，警情解除' },
        ],
      },
    ],
  },
  {
    id: 'z4',
    name: '二号生产车间',
    manager: '陈建斌',
    phone: '13612345678',
    lon: 110.8835,
    lat: 21.671,
    height: 1000,
    sensors: { gas: 8, smoke: 15, temp: 20 },
    fireDevices: { total: 30, online: 30, offline: 0 },
    expanded: false,
    equipments: [
      {
        id: 'e4-1',
        name: 'C-301 反应塔',
        type: '设备',
        lon: 110.8835,
        lat: 21.671,
        status: 'normal',
      },
      {
        id: 'e4-2',
        name: 'P-105 循环泵',
        type: '设备',
        lon: 110.8837,
        lat: 21.6712,
        status: 'normal',
      },
    ],
    alarms: [],
  },
]);

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

// --- 动态生成 120 个监测目标和数百个视频目录 ---
interface TargetChild {
  id: string;
  name: string;
}

interface TargetGroup {
  id: string;
  name: string;
  children: TargetChild[];
}

interface VideoChild {
  id: string;
  name: string;
}

interface VideoGroup {
  id: string;
  name: string;
  children: VideoChild[];
}

const generatedTargetTree: TargetGroup[] = [];
const generatedVideoTree: VideoGroup[] = [];
const generatedCameraTargetMap: Record<string, string[]> = {};

const targetCategories = [
  { prefix: '危化储罐区', name: '重大危险源' },
  { prefix: '反应装置区', name: '生产装置' },
  { prefix: '厂区出入口', name: '厂区出入口' },
  { prefix: '仓储物流区', name: '仓储区域' },
  { prefix: '道路管廊区', name: '道路与管廊' },
  { prefix: '辅助设施区', name: '其他区域' },
];

const factoryAreas = [
  '一号生产厂区',
  '二号生产厂区',
  '储罐与物流区',
  '动力公用工程区',
  '周界安全防范区',
];

// 初始化目标分类
targetCategories.forEach((cat, index) => {
  generatedTargetTree.push({
    id: `cat-${index + 1}`,
    name: cat.name,
    children: [],
  });
});

// 初始化厂区视频分类
factoryAreas.forEach((area, index) => {
  generatedVideoTree.push({
    id: `area-${index + 1}`,
    name: area,
    children: [],
  });
});

// 生成 120 个监测目标设备，每个绑定 4-12 个视频摄像头
for (let i = 1; i <= 120; i++) {
  const catIdx = Math.floor((i - 1) / 20);
  const targetId = `t-${i}`;
  const targetName = `${targetCategories[catIdx].prefix}装置#${String(i).padStart(3, '0')}`;

  generatedTargetTree[catIdx].children.push({
    id: targetId,
    name: targetName,
  });

  // 摄像头数量为 4 ~ 12 个
  const camCount = 4 + (i % 9);
  const areaIdx = Math.floor((i - 1) / 24);

  for (let j = 1; j <= camCount; j++) {
    const cameraId = `v-${i}-${j}`;
    const cameraName = `CAM-装置#${String(i).padStart(3, '0')}-通道${j}`;

    // 添加到厂区视频目录树
    generatedVideoTree[areaIdx].children.push({
      id: cameraId,
      name: cameraName,
    });

    // 建立映射
    generatedCameraTargetMap[cameraId] = [targetId];
  }
}

export const targetTree = ref<TargetGroup[]>(generatedTargetTree);
export const videoTree = ref<VideoGroup[]>(generatedVideoTree);
export const cameraTargetMap = ref<Record<string, string[]>>(generatedCameraTargetMap);

export const defaultHighAltitudeCameras = [
  { id: 'high-ar-1', name: '1#厂区高空AR·全景' },
  { id: 'high-ar-2', name: '炼油区高空AR·北向' },
  { id: 'high-ar-3', name: '化工区高空AR·东向' },
  { id: 'high-ar-4', name: '储运区高空AR·南向' },
];

const defaultModeCells: CellConfig[] = defaultHighAltitudeCameras.map((camera, index) => ({
  id: `r${Math.floor(index / 2) + 1}-c${(index % 2) + 1}`,
  row: Math.floor(index / 2) + 1,
  col: (index % 2) + 1,
  rowSpan: 1,
  colSpan: 1,
  hidden: false,
  videoId: camera.id,
  videoName: camera.name,
}));

// 模拟的常用模式数据
export const savedModes = ref<VideoMode[]>([
  {
    id: 'm_default',
    name: '高空AR默认模式 (2x2)',
    pages: [
      {
        id: 'p_default',
        name: '高空AR',
        rows: 2,
        cols: 2,
        cells: defaultModeCells,
      },
    ],
  },
  {
    id: 'm1',
    name: '全景巡检模式 (3x3)',
    pages: [
      {
        id: 'p1',
        name: '区域1',
        rows: 3,
        cols: 3,
        cells: [],
      },
    ],
  },
  {
    id: 'm2',
    name: '重点防区模式 (2x2)',
    pages: [
      {
        id: 'p1',
        name: '防区1',
        rows: 2,
        cols: 2,
        cells: [
          {
            id: 'r1-c1',
            row: 1,
            col: 1,
            rowSpan: 1,
            colSpan: 1,
            hidden: false,
            videoId: 'v-1-1',
            videoName: 'CAM-装置#001-通道1',
          },
          {
            id: 'r1-c2',
            row: 1,
            col: 2,
            rowSpan: 1,
            colSpan: 1,
            hidden: false,
            videoId: 'v-1-2',
            videoName: 'CAM-装置#001-通道2',
          },
          {
            id: 'r2-c1',
            row: 2,
            col: 1,
            rowSpan: 1,
            colSpan: 1,
            hidden: false,
            videoId: 'v-2-1',
            videoName: 'CAM-装置#002-通道1',
          },
          {
            id: 'r2-c2',
            row: 2,
            col: 2,
            rowSpan: 1,
            colSpan: 1,
            hidden: false,
            videoId: 'v-2-2',
            videoName: 'CAM-装置#002-通道2',
          },
        ],
      },
    ],
  },
]);

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

// 当前正在编辑或预览的布局，传递给 VideoGrid，默认初始化即应用 4x4 模式
export const currentLayout = ref<ActiveLayout | null>({
  mode: JSON.parse(JSON.stringify(savedModes.value[0])),
  activePageIndex: 0,
});

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

/** 智能视频告警事件（模拟数据，见 VideoWallAlarmPanel） */
export interface WallAlarmEvent {
  id: number;
  time: string;
  location: string;
  desc: string;
  level: string;
}

/** 可上墙的摄像头最小结构（目录树子节点 / 事件分组摄像头通用） */
export interface WallCamera {
  id: string;
  name: string;
}

export const selectedAlarmEvent = ref<WallAlarmEvent | null>(null);

// 用于组件间通信的全局队列，触发自动填入视频网格的操作
export const pendingAutoFillCameras = ref<WallCamera[]>([]);

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
    defaultHighAltitudeCameras,
    '高空AR',
    { key: 'default-high-ar', name: '高空AR', source: '默认场景' },
    { rows: 2, cols: 2 },
  );
}

/**
 * 供联动巡查等模块调用：跳转视频墙前重置为空白 4x4 网格并排队待填入摄像头，
 * 确保进入视频墙后这些摄像头直接出现在当前页。
 */
export function prepareAutoFillCameras(cameras: WallCamera[]) {
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
