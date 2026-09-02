import { computed, type ComputedRef } from 'vue';
import type { WujieRouteQuery } from '@/shell/wujieBridge';

/**
 * fire-monitoring 迁移（task-12 #3）：子应用运行在 wujie 沙箱内，沙箱 vue-router
 * 仅余 catch-all（name=subapp-fallback），useRoute() 无法定位到主壳当前页面。
 * 主壳 WujieHost 在 sharedProps 透传当前路由的 name/path/query/params，
 * 本 composable 集中暴露这些字段，并把 shell 的 fm-* 路由名翻译为源项目语义名。
 *
 * 行为：每个 computed 仅在首次访问时求值并缓存（无响应式源可追踪）。
 * 这与 wujie 1.0.29 语义一致——props 仅在 startApp 时整体注入、alive 同 name+url 不再
 * 推送——配合 WujieHost 的 :key=fullPath 实例重建策略（见 WujieHost.vue 注释），
 * 同一子应用实例内 props 始终稳定；跨路由切换以实例重 mount 携带新 props 完成刷新。
 *
 * 安全性：window.$wujie 缺失时（子应用在 vite 独立启动开发场景或单测 mock）所有字段安全降级。
 */

interface WujiePropsSnapshot {
  routeName?: string;
  routePath?: string;
  query?: WujieRouteQuery;
  routeParams?: Record<string, string>;
}

function readWujieProps(): WujiePropsSnapshot {
  const raw = window.$wujie?.props as WujiePropsSnapshot | undefined;
  return raw ?? {};
}

/** shell fm-* 路由名 → 源项目 src/screen 视图语义名（与 cesiumMapModes ROUTE_NAME_ALIAS 等价） */
const SHELL_TO_SOURCE: Record<string, string> = {
  'fm-drill': 'drillEmergencyDetail',
  'fm-typhoon': 'typhoonEmergencyDetail',
  'fm-fire-rescue': 'fireAccidentRescue',
  'fm-production-area': 'productionArea',
  'fm-major-hazard-list': 'majorHazardList',
  'fm-major-hazard-detail': 'majorHazardDetail',
  'fm-communication': 'productionCommunication',
  'fm-video-control': 'tv',
  'fm-video-wall': 'tvVideoWall',
  // 顶栏一级菜单（与 menu.ts 的 fm-* id 对齐）
  'fm-emergency': 'emergency',
  'fm-fire': 'fire',
  'fm-security': 'security',
  'fm-tv': 'tv',
  'fm-production': 'production',
};

function resolveSourceName(shellName: string | undefined): string {
  if (!shellName) return 'subapp-fallback';
  if (SHELL_TO_SOURCE[shellName]) return SHELL_TO_SOURCE[shellName];
  // 非 fm-* 名称：可能是源项目自身独立启动的语义名（开发态 standalone），原样返回
  if (!shellName.startsWith('fm-')) return shellName;
  // fm- 开头但未在表内：best-effort 去除前缀
  return shellName.replace(/^fm-/, '');
}

export interface ShellRoute {
  /** 源项目语义名（drillEmergencyDetail / fireAccidentRescue / production / tvVideoWall …） */
  name: ComputedRef<string>;
  /** 主壳当前路由 path */
  path: ComputedRef<string>;
  /** 主壳当前 query（替代子应用沙箱 route.query 总为空的不足） */
  query: ComputedRef<WujieRouteQuery>;
  /** 主壳当前 params（facilityId / hazardId …） */
  params: ComputedRef<Record<string, string>>;
  /** 主壳原始路由名（fm-*），供需要区分主壳与子应用形态的逻辑使用 */
  shellName: ComputedRef<string | undefined>;
}

export function useShellRoute(): ShellRoute {
  // props 是 wujie 写入 window 的快照对象（每次 startApp 整体替换）。把它包成 computed
  // 并基于引用比较触发更新；wujie 1.0.29 在 alive=true 同 name+url 时不会重推 props，
  // 视图层依赖 WujieHost 的 :key 触发实例重建 + 新 props 注入（见 WujieHost.vue）。
  const props = computed<WujiePropsSnapshot>(readWujieProps);
  const shellName = computed(() => props.value.routeName);
  const name = computed(() => resolveSourceName(shellName.value));
  const path = computed(() => props.value.routePath ?? '');
  const query = computed<WujieRouteQuery>(() => props.value.query ?? {});
  const params = computed<Record<string, string>>(() => props.value.routeParams ?? {});
  return { name, path, query, params, shellName };
}
