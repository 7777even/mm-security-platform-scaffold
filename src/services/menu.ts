import { request } from '@/services/http'
import type { MenuItem } from '@/router/menu'

// B3 AUTH-05 菜单树：按角色返回前端路由/菜单；T7 后端契约到位后仅改 http 层 adapter
export function fetchMenus(): Promise<MenuItem[]> {
  return request<MenuItem[]>({ url: '/auth/menus', method: 'GET' })
}
