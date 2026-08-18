// 中石化统一集采 20 位 MDM 主数据设备编码解析（详细设计 §3.3 / 协议 §1.2.3.9）
export const DEVICE_CODE_LENGTH = 20

export interface DeviceCodeParts {
  raw: string
  isValid: boolean
  category?: string
  region?: string
  sequence?: string
}

export function parseDeviceCode(raw: string): DeviceCodeParts {
  const code = raw.trim()
  if (code.length !== DEVICE_CODE_LENGTH || !/^\d{20}$/.test(code)) {
    return { raw: code, isValid: false }
  }
  return {
    raw: code,
    isValid: true,
    category: code.slice(0, 4),
    region: code.slice(4, 10),
    sequence: code.slice(10, 20),
  }
}
