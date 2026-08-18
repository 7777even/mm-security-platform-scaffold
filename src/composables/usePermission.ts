import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function usePermission() {
  const auth = useAuthStore()

  function hasPerm(perm: string): boolean {
    return auth.hasPerm(perm)
  }

  function hasAny(perms: string[]): boolean {
    return auth.hasAny(perms)
  }

  function filterRoutesByPerm(routes: readonly RouteRecordRaw[]): RouteRecordRaw[] {
    const result: RouteRecordRaw[] = []
    for (const r of routes) {
      const perm = r.meta?.perm as string | undefined
      if (perm && !auth.hasPerm(perm)) continue
      if (r.children && r.children.length > 0) {
        result.push({ ...r, children: filterRoutesByPerm(r.children) })
      } else {
        result.push(r)
      }
    }
    return result
  }

  return { hasPerm, hasAny, filterRoutesByPerm }
}
