import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'dashboard', component: () => import('@/views/dashboard/index.vue'), meta: { title: '综合态势', perm: 'dashboard:view' } },
      { path: 'fire-alarm', name: 'fire-alarm', component: () => import('@/views/fire-alarm/index.vue'), meta: { title: '火灾报警', perm: 'fire-alarm:view' } },
      { path: 'industrial-video', name: 'industrial-video', component: () => import('@/views/industrial-video/index.vue'), meta: { title: '工业视频', perm: 'video:view' } },
      { path: 'system/users', name: 'system-users', component: () => import('@/views/system/users.vue'), meta: { title: '用户与权限', perm: 'system:user:view' } },
      { path: 'system/device-code', name: 'system-device-code', component: () => import('@/views/system/deviceCode.vue'), meta: { title: '设备编码', perm: 'system:device-code:view' } },
    ],
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
