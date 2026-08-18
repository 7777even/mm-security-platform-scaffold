/**
 * WebGL 能力检测（S1 §9.3）：3D 渲染前调用；不支持时上层应降级 2D。
 * 返回 false 覆盖三种失败态：getContext 返回 null / 抛异常 / 无 createElement。
 */
export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    return gl !== null
  } catch {
    return false
  }
}
