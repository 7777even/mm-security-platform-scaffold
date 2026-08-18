// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { detectWebGL } from '@/utils/webgl'

describe('detectWebGL：WebGL 能力检测（S1 §9.3 降级判定）', () => {
  beforeEach(() => {
    vi.stubGlobal('document', { createElement: vi.fn() })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('getContext 返回 context 时视为支持', () => {
    const getContext = vi.fn(() => ({}))
    ;(document.createElement as ReturnType<typeof vi.fn>).mockReturnValue({ getContext })
    expect(detectWebGL()).toBe(true)
  })

  it('getContext 返回 null 时视为不支持', () => {
    const getContext = vi.fn(() => null)
    ;(document.createElement as ReturnType<typeof vi.fn>).mockReturnValue({ getContext })
    expect(detectWebGL()).toBe(false)
  })

  it('getContext 抛异常时视为不支持', () => {
    const getContext = vi.fn(() => {
      throw new Error('webgl unavailable')
    })
    ;(document.createElement as ReturnType<typeof vi.fn>).mockReturnValue({ getContext })
    expect(detectWebGL()).toBe(false)
  })
})
