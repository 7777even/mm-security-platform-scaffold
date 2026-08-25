// 共享基座单一真源（wujie-shell spec）。主壳与子应用共同 import，避免重复实现/重复 bundle 基元。
// 设计 token 由 styles/tokens.css 单一入口注入全局 CSS 变量，此处不重复导出。

export * from '@/stores/auth';
export * from '@/composables/usePermission';
export { vPermission } from '@/directives/permission';
export * from '@/services/realtime';
export * from '@/services/http';
export { default as http } from '@/services/http';
export * from '@/services/token';
export * from '@/services/audit';
export * from '@/utils/logger';
export * from '@/utils/perf';
export * from '@/shell/wujieBridge';
