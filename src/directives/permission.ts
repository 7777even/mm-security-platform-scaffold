import type { Directive } from 'vue'
import { usePermission } from '@/composables/usePermission'
import { useAuthStore } from '@/stores/auth'

// 按钮级权限指令（rbac-permission spec §按钮级权限指令）
// 用法：v-permission="'fire-alarm:ack'"（单权限码）或 v-permission="['a','b']"（hasAny 任一命中）
// 无权限时元素从 DOM 移除；订阅角色变化，切换角色后实时刷新（不依赖重新挂载/刷新页面）
//
// 实现：元素被移除时用 Comment 占位锚点，权限恢复时在锚点原位重新插入。

const anchorMap = new WeakMap<HTMLElement, Comment | null>()
const stopMap = new WeakMap<HTMLElement, () => void>()

function apply(el: HTMLElement, value: string | string[]): void {
  const { hasPerm, hasAny } = usePermission()
  const allowed = Array.isArray(value) ? hasAny(value) : hasPerm(value)
  const anchor = anchorMap.get(el) ?? null
  if (allowed) {
    if (anchor && anchor.parentNode) {
      anchor.replaceWith(el)
      anchorMap.set(el, null)
    }
  } else if (!anchor) {
    const placeholder = document.createComment(' v-permission ')
    el.replaceWith(placeholder)
    anchorMap.set(el, placeholder)
  }
}

export const vPermission: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const auth = useAuthStore()
    // 订阅角色权限变化，实时刷新（$subscribe 不依赖组件上下文）
    const stop = auth.$subscribe(() => apply(el, binding.value))
    stopMap.set(el, stop)
    anchorMap.set(el, null)
    apply(el, binding.value)
  },
  updated(el, binding) {
    // 权限码绑定值变化时重新评估
    apply(el, binding.value)
  },
  unmounted(el) {
    stopMap.get(el)?.()
    stopMap.delete(el)
  },
}
