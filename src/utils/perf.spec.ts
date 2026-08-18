// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isPerfEnabled, mark, markOnce, measure } from '@/utils/perf'

// 浏览器 performance / window 打桩，使启用开关与计时可断言
const markCalls: string[] = []
const marks = new Map<string, number>()
let clock = 0
const perfStub = {
  now: () => clock,
  mark: (name: string) => {
    markCalls.push(name)
    marks.set(name, clock++)
  },
  getEntriesByName: (name: string) => {
    const t = marks.get(name)
    return t === undefined ? [] : [{ startTime: t }]
  },
}

beforeEach(() => {
  markCalls.length = 0
  marks.clear()
  clock = 0
  vi.stubGlobal('performance', perfStub)
  vi.stubGlobal('window', { location: { search: '' } })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('perf：启用开关', () => {
  it('开发态默认启用', () => {
    expect(isPerfEnabled()).toBe(true)
  })

  it('?perf=0 强制关闭', () => {
    vi.stubGlobal('window', { location: { search: '?perf=0' } })
    expect(isPerfEnabled()).toBe(false)
  })

  it('?perf=1 显式启用', () => {
    vi.stubGlobal('window', { location: { search: '?perf=1' } })
    expect(isPerfEnabled()).toBe(true)
  })
})

describe('perf：mark', () => {
  it('启用时写入 performance 标记', () => {
    mark('app:start')
    expect(markCalls).toContain('app:start')
    expect(marks.get('app:start')).toBe(0)
  })

  it('关闭时不写入', () => {
    vi.stubGlobal('window', { location: { search: '?perf=0' } })
    mark('app:start')
    expect(markCalls).not.toContain('app:start')
  })
})

describe('perf：measure', () => {
  it('返回两标记间耗时差', () => {
    mark('app:start')
    mark('app:ready')
    expect(measure('render', 'app:start', 'app:ready')).toBe(1)
  })

  it('toMark 缺省时取当前时刻', () => {
    mark('app:start')
    clock = 10
    expect(measure('render', 'app:start')).toBe(10)
  })

  it('起点标记缺失返回 null', () => {
    expect(measure('render', 'missing')).toBeNull()
  })

  it('关闭时不计算', () => {
    vi.stubGlobal('window', { location: { search: '?perf=0' } })
    mark('app:start')
    expect(measure('render', 'app:start')).toBeNull()
  })
})

describe('perf：markOnce', () => {
  it('同名单次打点，重复调用不覆盖首次记录', () => {
    markOnce('once-x')
    markOnce('once-x')
    expect(markCalls.filter((n) => n === 'once-x')).toHaveLength(1)
  })

  it('不同名各自打点', () => {
    markOnce('once-a')
    markOnce('once-b')
    expect(markCalls).toEqual(['once-a', 'once-b'])
  })
})
