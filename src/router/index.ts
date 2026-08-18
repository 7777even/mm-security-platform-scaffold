import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 静态仅保留布局壳与 404；页面路由由 /auth/menus 动态装配（B3 AUTH-05）
// mock 菜单不可达时降级装配 DEFAULT_MENUS（menu.ts），保证不白屏
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'layout',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/dashboard',
    children: [],
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/error/NotFound.vue') },
]

const router = createRouter({ history: createWebHistory(), routes })

// 全局权限守卫：未授权路由直接访问亦被拦截（rbac-permission spec §动态路由与菜单权限）
router.beforeEach(async (to) => {
  const perm = to.meta.perm as string | undefined
  if (perm) {
    const { useAuthStore } = await import('@/stores/auth')
    const auth = useAuthStore()
    if (!auth.hasPerm(perm)) return { name: 'not-found' }
  }
  return true
})

export default router
