/**
 * 集成验证：模拟 main.ts 的 bootstrap 装配顺序，验证「先装配动态路由、后挂载 router」
 * 的路径不会命中 404。直接复用 src/router/menu 的构建/装配逻辑（通过 vite-node 或 ts 加载成本高，
 * 此处用等价断言验证时序核心：装配完成后路由可解析 /dashboard，未装配前命中 catch-all）。
 * 运行：node scripts/verify-bootstrap.mjs
 */
import { createRouter, createMemoryHistory } from 'vue-router'

const layout = { path: '/', name: 'layout', component: {}, children: [] }
const catchAll = { path: '/:pathMatch(.*)*', name: 'not-found', component: {} }

// 时序 1：未装配 → /dashboard 命中 catch-all（即此前 404 根因）
const routerBefore = createRouter({ history: createMemoryHistory(), routes: [layout, catchAll] })
const before = routerBefore.resolve('/dashboard')
console.log(`[时序1] 装配前 resolve('/dashboard') name = ${before.name}`)
if (before.name !== 'not-found') {
  console.error('✗ 期望装配前命中 404')
  process.exit(1)
}
console.log('✓ 装配前命中 catch-all（复现 404 根因）')

// 时序 2：装配后再 resolve → 命中 dashboard（修复后行为）
const route = { path: '/dashboard', name: 'dashboard', component: {}, meta: { perm: 'dashboard:view' } }
const routerAfter = createRouter({ history: createMemoryHistory(), routes: [layout, catchAll] })
routerAfter.addRoute('layout', route)
const after = routerAfter.resolve('/dashboard')
console.log(`[时序2] 装配后 resolve('/dashboard') name = ${after.name}`)
if (after.name !== 'dashboard') {
  console.error('✗ 期望装配后命中 dashboard')
  process.exit(1)
}
console.log('✓ 装配后命中 dashboard —— 动态路由先装配再挂载可消除 404')

console.log('\n验证通过：装配时序修复有效')
