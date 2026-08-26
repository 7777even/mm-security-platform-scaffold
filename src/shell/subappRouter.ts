import { createRouter, createWebHistory } from 'vue-router';
import type { Router, RouteLocationRaw } from 'vue-router';
import { emitWujieEvent } from '@/shell/wujieBridge';

// wujie 子应用运行于独立沙箱，无独立路由树；其页面内 router.push 统一委托主壳路由
// （二级页由主壳 SECONDARY_ROUTES 承载），经 wujie 总线 emit('route-navigate') 请求主壳导航。
// 主壳在 src/main.ts 经 WujieVue.bus.$on('route-navigate') 监听并执行 router.push。
const SubappFallback = { render: () => null };
export function createSubappRouter(): Router {
  // 兜底路由：子应用沙箱内初始 URL 为 /subapps/<name>/ 等挂载路径，但子应用无独立路由树。
  // vue-router 内部初始导航走「原始」push（不走下方被覆写的 push），若无任何可匹配路由会告警
  // "No match found for location with path /subapps/dashboard/"。加一条 catch-all 让初始导航静默命中，
  // 消除控制台告警；真实跨应用跳转仍由下方 route-navigate 委托主壳。
  const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: '/:pathMatch(.*)*', name: 'subapp-fallback', component: SubappFallback }],
  });
  const rawPush = router.push.bind(router);
  router.push = ((to: RouteLocationRaw) => {
    const path = typeof to === 'string' ? to : to.path;
    if (path) {
      emitWujieEvent('route-navigate', { path });
      return Promise.resolve();
    }
    return rawPush(to);
  }) as typeof router.push;
  return router;
}
