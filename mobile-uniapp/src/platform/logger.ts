// 轻量日志（对齐现有 @/utils/logger 语义；P1 可替换为 uni 日志插件 / 上报）
type Level = 'debug' | 'info' | 'warn' | 'error';

const ENABLED: Record<Level, boolean> = {
  debug: true,
  info: true,
  warn: true,
  error: true,
};

function emit(level: Level, ...args: unknown[]): void {
  if (!ENABLED[level]) return;
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  fn(`[mobile-uni:${level}]`, ...args);
}

export const logger = {
  debug: (...a: unknown[]) => emit('debug', ...a),
  info: (...a: unknown[]) => emit('info', ...a),
  warn: (...a: unknown[]) => emit('warn', ...a),
  error: (...a: unknown[]) => emit('error', ...a),
};
