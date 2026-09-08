/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAP_TILE_URL?: string;
  readonly VITE_TIANDITU_KEY?: string;
  readonly VITE_RAINVIEWER_KEY?: string;
  readonly VITE_CESIUM_RESOLUTION_SCALE?: string;
  readonly VITE_CESIUM_RENDER_TIER?: string;
  /** 防重放签名旁路开关（详设 V1.5 §3.3）：'true' 仅限开发联调挂起签名，生产必须为 false */
  readonly VITE_SECURITY_GATEWAY_BYPASS?: string;
  /** dev 自动登录用户名（脚手架阶段）：仅 .env.development 提供，生产由 IDP SSO 下发令牌 */
  readonly VITE_DEV_USERNAME?: string;
  /** dev 自动登录口令（脚手架阶段）：同上，禁止出现在 .env.production */
  readonly VITE_DEV_PASSWORD?: string;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
