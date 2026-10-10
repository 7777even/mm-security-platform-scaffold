// 独立类型声明（PoC 阶段，uni 类型尚未安装时保证 tsc 可过）。
// 安装 @dcloudio/uni-app 等依赖后，可删除本文件中的 `declare const uni: any;` 一行，
// 改用官方 @dcloudio/types 提供的全局 uni 命名空间。

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_ALARM_WS_URL?: string;
  readonly VITE_DEV_USERNAME?: string;
  readonly VITE_DEV_PASSWORD?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const uni: any;

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
