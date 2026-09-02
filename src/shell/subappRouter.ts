import { createRouter, createWebHistory } from 'vue-router';
import type { Router, RouteLocationRaw } from 'vue-router';
import { emitWujieEvent } from '@/shell/wujieBridge';
import { resolveDelegatedLocation } from '@/shell/fmRouteNameMap';

// wujie 子应用运行于独立沙箱，无独立路由树；其页面内 router.push 统一委托主壳路由
// （二级页由主壳 SECONDARY_ROUTES 承载），经 wujie 总线 emit('route-navigate') 请求主壳导航。
// 主壳在 src/main.ts 经 WujieVue.bus.$on('route-navigate') 监听并执行 router.push。
// fire-monitoring 迁移补充：src/screen 内部以「源路由名」{ name, params?, query? } 跳转
// （如 fireAccidentRescue / drillEmergencyDetail / majorHazardDetail…，无 path），
// 这类目标经 fmRouteNameMap 翻译为主壳 path（params 序列化进路径、query 原样转发），
// 避免落入本地兜底路由触发 vue-router MATCHER_NOT_FOUND。
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
  const delegate = (to: RouteLocationRaw): boolean => {
    const location = resolveDelegatedLocation(to);
    if (!location) return false;
    emitWujieEvent(
      'route-navigate',
      location.query ? { path: location.path, query: location.query } : { path: location.path },
    );
    return true;
  };
  router.push = ((to: RouteLocationRaw) => {
    if (delegate(to)) return Promise.resolve();
    // 兜底走子应用本地 vue-router：未注册的 name 会触发 MATCHER_NOT_FOUND，
    // vue-router 4 在 dev 模式下会同步抛出错误；为统一调用方错误处理，
    // 同步抛错也包装为拒绝态 Promise，避免某些 await 链绕过错过的隐患。
    try {
      return rawPush(to);
    } catch (err) {
      return Promise.reject(err);
    }
  }) as typeof router.push;
  return router;
}
