import { createRouter, createWebHistory } from 'vue-router';
import type { Router, RouteLocationRaw } from 'vue-router';
import { emitWujieEvent, type WujieEventMap } from '@/shell/wujieBridge';
import { resolveDelegatedLocation } from '@/shell/fmRouteNameMap';

// wujie 子应用运行于独立沙箱，无独立路由树；其页面内 router.push / router.replace
// 统一委托主壳路由（二级页由主壳 SECONDARY_ROUTES 承载），经 wujie 总线
// emit('route-navigate') 请求主壳导航。主壳在 src/main.ts 经 WujieVue.bus.$on('route-navigate')
// 监听并执行 router.push（replace 负载则执行 router.replace，不留历史）。
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
  const rawReplace = router.replace.bind(router);
  // push/replace 共用委托：viaReplace=true 时把主壳导航降级为 router.replace
  // （不留历史记录），供一次性 UI 意图参数（如 ?create=event）消费后的 URL 清理。
  const delegate = (to: RouteLocationRaw, viaReplace: boolean): boolean => {
    const location = resolveDelegatedLocation(to);
    if (!location) return false;
    const payload: WujieEventMap['route-navigate'] = { path: location.path };
    if (location.query) payload.query = location.query;
    if (viaReplace) payload.replace = true;
    emitWujieEvent('route-navigate', payload);
    return true;
  };
  // 注意：pathless 的 { query } 目标（resolveDelegatedLocation 返回 null）不会命中委托，
  // 会走本地 rawReplace——对沙箱 URL 而言是无操作。跨页清理 shell query 必须携带
  // 主壳当前 path（经 useShellRoute().path 取得），见 EmergencyEventListPanel 用法。
  const wrap =
    (raw: typeof router.push, viaReplace: boolean) =>
    (to: RouteLocationRaw): ReturnType<typeof raw> => {
      if (delegate(to, viaReplace)) return Promise.resolve();
      // 兜底走子应用本地 vue-router：未注册的 name 会触发 MATCHER_NOT_FOUND，
      // vue-router 4 在 dev 模式下会同步抛出错误；为统一调用方错误处理，
      // 同步抛错也包装为拒绝态 Promise，避免某些 await 链绕过错过的隐患。
      try {
        return raw(to);
      } catch (err) {
        return Promise.reject(err);
      }
    };
  router.push = wrap(rawPush, false);
  router.replace = wrap(rawReplace, true);
  return router;
}
