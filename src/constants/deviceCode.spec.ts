import { describe, it, expect } from 'vitest'
import { parseDeviceCode, DEVICE_CODE_LENGTH } from '@/constants/deviceCode'

describe('parseDeviceCode', () => {
  it('常量长度为 20', () => {
    expect(DEVICE_CODE_LENGTH).toBe(20)
  })
  it('接受 20 位纯数字编码', () => {
    const r = parseDeviceCode('12345678901234567890')
    expect(r.isValid).toBe(true)
    expect(r.raw).toBe('12345678901234567890')
  })
  it('拒绝长度非 20', () => {
    expect(parseDeviceCode('12345').isValid).toBe(false)
  })
  it('拒绝含非数字字符', () => {
    expect(parseDeviceCode('1234567890123456789a').isValid).toBe(false)
  })
  it('分段拼接等于原编码', () => {
    const r = parseDeviceCode('12345678901234567890')
    expect(`${r.category}${r.region}${r.sequence}`).toBe(r.raw)
  })
})
