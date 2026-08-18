// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, onErrorCaptured } from 'vue'
import AppErrorBoundary from '@/components/AppErrorBoundary.vue'

// 渲染时抛错的子组件（模拟渲染异常，S1 §5.3：禁止未捕获异常导致整页白屏）
const Boom = defineComponent({
  props: { shouldThrow: { type: Boolean, default: false } },
  setup(props) {
    if (props.shouldThrow) throw new Error('render boom')
    return () => h('div', 'normal content')
  },
})

describe('AppErrorBoundary：视图级错误边界', () => {
  it('子组件渲染正常时透传内容', () => {
    const wrapper = mount(AppErrorBoundary, {
      slots: { default: () => h(Boom, { shouldThrow: false }) },
    })
    expect(wrapper.text()).toContain('normal content')
    expect(wrapper.find('[data-test="error-fallback"]').exists()).toBe(false)
  })

  it('子组件渲染异常时显示降级 UI，不白屏', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = mount(AppErrorBoundary, {
      slots: { default: () => h(Boom, { shouldThrow: true }) },
    })
    spy.mockRestore()
    await nextTick()
    expect(wrapper.find('[data-test="error-fallback"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('页面渲染异常')
  })

  it('错误被边界捕获后不冒泡为父级未捕获（阻止传播）', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    let caught: unknown = null
    const TestWrapper = defineComponent({
      setup() {
        onErrorCaptured((err) => {
          caught = err
        })
        return () => h(AppErrorBoundary, () => h(Boom, { shouldThrow: true }))
      },
    })
    mount(TestWrapper)
    spy.mockRestore()
    await nextTick()
    // 边界返回 false 阻止传播：父级 onErrorCaptured 不应收到错误（避免全局未捕获）
    expect(caught).toBeNull()
  })
})
