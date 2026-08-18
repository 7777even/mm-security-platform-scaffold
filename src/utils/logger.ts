// 统一日志出口（S1 §5.3）：分级、可关闭、不打印敏感信息；生产禁 console 残留。
type LogLevel = 'debug' | 'info' | 'warn' | 'error'
const isProd = import.meta.env.MODE === 'production'

function emit(level: LogLevel, ...args: unknown[]): void {
  if (isProd && level === 'debug') return
  const ts = new Date().toISOString()
  console[level](`[${ts}]`, ...args)
}

export const logger = {
  debug: (...args: unknown[]): void => emit('debug', ...args),
  info: (...args: unknown[]): void => emit('info', ...args),
  warn: (...args: unknown[]): void => emit('warn', ...args),
  error: (...args: unknown[]): void => emit('error', ...args),
}
