// uni 路由适配：替代原 vue-router 的 RouterLink / useRouter。
// tab 页（pages.json tabBar 中声明）用 switchTab，其余用 navigateTo（失败兜底提示「页面待移植」）。
// 原 apps/mobile 的短路由（/alarms、/events、/tasks …）在此统一映射为 uni 页面路径，
// 业务页仍可使用源工程熟悉的短路径，无需逐处改动。
const ROUTE_ALIAS: Record<string, string> = {
  '/home': '/pages/home/home',
  '/messages': '/pages/messages/messages',
  '/profile': '/pages/profile/profile',
  '/alarms': '/pages/alarms/alarms',
  '/tasks': '/pages/tasks/tasks',
  '/events': '/pages/events/events',
  '/messages/history': '/pages/messageHistory/messageHistory',
  // —— 迁移新增页面（P2 批次）——
  '/contacts': '/pages/contacts/contacts',
  '/duty': '/pages/duty/duty',
  '/plans': '/pages/plans/plans',
  '/drills': '/pages/drills/drills',
  '/resources': '/pages/resources/resources',
  '/event-resources': '/pages/event-resources/event-resources',
  '/library': '/pages/library/library',
  '/msds': '/pages/msds/msds',
  '/settings': '/pages/settings/settings',
  '/anomalies': '/pages/anomalies/anomalies',
  '/orders': '/pages/orders/orders',
  '/tickets': '/pages/tickets/tickets',
  '/patrols': '/pages/patrols/patrols',
  '/ops': '/pages/ops-board/ops-board',
  '/map': '/pages/map/map',
  '/path': '/pages/path-nav/path-nav',
  '/patrol-exec': '/pages/patrol-exec/patrol-exec',
  '/ticket-exec': '/pages/ticket-exec/ticket-exec',
  '/videos': '/pages/videos/videos',
};

// 带参短路由：/plans/123 → /pages/plan-detail/plan-detail?id=123
const ROUTE_PATTERNS: { re: RegExp; target: string }[] = [
  { re: /^\/plans\/([^/]+)$/, target: '/pages/plan-detail/plan-detail?id=$1' },
  { re: /^\/drills\/([^/]+)$/, target: '/pages/drill-detail/drill-detail?id=$1' },
  { re: /^\/msds\/([^/]+)$/, target: '/pages/msds-detail/msds-detail?cas=$1' },
  { re: /^\/orders\/([^/]+)$/, target: '/pages/order-detail/order-detail?id=$1' },
  { re: /^\/videos\/([^/]+)$/, target: '/pages/video-player/video-player?id=$1' },
];

const TAB_PAGES = ['/pages/home/home', '/pages/messages/messages', '/pages/profile/profile'];

export function go(path: string): void {
  const norm = path.startsWith('/') ? path : `/${path}`;
  let resolved = ROUTE_ALIAS[norm];
  if (!resolved) {
    for (const p of ROUTE_PATTERNS) {
      const m = norm.match(p.re);
      if (m) {
        resolved = p.target.replace('$1', m[1]);
        break;
      }
    }
  }
  resolved = resolved ?? norm;
  if (TAB_PAGES.includes(resolved)) {
    uni.switchTab({ url: resolved });
    return;
  }
  uni.navigateTo({
    url: resolved,
    fail: () => uni.showToast({ title: '页面待移植', icon: 'none' }),
  });
}

export function back(): void {
  uni.navigateBack({
    delta: 1,
    fail: () => uni.reLaunch({ url: '/pages/home/home' }),
  });
}
