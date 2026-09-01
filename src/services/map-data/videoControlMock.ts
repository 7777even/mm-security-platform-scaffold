export interface VideoControlCategory {
  id: string;
  label: string;
  iconType: number;
}

export interface VideoControlTreeNode {
  id: string;
  label: string;
  children?: VideoControlTreeNode[];
}

export type VideoCellStatus = 'live' | 'loading' | 'ai';

export interface VideoControlCell {
  id: number;
  name: string;
  cameraType: string;
  location: string;
  status: VideoCellStatus;
  hd: boolean;
  thumbIndex: number;
}

export type GridLayout = '1x1' | '2x2' | '3x3';

export const videoControlCategories: VideoControlCategory[] = [
  { id: 'refining', label: '炼油区', iconType: 0 },
  { id: 'tank', label: '原油罐区', iconType: 1 },
  { id: 'hazard', label: '重大危险源', iconType: 2 },
  { id: 'production', label: '生产区', iconType: 3 },
  { id: 'gate', label: '出入口', iconType: 4 },
  { id: 'warehouse', label: '仓库', iconType: 5 },
  { id: 'pump', label: '泵房', iconType: 6 },
  { id: 'other', label: '其它区域', iconType: 7 },
];

export const videoControlTree: VideoControlTreeNode[] = [
  {
    id: 'drill',
    label: '应急演练',
    children: [
      { id: 'drill-1', label: '演练1' },
      { id: 'drill-2', label: '演练2' },
    ],
  },
  {
    id: 'event',
    label: '应急事件',
    children: [
      { id: 'event-1', label: '事件1' },
      { id: 'event-2', label: '事件2' },
    ],
  },
  {
    id: 'patrol',
    label: '日常巡检',
    children: [
      { id: 'patrol-1', label: '巡检区域-1' },
      { id: 'patrol-2', label: '巡检区域-2' },
    ],
  },
  {
    id: 'key',
    label: '重点监控',
    children: [{ id: 'key-1', label: '炼油罐区-5#球机' }],
  },
];

const cameraNames = [
  '炼油区-1',
  '炼油区-2',
  '炼油区-3',
  '催化区-1',
  '催化区-2',
  '罐区-1',
  '罐区-2',
  '罐区-3',
  '码头-1',
  '码头-2',
  '泵房-1',
  '泵房-2',
  '仓库-1',
  '仓库-2',
  '出入口-1',
  '出入口-2',
  '生产区-1',
  '生产区-2',
  '厂界-1',
  '厂界-2',
  '装卸区-1',
  '装卸区-2',
  '办公区-1',
  '办公区-2',
  '配电房-1',
  '配电房-2',
  '消防站-1',
];

const cameraTypes = ['固定点机', '球机', '枪机', '云台'];

function buildPageCells(page: number): VideoControlCell[] {
  const offset = (page - 1) * 9;
  return Array.from({ length: 9 }, (_, i) => {
    const globalIndex = offset + i;
    const name = cameraNames[globalIndex % cameraNames.length] ?? `监控点-${globalIndex + 1}`;
    let status: VideoCellStatus = 'live';
    if (page === 1 && i === 1) status = 'loading';
    if (page === 1 && i === 4) status = 'ai';
    return {
      id: globalIndex + 1,
      name,
      cameraType: cameraTypes[globalIndex % cameraTypes.length] ?? '固定点机',
      location: '中海壳牌石油化工有限公司',
      status,
      hd: true,
      thumbIndex: globalIndex % 6,
    };
  });
}

export const videoControlPages = [1, 2, 3];

export function getVideoControlPage(page: number): VideoControlCell[] {
  return buildPageCells(page);
}
