import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RealtimeClient, type RealtimeClientOptions } from '@/services/ws'

// 可注入的 WebSocket 假实现，用于模拟 open/close/message 事件（node 环境无全局 WebSocket）
class FakeSocket {
  static instances: FakeSocket[] = []

  static reset(): void {
    FakeSocket.instances = []
  }

  readyState = 0
  sent: string[] = []
  onopen: (() => void) | null = null
  onclose: ((ev: { code?: number; wasClean?: boolean }) => void) | null = null
  onerror: ((ev: unknown) => void) | null = null
  onmessage: ((ev: { data: unknown }) => void) | null = null

  constructor(public url: string) {
    FakeSocket.instances.push(this)
  }

  send(data: string): void {
    this.sent.push(data)
  }

  close(): void {
    this.readyState = 3
  }

  open(): void {
    this.readyState = 1
    this.onopen?.()
  }

  fail(): void {
    this.readyState = 3
    this.onclose?.({ code: 1006, wasClean: false })
  }
}

function createClient(overrides: Partial<RealtimeClientOptions> = {}) {
  return new RealtimeClient({
    url: 'ws://test.local',
    createSocket: () => new FakeSocket('ws://test.local'),
    ...overrides,
  })
}

describe('realtime-channel 能力', () => {
  beforeEach(() => {
    FakeSocket.reset()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('断线指数退避重连', () => {
    it('异常断开后按 1s·2^n 退避自动重连', () => {
      const client = createClient()
      client.connect()
      const s1 = FakeSocket.instances[0]!
      s1.open()
      expect(FakeSocket.instances).toHaveLength(1)

      s1.fail()
      vi.advanceTimersByTime(999)
      expect(FakeSocket.instances).toHaveLength(1)
      vi.advanceTimersByTime(1)
      expect(FakeSocket.instances).toHaveLength(2)
      FakeSocket.instances[1]!.open()

      FakeSocket.instances[1]!.fail()
      vi.advanceTimersByTime(2000)
      expect(FakeSocket.instances).toHaveLength(3)
    })

    it('重连成功后重置退避计数为初始值', () => {
      const client = createClient()
      client.connect()
      const s1 = FakeSocket.instances[0]!
      s1.open()

      s1.fail()
      vi.advanceTimersByTime(1000)
      expect(FakeSocket.instances).toHaveLength(2)
      FakeSocket.instances[1]!.open()

      FakeSocket.instances[1]!.fail()
      vi.advanceTimersByTime(1000)
      expect(FakeSocket.instances).toHaveLength(3)
    })

    it('退避上限 30s，不再继续增长', () => {
      const client = createClient({ maxBackoffMs: 30000 })
      client.connect()
      let socket = FakeSocket.instances[0]!

      // 持续连接失败（不 open），退避序列为 1/2/4/8/16/30s
      for (let i = 0; i < 6; i++) {
        socket.fail()
        const expected = Math.min(1000 * 2 ** i, 30000)
        vi.advanceTimersByTime(expected - 1)
        expect(FakeSocket.instances).toHaveLength(i + 1)
        vi.advanceTimersByTime(1)
        socket = FakeSocket.instances[i + 1]!
      }

      // 第 7 次断开仍按 30s 上限退避
      socket.fail()
      vi.advanceTimersByTime(30000)
      expect(FakeSocket.instances).toHaveLength(8)
    })

    it('主动 close 后不重连', () => {
      const client = createClient()
      client.connect()
      const s1 = FakeSocket.instances[0]!
      s1.open()
      client.close()
      s1.close()
      vi.advanceTimersByTime(60000)
      expect(FakeSocket.instances).toHaveLength(1)
    })
  })

  describe('心跳保活', () => {
    it('连接建立后按默认间隔发送 ping，断开后停止', () => {
      const client = createClient({ heartbeatIntervalMs: 15000 })
      client.connect()
      const s = FakeSocket.instances[0]!
      s.open()

      vi.advanceTimersByTime(14999)
      expect(s.sent).toHaveLength(0)
      vi.advanceTimersByTime(1)
      expect(s.sent).toHaveLength(1)
      expect(JSON.parse(s.sent[0]!).type).toBe('ping')

      s.fail()
      const sentBefore = s.sent.length
      vi.advanceTimersByTime(120000)
      expect(s.sent).toHaveLength(sentBefore)
    })

    it('连接建立前不发心跳', () => {
      const client = createClient({ heartbeatIntervalMs: 15000 })
      client.connect()
      const s = FakeSocket.instances[0]!
      vi.advanceTimersByTime(60000)
      expect(s.sent).toHaveLength(0)
    })
  })

  describe('消息订阅与解析', () => {
    it('收到合法 {topic,payload} JSON 触发 onMessage', () => {
      const onMessage = vi.fn()
      const client = createClient({ onMessage })
      client.connect()
      const s = FakeSocket.instances[0]!
      s.open()
      s.onmessage?.({ data: '{"topic":"alarm","payload":{"id":1}}' })
      expect(onMessage).toHaveBeenCalledWith({ topic: 'alarm', payload: { id: 1 } })
    })

    it('非法 JSON 仅告警不抛异常', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      const onMessage = vi.fn()
      const client = createClient({ onMessage })
      client.connect()
      const s = FakeSocket.instances[0]!
      s.open()
      expect(() => s.onmessage?.({ data: 'not-json' })).not.toThrow()
      expect(onMessage).not.toHaveBeenCalled()
      expect(warnSpy).toHaveBeenCalled()
      warnSpy.mockRestore()
    })
  })

  describe('零下行控制红线', () => {
    it('客户端仅暴露 connect/close，不含任何硬控写接口', () => {
      const client = createClient()
      const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(client)).filter(
        (n) => n !== 'constructor' && !n.startsWith('_'),
      )
      expect(proto.sort()).toEqual(['close', 'connect'])
    })
  })
})
