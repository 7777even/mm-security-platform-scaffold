import { describe, it, expect } from 'vitest'
import { unwrapBody } from '@/services/http'
import type { ApiResponse } from '@/types'

describe('unwrapBody 响应包络解包', () => {
  it('code=0 时返回 data', () => {
    const body: ApiResponse<{ id: number }> = { code: 0, message: 'ok', data: { id: 1 } }
    expect(unwrapBody(body)).toEqual({ id: 1 })
  })

  it('code!=0 时抛错并携带 message', () => {
    const body: ApiResponse<null> = { code: 404, message: '报警不存在', data: null }
    expect(() => unwrapBody(body)).toThrow('报警不存在')
  })

  it('data 为数组/分页结构时原样透传', () => {
    const body: ApiResponse<{ list: number[]; total: number; page: number; size: number }> = {
      code: 0,
      message: 'ok',
      data: { list: [1, 2], total: 2, page: 1, size: 5 },
    }
    expect(unwrapBody(body)).toEqual({ list: [1, 2], total: 2, page: 1, size: 5 })
  })
})
