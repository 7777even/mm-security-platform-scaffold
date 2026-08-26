/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAP_TILE_URL?: string;
  readonly VITE_TIANDITU_KEY?: string;
  readonly VITE_CESIUM_RESOLUTION_SCALE?: string;
  readonly VITE_CESIUM_RENDER_TIER?: string;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
