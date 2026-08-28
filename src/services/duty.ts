import { request } from '@/services/http';

// 应急值班值守（按部门 + 班次）
export type DutyRole = '值班领导' | '值班员';
export type DutyShift = '白班' | '夜班';

export interface DutyMember {
  id: string;
  name: string;
  phone: string;
  role: DutyRole;
  department: string;
  shift: DutyShift;
}

export interface DutyRoster {
  departments: string[];
  shift: DutyShift;
  members: DutyMember[];
}

// 开发期自包含 mock：按白班 / 夜班各排 4 人（部门可下拉切换）
const DEV_FIXTURE: DutyRoster = {
  departments: ['全部'],
  shift: '白班',
  members: [
    {
      id: 'd1',
      name: '杨恒明',
      phone: '13792536966',
      role: '值班领导',
      department: '全部',
      shift: '白班',
    },
    {
      id: 'd2',
      name: '高颖',
      phone: '18300556145',
      role: '值班员',
      department: '全部',
      shift: '白班',
    },
    {
      id: 'd3',
      name: '高颖',
      phone: '18300556145',
      role: '值班员',
      department: '全部',
      shift: '白班',
    },
    {
      id: 'd4',
      name: '高颖',
      phone: '18300556145',
      role: '值班员',
      department: '全部',
      shift: '白班',
    },
    {
      id: 'd5',
      name: '王建国',
      phone: '13800138001',
      role: '值班领导',
      department: '全部',
      shift: '夜班',
    },
    {
      id: 'd6',
      name: '李志强',
      phone: '13800138002',
      role: '值班员',
      department: '全部',
      shift: '夜班',
    },
    {
      id: 'd7',
      name: '刘明',
      phone: '13800138003',
      role: '值班员',
      department: '全部',
      shift: '夜班',
    },
    {
      id: 'd8',
      name: '陈红',
      phone: '13800138004',
      role: '值班员',
      department: '全部',
      shift: '夜班',
    },
  ],
};

export async function fetchDutyRoster(): Promise<DutyRoster> {
  if (!import.meta.env.VITE_API_BASE) return Promise.resolve(DEV_FIXTURE);
  try {
    const data = await request<DutyRoster>({ url: '/emergency/duty', method: 'GET' });
    if (!data || !Array.isArray(data.members)) return DEV_FIXTURE;
    return data;
  } catch {
    return DEV_FIXTURE;
  }
}
