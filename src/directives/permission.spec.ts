// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { createApp, h, withDirectives, defineComponent, nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { vPermission } from '@/directives/permission'
import { useAuthStore } from '@/stores/auth'

/** 挂载一个带 v-permission 的元素，返回挂载根节点 */
function mountProtected(perm: string | string[]): HTMLDivElement {
  const Comp = defineComponent({
    setup() {
      return () =>
        withDirectives(h('div', { id: 'protected', class: 'target' }, 'protected'), [[vPermission, perm]])
    },
  })
  const root = document.createElement('div')
  document.body.appendChild(root)
  createApp(Comp).mount(root)
  return root
}

describe('v-permission 按钮级权限指令', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = ''
  })

  it('具备权限时元素保留', () => {
    const root = mountProtected('system:user:view')
    expect(root.querySelector('.target')).not.toBeNull()
  })

  it('无权限时元素从 DOM 移除', () => {
    useAuthStore().setRole('operator-inner')
    const root = mountProtected('system:user:view')
    expect(root.querySelector('.target')).toBeNull()
  })

  it('数组绑定为 hasAny 语义：任一命中即保留', () => {
    useAuthStore().setRole('dispatcher')
    const root = mountProtected(['fire-alarm:ack', 'system:user:view'])
    expect(root.querySelector('.target')).not.toBeNull()
  })

  it('数组绑定全部未命中则移除', () => {
    useAuthStore().setRole('operator-inner')
    const root = mountProtected(['fire-alarm:ack', 'system:user:view'])
    expect(root.querySelector('.target')).toBeNull()
  })

  it('切换角色后实时移除，无需重新挂载', async () => {
    const root = mountProtected('system:user:view')
    expect(root.querySelector('.target')).not.toBeNull()
    useAuthStore().setRole('operator-inner')
    await nextTick()
    expect(root.querySelector('.target')).toBeNull()
  })

  it('权限恢复后元素重新挂载', async () => {
    const auth = useAuthStore()
    auth.setRole('operator-inner')
    const root = mountProtected('system:user:view')
    expect(root.querySelector('.target')).toBeNull()
    auth.setRole('commander')
    await nextTick()
    expect(root.querySelector('.target')).not.toBeNull()
  })
})
