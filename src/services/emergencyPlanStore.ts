// 应急预案库 in-memory mock store（脚手架阶段 dev mock；后端契约就位后可替换为 REST）
import type { PageResult } from '@/types';

export type PlanLevel = '一级' | '二级' | '三级';
export type PlanCategory = '综合预案' | '专项预案' | '现场处置';

export interface EmergencyPlan {
  id: string;
  name: string;
  category: PlanCategory;
  level: PlanLevel;
  owner: string;
  summary: string;
  updatedAt: string;
}

const KEY = 'em.plans.v1';

function seed(): EmergencyPlan[] {
  const now = Date.now();
  const iso = (m: number): string => new Date(now - m * 60000).toISOString();
  return [
    {
      id: 'PLAN-001',
      name: '全厂综合应急预案',
      category: '综合预案',
      level: '一级',
      owner: '安全环保部',
      summary: '覆盖全厂级重大突发事件的总预案，含组织架构、响应分级、指挥与协同流程。',
      updatedAt: iso(60 * 24 * 3),
    },
    {
      id: 'PLAN-002',
      name: '危险化学品泄漏处置预案',
      category: '专项预案',
      level: '二级',
      owner: '生产运行部',
      summary: '针对危化品储运环节泄漏的专项处置流程，含隔离疏散、防爆堵漏、环境监测。',
      updatedAt: iso(60 * 24 * 7),
    },
    {
      id: 'PLAN-003',
      name: '罐区火灾现场处置方案',
      category: '现场处置',
      level: '三级',
      owner: '消防队',
      summary: '罐区火灾扑救现场处置卡，明确到场力量、进攻路线与冷却保护要求。',
      updatedAt: iso(60 * 24 * 1),
    },
    {
      id: 'PLAN-004',
      name: '防台防汛应急预案',
      category: '专项预案',
      level: '二级',
      owner: '调度中心',
      summary: '台风、暴雨、风暴潮期间停产撤人、设备加固、排水防涝的处置安排。',
      updatedAt: iso(60 * 24 * 5),
    },
    {
      id: 'PLAN-005',
      name: '人员中毒窒息现场处置卡',
      category: '现场处置',
      level: '三级',
      owner: '安全环保部',
      summary: '受限空间作业中毒窒息的现场急救与送医流程。',
      updatedAt: iso(60 * 24 * 10),
    },
  ];
}

function load(): EmergencyPlan[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (raw) return JSON.parse(raw) as EmergencyPlan[];
  } catch {
    /* 忽略 */
  }
  const initial = seed();
  save(initial);
  return initial;
}

function save(list: EmergencyPlan[]): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* 忽略 */
  }
}

let cache: EmergencyPlan[] | null = null;

function list(): EmergencyPlan[] {
  if (!cache) cache = load();
  return cache;
}

export interface PlanPayload {
  name: string;
  category: PlanCategory;
  level: PlanLevel;
  owner: string;
  summary: string;
}

export function fetchPlans(): Promise<EmergencyPlan[]> {
  return Promise.resolve([...list()]);
}

export function fetchPlanPage(page = 1, size = 10): Promise<PageResult<EmergencyPlan>> {
  const items = list();
  const start = (page - 1) * size;
  return Promise.resolve({
    list: items.slice(start, start + size),
    total: items.length,
    page,
    size,
  });
}

export function createPlan(p: PlanPayload): EmergencyPlan {
  const item: EmergencyPlan = {
    id: `PLAN-${String(Date.now()).slice(-6)}`,
    name: p.name,
    category: p.category,
    level: p.level,
    owner: p.owner,
    summary: p.summary,
    updatedAt: new Date().toISOString(),
  };
  cache = [item, ...list()];
  save(cache);
  return item;
}

export function updatePlan(p: EmergencyPlan): EmergencyPlan | null {
  const items = list();
  const idx = items.findIndex((e) => e.id === p.id);
  if (idx < 0) return null;
  const next: EmergencyPlan = { ...items[idx], ...p, updatedAt: new Date().toISOString() };
  items[idx] = next;
  cache = items;
  save(cache);
  return next;
}

export function deletePlan(id: string): boolean {
  const items = list();
  const next = items.filter((e) => e.id !== id);
  if (next.length === items.length) return false;
  cache = next;
  save(cache);
  return true;
}
