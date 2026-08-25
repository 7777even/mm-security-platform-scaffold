import { createRouter, createWebHistory } from 'vue-router';
import type { Router, RouteLocationRaw } from 'vue-router';
import { emitWujieEvent } from '@/shell/wujieBridge';

// wujie 子应用运行于独立沙箱，无独立路由树；其页面内 router.push 统一委托主壳路由
// （二级页由主壳 SECONDARY_ROUTES 承载），经 wujie 总线 emit('route-navigate') 请求主壳导航。
// 主壳在 src/main.ts 经 WujieVue.bus.$on('route-navigate') 监听并执行 router.push。
export function createSubappRouter(): Router {
  const router = createRouter({ history: createWebHistory(), routes: [] });
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
