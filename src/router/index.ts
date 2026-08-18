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
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/error/NotFound.vue') },
]

const router = createRouter({ history: createWebHistory(), routes })
export default router
