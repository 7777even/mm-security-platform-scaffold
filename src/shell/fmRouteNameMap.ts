import type { RouteLocationRaw } from 'vue-router';

// fire-monitoring 迁移：子应用内 {name} 路由跳转 → 主壳路径 翻译表（wujie-shell spec）。
// src/screen 源项目在独立 SPA 内以「源路由名」（fireAccidentRescue / drillEmergencyDetail…）跳转；
// 迁移后子应用无独立路由树，这些 name-push 由 createSubappRouter 委托主壳。主壳的镜像路由
// 注册于 src/router/index.ts（fm-* 二级页）与菜单装配（fm-* 一级页），路径与源项目保持一致。
// 因此需要将「源路由名」翻译为主壳 path；params 序列化进 path，query 原样保留并转发。
export const FM_SOURCE_ROUTE_TO_SHELL_PATH: Record<string, string> = {
  // 一级页（fm-* 子应用菜单，路径即源项目一级菜单路径）
  emergency: '/emergency',
  fire: '/fire',
  security: '/security',
  tv: '/tv',
  production: '/production',
  // 二级页：镜像源项目路由（src/router/index.ts SECONDARY_ROUTES fm-* 段）
  fireAccidentRescue: '/fire/rescue',
  drillEmergencyDetail: '/emergency/drill',
  typhoonEmergencyDetail: '/emergency/typhoon',
  productionArea: '/production/area/:facilityId',
  productionCommunication: '/production/communication',
  majorHazardList: '/production/hazards',
  majorHazardDetail: '/production/hazards/:hazardId',
  tvVideoControl: '/tv/video-control',
  tvVideoWall: '/tv/video-wall',
};

export interface DelegatedLocation {
  path: string;
  query?: Record<string, string | null | Array<string | null>>;
}

/** 将模板化 path 中的 :param 占位替换为实际参数（如 facilityId/hazardId） */
export function serializeParamPath(template: string, params: Record<string, unknown>): string {
  return template.replace(/:([A-Za-z0-9_]+)/g, (match, key: string) => {
    const value = params[key];
    return value === undefined || value === null ? match : String(value);
  });
}

function toQueryRecord(
  query: unknown,
): Record<string, string | null | Array<string | null>> | undefined {
  if (!query || typeof query !== 'object') return undefined;
  const record = query as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length === 0) return undefined;
  const out: Record<string, string | null | Array<string | null>> = {};
  for (const key of keys) {
    const value = record[key];
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      out[key] = value.map((v) => (v === null || v === undefined ? null : String(v)));
    } else {
      out[key] = value === null ? null : String(value);
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * 将子应用内 router.push/replace 的目标解析为「委托主壳」的位置。
 * 返回 null 表示该目标无法委托（既无 path 也无已登记的路由名），由调用方回退本地路由。
 * - string / { path }：直接委托（query 透传）
 * - { name, params?, query? }：经 FM_SOURCE_ROUTE_TO_SHELL_PATH 翻译为 path
 */
export function resolveDelegatedLocation(to: RouteLocationRaw): DelegatedLocation | null {
  if (typeof to === 'string') return { path: to };
  if (!to || typeof to !== 'object') return null;
  if ('path' in to && typeof to.path === 'string' && to.path) {
    return { path: to.path, query: toQueryRecord((to as { query?: unknown }).query) };
  }
  const name = (to as { name?: unknown }).name;
  if (typeof name !== 'string' && typeof name !== 'symbol') return null;
  const nameStr = String(name);
  const template = FM_SOURCE_ROUTE_TO_SHELL_PATH[nameStr];
  if (!template) return null;
  const params = ((to as { params?: unknown }).params ?? {}) as Record<string, unknown>;
  const query = toQueryRecord((to as { query?: unknown }).query);
  return { path: serializeParamPath(template, params), query };
}
