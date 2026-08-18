# 脚手架重搭实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重建 `frontend-scaffold/` 为严格遵循 S1 规范、OpenSpec 规格驱动、Superpowers 完整仪式（TDD 先红后绿）的前端脚手架样本。

**Architecture:** 单一 Vite + Vue3 前端工程，按 S1 §3.2 功能模块分层；合规约束（CSP、gzip、设计 token、只监不控、20位编码、RBAC）内建于基座与 services；核心能力以 Vitest 单测先行验证。openspec 规格已落盘于 `frontend-scaffold/openspec/`。

**Tech Stack:** Vue 3.0 + Vite 5 + TypeScript(strict, 禁 any) + Element Plus + ECharts + Pinia + Vue Router(懒加载) + Axios + Vitest。

## Global Constraints

- TypeScript **strict 模式开启，禁用 `any`**（ESLint `@typescript-eslint/no-explicit-any` 错误级）。
- 前端框架 **Vue 3.0**；构建 **Vite 5**；UI **Element Plus**；图表 **ECharts**（S1 §2.1）。
- **CSP**：开发态 `default-src 'self'`，生产须改 nonce 注入、移除 `unsafe-inline`（S1 §10.2）。
- **gzip** 预压缩产物，全部静态资源可离线打包、禁止公网外链（S1 §9.1/§9.4）。
- 设计 token 基准 **安全工业蓝 `#0F1E36`** + 暗色玻璃拟态，禁止散落硬编码色值。
- **零下行控制红线**：services 不得定义生命安全类硬控写接口（S1 §11）。
- 设备编码 **20 位中石化 MDM**，禁止自创物理主键（S1 §2.1 / 详细设计 §3.3）。
- 路径别名 `@` → `src/`（vite 与 vitest 共用）。
- 提交信息遵循约定式提交（feat/fix/refactor…）；不向 `main` 直推由 CI 门禁卡（S1 §6/§8）。
- 每批文件写后须用**非沙箱 Bash `ls`** 核对真实落盘（防 Overlay 丢弃）。

---

## File Structure

```
frontend-scaffold/
  package.json                      # 依赖与脚本(dev/build/lint/test/type-check)
  vite.config.ts                   # CSP dev header + gzip + @别名 + vitest(test)
  tsconfig.json / tsconfig.app.json / tsconfig.node.json
  env.d.ts                         # vite/client + *.vue 声明
  eslint.config.js / .prettierrc.json / .stylelintrc.json / .lintstagedrc.json
  .husky/pre-commit                # lint-staged
  index.html / .gitignore
  src/
    main.ts                        # 组装 app + pinia + router + ElementPlus
    App.vue                        # <router-view/>
    styles/tokens.css              # 设计 token
    styles/global.css              # 全局 + 玻璃拟态
    router/index.ts                # 懒加载路由 + meta.perm
    utils/logger.ts                # 统一日志(分级/可关/不打印敏感)
    constants/deviceCode.ts        # 20位 MDM 解析
    stores/auth.ts                 # 角色/权限上下文(Pinia)
    composables/usePermission.ts   # 按钮级权限
    services/http.ts               # Axios + OAuth2 头占位
    services/ws.ts                 # RealtimeClient(心跳+退避重连)
    components/layout/AppLayout.vue# 动态菜单(按 meta.perm)
    views/dashboard/index.vue      # ECharts 示例 + token 卡片
    views/fire-alarm/index.vue
    views/industrial-video/index.vue
    views/system/users.vue
    views/error/NotFound.vue
    constants/deviceCode.spec.ts
    stores/auth.spec.ts
    services/ws.spec.ts
```

---

### Task 1: scaffold-foundation 基座

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `env.d.ts`
- Create: `eslint.config.js`, `.prettierrc.json`, `.stylelintrc.json`, `.lintstagedrc.json`, `.husky/pre-commit`, `index.html`, `.gitignore`
- Create: `src/main.ts`, `src/App.vue`, `src/router/index.ts`, `src/styles/tokens.css`, `src/styles/global.css`, `src/utils/logger.ts`, `src/services/http.ts`, `src/components/layout/AppLayout.vue`(最小桩)

**Interfaces:**
- 本任务建立的 `@` 别名、`import.meta.env`、`useAuthStore` 将在后续任务消费。
- `AppLayout.vue` 在 Task 3 被完整覆盖（此处仅占位使路由可解析）。

- [ ] **Step 1: 写 package.json**

```json
{
  "name": "mm-security-platform-frontend-scaffold",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "安全管控指挥系统前端脚手架（Vue3+Vite+TS+Element Plus+ECharts），对齐 S1 与 OpenSpec/Superpowers。",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint . --ext .js,.ts,.vue",
    "lint:fix": "eslint . --ext .js,.ts,.vue --fix",
    "format": "prettier --write \"src/**/*.{ts,vue,js,css,json,md}\"",
    "stylelint": "stylelint \"src/**/*.{css,vue}\"",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "axios": "^1.7.7",
    "echarts": "^5.5.1",
    "element-plus": "^2.8.4",
    "@element-plus/icons-vue": "^2.3.1",
    "pinia": "^2.2.4",
    "vue": "^3.5.12",
    "vue-router": "^4.4.5"
  },
  "devDependencies": {
    "@eslint/js": "^9.13.0",
    "@types/node": "^22.7.5",
    "@vitejs/plugin-vue": "^5.1.4",
    "eslint": "^9.13.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-vue": "^9.29.0",
    "globals": "^15.11.0",
    "husky": "^9.1.6",
    "lint-staged": "^15.2.10",
    "prettier": "^3.3.3",
    "stylelint": "^16.10.0",
    "stylelint-config-standard": "^36.0.1",
    "typescript": "^5.6.3",
    "typescript-eslint": "^8.11.0",
    "vite": "^5.4.10",
    "vite-plugin-compression2": "^1.0.0",
    "vitest": "^2.1.3",
    "vue-tsc": "^2.1.10"
  }
}
```

- [ ] **Step 2: 写 vite.config.ts（CSP + gzip + 别名 + vitest）**

```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { compression } from 'vite-plugin-compression2'

// CSP 开发态基线（S1 §10.2）；生产须改 nonce 注入、移除 unsafe-inline
const csp = [
  "default-src 'self'",
  "img-src 'self' data: blob:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self' wss: https:",
  "font-src 'self' data:",
].join('; ')

export default defineConfig({
  plugins: [vue(), compression({ algorithm: 'gzip', threshold: 10240 })],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { headers: { 'Content-Security-Policy': csp } },
  build: {
    target: 'es2018',
    sourcemap: false,
    rollupOptions: {
      output: { manualChunks: { echarts: ['echarts'], 'element-plus': ['element-plus'] } },
    },
  },
  test: { environment: 'node', include: ['src/**/*.spec.ts'] },
})
```

- [ ] **Step 3: 写 tsconfig 三件套**

`tsconfig.json`：
```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}
```

`tsconfig.app.json`：
```json
{
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["node", "vitest/globals"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue", "env.d.ts"]
}
```

`tsconfig.node.json`：
```json
{
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: 写 env.d.ts**

```ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
```

- [ ] **Step 5: 写 lint/format 配置与 husky**

`eslint.config.js`：
```js
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', '*.config.ts', '*.config.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  prettier,
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    files: ['**/*.{ts,tsx,vue}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'error',
    },
  },
)
```

`.prettierrc.json`：`{ "semi": true, "singleQuote": true, "printWidth": 100, "tabWidth": 2, "trailingComma": "all" }`

`.stylelintrc.json`：`{ "extends": ["stylelint-config-standard"], "rules": { "selector-class-pattern": null, "no-descending-specificity": null, "custom-property-pattern": null } }`

`.lintstagedrc.json`：`{ "*.{ts,tsx,vue,js}": ["eslint --fix", "prettier --write"], "*.{css,vue}": ["stylelint --fix", "prettier --write"], "*.{json,md}": ["prettier --write"] }`

`.husky/pre-commit`：`npx lint-staged`

- [ ] **Step 6: 写 index.html 与 .gitignore**

`index.html`：
```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>安全管控指挥系统</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

`.gitignore`：`node_modules\ndist\ndist-ssr\n*.local\n.DS_Store\nlogs\n*.log`

- [ ] **Step 7: 写基座源码（main/App/router/styles/logger/http + AppLayout 桩）**

`src/main.ts`：
```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './styles/tokens.css'
import './styles/global.css'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')
```

`src/App.vue`：
```vue
<script setup lang="ts"></script>
<template>
  <router-view />
</template>
```

`src/router/index.ts`：
```ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'dashboard', component: () => import('@/views/dashboard/index.vue'), meta: { title: '综合态势', perm: 'dashboard:view' } },
      { path: 'fire-alarm', name: 'fire-alarm', component: () => import('@/views/fire-alarm/index.vue'), meta: { title: '火灾报警', perm: 'fire-alarm:view' } },
      { path: 'industrial-video', name: 'industrial-video', component: () => import('@/views/industrial-video/index.vue'), meta: { title: '工业视频', perm: 'video:view' } },
      { path: 'system/users', name: 'system-users', component: () => import('@/views/system/users.vue'), meta: { title: '用户与权限', perm: 'system:user:view' } },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/error/NotFound.vue') },
]

const router = createRouter({ history: createWebHistory(), routes })
export default router
```

`src/styles/tokens.css`：
```css
:root {
  --color-primary: #0F1E36;
  --color-primary-soft: #16304f;
  --color-accent: #1E90FF;
  --color-danger: #F5414B;
  --color-warning: #FAAD14;
  --color-success: #52C41A;
  --glass-bg: rgba(22, 48, 79, 0.55);
  --glass-border: rgba(120, 160, 210, 0.18);
  --glass-blur: 12px;
  --color-text: #E6EEF8;
  --color-text-muted: #8FA6C2;
  --color-bg: #0A1422;
  --space-xs: 4px; --space-sm: 8px; --space-md: 16px; --space-lg: 24px;
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
}
```

`src/styles/global.css`：
```css
* { box-sizing: border-box; }
html, body, #app { height: 100%; margin: 0; }
body {
  font-family: -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
}
.glass-panel {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-md);
}
```

`src/utils/logger.ts`：
```ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error'
const isProd = import.meta.env.MODE === 'production'

function emit(level: LogLevel, ...args: unknown[]): void {
  if (isProd && level === 'debug') return
  const ts = new Date().toISOString()
  // eslint-disable-next-line no-console
  console[level](`[${ts}]`, ...args)
}

export const logger = {
  debug: (...args: unknown[]): void => emit('debug', ...args),
  info: (...args: unknown[]): void => emit('info', ...args),
  warn: (...args: unknown[]): void => emit('warn', ...args),
  error: (...args: unknown[]): void => emit('error', ...args),
}
```

`src/services/http.ts`：
```ts
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { logger } from '@/utils/logger'

// 统一 HTTP 客户端（S1 §2.1/§3.3）；网关强制 OAuth2.0 签名拦截（详细设计 §3.3）。
// 令牌走 HttpOnly Cookie / 内存态，禁止 localStorage 明文（S1 §5.3）。Authorization 头由 IDP SSO 注入，此处占位。
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? '/api/v1',
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

http.interceptors.response.use(
  (resp: AxiosResponse) => resp,
  (error) => {
    logger.error('[http] request failed', error?.message)
    return Promise.reject(error)
  },
)

function getAccessToken(): string | null {
  // TODO: 接入 IDP SSO 后从内存态 / HttpOnly Cookie 取令牌
  return null
}

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const resp = await http.request(config)
  return resp.data as T
}

export default http
```

`src/components/layout/AppLayout.vue`（Task 3 将覆盖为动态菜单版，此处最小桩使路由可解析）：
```vue
<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
<template>
  <RouterView />
</template>
```

- [ ] **Step 7b: 建 5 个最小占位视图（使 router 在 Task 1 即可解析，Task 5 覆盖为完整实现）**

`src/views/dashboard/index.vue`：
```vue
<script setup lang="ts"></script>
<template><div class="glass-panel" style="padding:24px">综合态势占位</div></template>
```
`src/views/fire-alarm/index.vue`：
```vue
<script setup lang="ts"></script>
<template><div class="glass-panel" style="padding:24px">火灾报警占位</div></template>
```
`src/views/industrial-video/index.vue`：
```vue
<script setup lang="ts"></script>
<template><div class="glass-panel" style="padding:24px">工业视频占位</div></template>
```
`src/views/system/users.vue`：
```vue
<script setup lang="ts"></script>
<template><div class="glass-panel" style="padding:24px">用户与权限占位</div></template>
```
`src/views/error/NotFound.vue`：
```vue
<script setup lang="ts"></script>
<template><div class="glass-panel" style="padding:24px">404 占位</div></template>
```

- [ ] **Step 8: 非沙箱核对落盘并运行 lint / type-check**

Run（dangerouslyDisableSandbox）：
```bash
ls -R src openspec 2>/dev/null | head -40
npm install
npm run lint
npm run type-check
```
Expected：`lint` 0 error；`type-check` 0 error（AppLayout 桩存在，路由可解析）。

- [ ] **Step 9: Commit**
```bash
git add -A && git commit -m "feat(scaffold): 建立 Vue3+Vite+TS 基座与 lint/CSP/gzip 门禁"
```

---

### Task 2: device-code 能力（TDD 先行）

**Files:**
- Test: `src/constants/deviceCode.spec.ts`
- Create: `src/constants/deviceCode.ts`

**Interfaces:**
- 消费方：后续 `views/fire-alarm`、`services/adapter` 将调用 `parseDeviceCode(raw): DeviceCodeParts`。
- 产出：`DEVICE_CODE_LENGTH: number`、`parseDeviceCode(raw: string): DeviceCodeParts`，其中 `DeviceCodeParts = { raw: string; isValid: boolean; category?: string; region?: string; sequence?: string }`。

- [ ] **Step 1: 写失败测试**

`src/constants/deviceCode.spec.ts`：
```ts
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
```

- [ ] **Step 2: 运行测试确认失败**

Run：`npx vitest run src/constants/deviceCode.spec.ts`
Expected：FAIL（`Cannot find module '@/constants/deviceCode'`）。

- [ ] **Step 3: 写最小实现**

`src/constants/deviceCode.ts`：
```ts
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
```

- [ ] **Step 4: 运行测试确认通过**

Run：`npx vitest run src/constants/deviceCode.spec.ts`
Expected：PASS（5/5）。

- [ ] **Step 5: Commit**
```bash
git add src/constants/deviceCode.ts src/constants/deviceCode.spec.ts
git commit -m "feat(device-code): 20位MDM编码解析与单测(TDD)"
```

---

### Task 3: rbac-permission 能力（TDD 先行）

**Files:**
- Test: `src/stores/auth.spec.ts`
- Create: `src/stores/auth.ts`, `src/composables/usePermission.ts`
- Modify(覆盖): `src/components/layout/AppLayout.vue`

**Interfaces:**
- 消费方：`AppLayout.vue` 调用 `usePermission().hasPerm` 与 `useAuthStore().hasPerm` 过滤菜单；`views/system/users.vue` 演示权限。
- 产出：`useAuthStore`（`username`、`roles: RoleProfile[]`、`setRoles(list)`、`hasPerm(code): boolean`）；`RoleProfile = { roleId; roleName; perms: string[]; terminal: 'bigscreen'|'pc'|'app'; zone: string }`；`usePermission()` 返回 `{ hasPerm(code): boolean; hasAny(...codes): boolean }`。

- [ ] **Step 1: 写失败测试**

`src/stores/auth.spec.ts`：
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import type { RoleProfile } from '@/stores/auth'
import { usePermission } from '@/composables/usePermission'

const commander: RoleProfile = {
  roleId: 'r1', roleName: '总指挥', perms: ['fire-alarm:ack', 'dashboard:view'],
  terminal: 'bigscreen', zone: '*',
}
const operator: RoleProfile = {
  roleId: 'r2', roleName: '外操', perms: [], terminal: 'app', zone: 'zoneA',
}

describe('rbac permission', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('授权码命中返回 true', () => {
    const auth = useAuthStore()
    auth.setRoles([commander])
    expect(usePermission().hasPerm('fire-alarm:ack')).toBe(true)
  })
  it('未授权码返回 false', () => {
    const auth = useAuthStore()
    auth.setRoles([operator])
    expect(usePermission().hasPerm('fire-alarm:ack')).toBe(false)
  })
  it('hasAny 任一命中即可', () => {
    const auth = useAuthStore()
    auth.setRoles([operator])
    expect(usePermission().hasAny('a:b', 'c:d')).toBe(false)
    auth.setRoles([commander])
    expect(usePermission().hasAny('a:b', 'fire-alarm:ack')).toBe(true)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run：`npx vitest run src/stores/auth.spec.ts`
Expected：FAIL（模块未定义）。

- [ ] **Step 3: 写最小实现**

`src/stores/auth.ts`：
```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface RoleProfile {
  roleId: string
  roleName: string
  perms: string[]
  terminal: 'bigscreen' | 'pc' | 'app'
  zone: string
}

export const useAuthStore = defineStore('auth', () => {
  const username = ref('张调度')
  const roles = ref<RoleProfile[]>([])

  function setRoles(list: RoleProfile[]): void {
    roles.value = list
  }

  const perms = computed<Set<string>>(() => {
    const s = new Set<string>()
    roles.value.forEach((r) => r.perms.forEach((p) => s.add(p)))
    return s
  })

  function hasPerm(code: string): boolean {
    return perms.value.has(code)
  }

  return { username, roles, setRoles, hasPerm }
})
```

`src/composables/usePermission.ts`：
```ts
import { useAuthStore } from '@/stores/auth'

export function usePermission() {
  const auth = useAuthStore()
  function hasPerm(code: string): boolean {
    return auth.hasPerm(code)
  }
  function hasAny(...codes: string[]): boolean {
    return codes.some((c) => auth.hasPerm(c))
  }
  return { hasPerm, hasAny }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run：`npx vitest run src/stores/auth.spec.ts`
Expected：PASS（3/3）。

- [ ] **Step 5: 覆盖 AppLayout.vue 为动态菜单版**

`src/components/layout/AppLayout.vue`：
```vue
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

interface MenuDef { index: string; title: string; perm: string }
const menuItems: MenuDef[] = [
  { index: '/dashboard', title: '综合态势', perm: 'dashboard:view' },
  { index: '/fire-alarm', title: '火灾报警', perm: 'fire-alarm:view' },
  { index: '/industrial-video', title: '工业视频', perm: 'video:view' },
  { index: '/system/users', title: '用户与权限', perm: 'system:user:view' },
]
const visibleMenus = computed(() => menuItems.filter((m) => auth.hasPerm(m.perm)))

const rolesText = computed(() => auth.roles.map((r) => r.roleName).join(' / '))
const now = ref('')
let timer: number | null = null
function tick(): void { now.value = new Date().toLocaleString('zh-CN', { hour12: false }) }
onMounted(() => { tick(); timer = window.setInterval(tick, 1000) })
onUnmounted(() => { if (timer !== null) window.clearInterval(timer) })
const activeIndex = computed(() => route.path)
</script>

<template>
  <el-container class="layout">
    <el-aside width="220px" class="aside glass-panel">
      <div class="brand">
        <span class="brand-mark">安</span>
        <span class="brand-text">安全管控指挥系统</span>
      </div>
      <el-menu :default-active="activeIndex" router background-color="transparent" text-color="#E6EEF8" active-text-color="#1E90FF" class="menu">
        <el-menu-item v-for="m in visibleMenus" :key="m.index" :index="m.index">
          <span>{{ m.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header glass-panel">
        <div class="header-title">{{ (route.meta.title as string) || '安全管控指挥系统' }}</div>
        <div class="header-right">
          <span class="clock">{{ now }}</span>
          <el-tag type="info" effect="dark" round>{{ rolesText }}</el-tag>
          <span class="user">{{ auth.username }}</span>
        </div>
      </el-header>
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in"><component :is="Component" /></transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout { height: 100vh; }
.aside { margin: var(--space-sm); border-radius: var(--radius-md); display: flex; flex-direction: column; padding: var(--space-md); }
.brand { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-xs) var(--space-md); }
.brand-mark { width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--color-accent); color: #fff; display: grid; place-items: center; font-weight: 700; }
.brand-text { font-weight: 600; font-size: 15px; }
.menu { border-right: none; background: transparent; }
.header { margin: var(--space-sm) var(--space-sm) 0; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; }
.header-title { font-size: 18px; font-weight: 600; }
.header-right { display: flex; align-items: center; gap: var(--space-md); color: var(--color-text-muted); }
.user { color: var(--color-text); }
.main { padding: var(--space-md); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
```

- [ ] **Step 6: 运行 type-check 与测试**

Run：
```bash
npm run type-check
npx vitest run
```
Expected：type-check 0 error；vitest PASS。

- [ ] **Step 7: Commit**
```bash
git add src/stores/auth.ts src/stores/auth.spec.ts src/composables/usePermission.ts src/components/layout/AppLayout.vue
git commit -m "feat(rbac): 动态菜单+按钮级权限与单测(TDD)"
```

---

### Task 4: realtime-channel 能力（TDD 先行）

**Files:**
- Test: `src/services/ws.spec.ts`
- Create: `src/services/ws.ts`

**Interfaces:**
- 消费方：`views/dashboard` 等将通过 `new RealtimeClient({ url })` 订阅 `rt/*` topic。
- 产出：`WsOptions = { url: string; heartbeatInterval?: number; reconnectMax?: number; reconnectBaseDelay?: number }`、`RealtimeClient` 类（构造接收 `WsOptions`；`connect()`、`close()`；`onMessage: ((msg: WsMessage) => void) | null`；`WsMessage = { topic: string; payload: unknown }`）。行为：连接建立后按 `heartbeatInterval`(默认15000) 发 ping；异常断开按 `reconnectBaseDelay`(默认1000)·2^n(上限30000) 指数退避重连；解析 `{topic,payload}` JSON 并回调 `onMessage`；非法 JSON 仅告警不抛。

- [ ] **Step 1: 写失败测试（含 WebSocket 全局桩）**

`src/services/ws.spec.ts`：
```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RealtimeClient, type WsMessage } from '@/services/ws'

class MockWS {
  static instances: MockWS[] = []
  url: string
  readyState = 0
  onopen: (() => void) | null = null
  onmessage: ((e: { data: string }) => void) | null = null
  onclose: (() => void) | null = null
  sent: string[] = []
  constructor(url: string) {
    this.url = url
    MockWS.instances.push(this)
    setTimeout(() => { this.readyState = 1; this.onopen?.() }, 0)
  }
  send(d: string) { this.sent.push(d) }
  close() { this.readyState = 3; this.onclose?.() }
}

beforeEach(() => { MockWS.instances = []; vi.stubGlobal('WebSocket', MockWS) })
afterEach(() => { vi.unstubAllGlobals() })

function wait(ms: number) { return new Promise((r) => setTimeout(r, ms)) }

describe('RealtimeClient', () => {
  it('连接后发送心跳 ping', async () => {
    const c = new RealtimeClient({ url: 'ws://x', heartbeatInterval: 20 })
    c.connect()
    await wait(40)
    expect(MockWS.instances[0].sent.some((m) => m.includes('ping'))).toBe(true)
    c.close()
  })
  it('解析消息并透传 topic/payload', async () => {
    const c = new RealtimeClient({ url: 'ws://x' })
    const received: WsMessage[] = []
    c.onMessage = (m) => received.push(m)
    c.connect()
    await wait(10)
    MockWS.instances[0].onmessage?.({ data: JSON.stringify({ topic: 'rt/alarm', payload: { id: 1 } }) })
    expect(received[0]).toEqual({ topic: 'rt/alarm', payload: { id: 1 } })
    c.close()
  })
  it('非法 JSON 不抛异常', async () => {
    const c = new RealtimeClient({ url: 'ws://x' })
    c.connect()
    await wait(10)
    expect(() => MockWS.instances[0].onmessage?.({ data: 'not-json' })).not.toThrow()
    c.close()
  })
  it('异常断开后自动重连', async () => {
    const c = new RealtimeClient({ url: 'ws://x', reconnectMax: 3, reconnectBaseDelay: 10 })
    c.connect()
    await wait(10)
    MockWS.instances[0].onclose?.()
    await wait(30)
    expect(MockWS.instances.length).toBeGreaterThan(1)
    c.close()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run：`npx vitest run src/services/ws.spec.ts`
Expected：FAIL（模块未定义）。

- [ ] **Step 3: 写最小实现**

`src/services/ws.ts`：
```ts
import { logger } from '@/utils/logger'

// 实时通道客户端（选型 B1：WebSocket，rt/* topic；MQTT over WS 备选）
// 心跳保活 + 指数退避重连 + 消息解析（B3 实时约定）。只监不控：禁止硬控下行写接口（S1 §11）。
export interface WsOptions {
  url: string
  heartbeatInterval?: number
  reconnectMax?: number
  reconnectBaseDelay?: number
}

export interface WsMessage {
  topic: string
  payload: unknown
}

export class RealtimeClient {
  private ws: WebSocket | null = null
  private readonly url: string
  private heartbeatTimer: number | null = null
  private reconnectAttempts = 0
  private readonly heartbeatInterval: number
  private readonly reconnectMax: number
  private readonly reconnectBaseDelay: number
  private manualClose = false
  public onMessage: ((msg: WsMessage) => void) | null = null

  constructor(options: WsOptions) {
    this.url = options.url
    this.heartbeatInterval = options.heartbeatInterval ?? 15000
    this.reconnectMax = options.reconnectMax ?? 10
    this.reconnectBaseDelay = options.reconnectBaseDelay ?? 1000
  }

  connect(): void {
    this.manualClose = false
    this.ws = new WebSocket(this.url)
    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.startHeartbeat()
      logger.info('[ws] connected')
    }
    this.ws.onmessage = (ev) => this.handleMessage(ev)
    this.ws.onclose = () => {
      this.stopHeartbeat()
      if (!this.manualClose) this.scheduleReconnect()
    }
    this.ws.onerror = (ev) => logger.error('[ws] error', ev)
  }

  private handleMessage(ev: MessageEvent): void {
    try {
      const msg = JSON.parse(ev.data as string) as WsMessage
      this.onMessage?.(msg)
    } catch (e) {
      logger.warn('[ws] invalid message', e)
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => this.send({ type: 'ping' }), this.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.reconnectMax) return
    const delay = Math.min(this.reconnectBaseDelay * 2 ** this.reconnectAttempts, 30000)
    this.reconnectAttempts += 1
    setTimeout(() => this.connect(), delay)
  }

  private send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(data))
  }

  close(): void {
    this.manualClose = true
    this.stopHeartbeat()
    this.ws?.close()
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run：`npx vitest run src/services/ws.spec.ts`
Expected：PASS（4/4）。

- [ ] **Step 5: Commit**
```bash
git add src/services/ws.ts src/services/ws.spec.ts
git commit -m "feat(realtime): WebSocket可靠通道与单测(TDD)"
```

---

### Task 5: 页面与装配

**Files:**
- Modify(覆盖 Task 1 占位桩): `src/views/dashboard/index.vue`, `src/views/fire-alarm/index.vue`, `src/views/industrial-video/index.vue`, `src/views/system/users.vue`, `src/views/error/NotFound.vue`

**Interfaces:** 各页面经 `router` 懒加载挂载于 `AppLayout` 的 `<router-view>`。页面仅消费已定义的 store / composable / services，不写 fetch。

- [ ] **Step 1: 写 dashboard（ECharts + token 卡片 + 权限提示）**

`src/views/dashboard/index.vue`：
```vue
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'
import { usePermission } from '@/composables/usePermission'

const { hasPerm } = usePermission()
const stats = [
  { label: '在线工作站', value: 32, unit: '个' },
  { label: '今日报警', value: 18, unit: '起' },
  { label: '视频点位', value: 1246, unit: '路' },
  { label: '预案数', value: 47, unit: '份' },
]
const chartEl = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
function renderChart(): void {
  if (!chartEl.value) return
  chart = echarts.init(chartEl.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: ['00:00','04:00','08:00','12:00','16:00','20:00','24:00'], axisLine: { lineStyle: { color: '#8FA6C2' } } },
    yAxis: { type: 'value', axisLine: { lineStyle: { color: '#8FA6C2' } }, splitLine: { lineStyle: { color: 'rgba(143,166,194,0.15)' } } },
    series: [{ name: '报警趋势', type: 'line', smooth: true, areaStyle: { color: 'rgba(30,144,255,0.25)' }, lineStyle: { color: '#1E90FF' }, itemStyle: { color: '#1E90FF' }, data: [3,1,5,8,6,9,4] }],
  })
}
function onResize(): void { chart?.resize() }
onMounted(() => { renderChart(); window.addEventListener('resize', onResize) })
onUnmounted(() => { window.removeEventListener('resize', onResize); chart?.dispose() })
</script>

<template>
  <div class="dashboard">
    <div class="stat-row">
      <div v-for="s in stats" :key="s.label" class="glass-panel stat-card">
        <div class="stat-value">{{ s.value }}<span class="stat-unit">{{ s.unit }}</span></div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>
    <div class="glass-panel chart-card">
      <div class="card-title">报警趋势（24h）</div>
      <div ref="chartEl" class="chart"></div>
    </div>
    <div v-if="hasPerm('fire-alarm:ack')" class="glass-panel perm-hint">
      当前角色具备「火灾报警-确认」按钮级权限，可用于演示 v-permission 联动。
    </div>
  </div>
</template>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: var(--space-md); }
.stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); }
.stat-card { padding: var(--space-md); }
.stat-value { font-size: 28px; font-weight: 700; color: var(--color-accent); }
.stat-unit { font-size: 13px; color: var(--color-text-muted); margin-left: 4px; }
.stat-label { color: var(--color-text-muted); margin-top: 4px; }
.chart-card { padding: var(--space-md); }
.card-title { font-weight: 600; margin-bottom: var(--space-sm); }
.chart { height: 320px; }
.perm-hint { padding: var(--space-md); color: var(--color-text-muted); font-size: 13px; }
</style>
```

- [ ] **Step 2: 写其余页面**

`src/views/error/NotFound.vue`：
```vue
<script setup lang="ts"></script>
<template>
  <div class="glass-panel notfound">
    <h2>404</h2>
    <p class="muted">页面不存在</p>
  </div>
</template>
<style scoped>
.notfound { padding: var(--space-lg); text-align: center; }
.muted { color: var(--color-text-muted); }
</style>
```

`src/views/fire-alarm/index.vue`：
```vue
<script setup lang="ts">
import { parseDeviceCode } from '@/constants/deviceCode'
const sample = parseDeviceCode('12345678901234567890')
</script>
<template>
  <div class="glass-panel pad">
    <h3>火灾报警（只监不控）</h3>
    <p class="muted">本页仅消费只读监视数据；消防泵/应急广播/逃生门禁等硬控不在此渲染写入口（S1 §11）。</p>
    <p>示例设备编码：<code>{{ sample.raw }}</code> → 类别 {{ sample.category }} / 区域 {{ sample.region }} / 序列 {{ sample.sequence }}</p>
  </div>
</template>
<style scoped>
.pad { padding: var(--space-lg); }
.muted { color: var(--color-text-muted); }
code { color: var(--color-accent); }
</style>
```

`src/views/industrial-video/index.vue`：
```vue
<script setup lang="ts"></script>
<template>
  <div class="glass-panel pad">
    <h3>工业视频</h3>
    <p class="muted">视频墙/flv.js 组件属 A 档后续 demo，此处为占位（S1 §2.1 视频播放 flv.js 优先）。</p>
  </div>
</template>
<style scoped>
.pad { padding: var(--space-lg); }
.muted { color: var(--color-text-muted); }
</style>
```

`src/views/system/users.vue`：
```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import type { RoleProfile } from '@/stores/auth'
const auth = useAuthStore()
// Mock：演示用角色（真实数据由 IDP SSO 注入）
const demo: RoleProfile[] = [
  { roleId: 'r1', roleName: '总指挥', perms: ['dashboard:view','fire-alarm:view','fire-alarm:ack','video:view','system:user:view'], terminal: 'bigscreen', zone: '*' },
  { roleId: 'r2', roleName: '外操巡检员', perms: ['dashboard:view','video:view'], terminal: 'app', zone: 'zoneA' },
]
auth.setRoles(demo)
</script>
<template>
  <div class="glass-panel pad">
    <h3>用户与权限（Mock 演示）</h3>
    <el-table :data="auth.roles" style="width: 100%">
      <el-table-column prop="roleName" label="角色" />
      <el-table-column prop="terminal" label="终端" />
      <el-table-column prop="zone" label="防区" />
      <el-table-column label="权限码">
        <template #default="{ row }">{{ row.perms.join('，') }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>
<style scoped>
.pad { padding: var(--space-lg); }
</style>
```

- [ ] **Step 3: type-check 校验**

Run：`npm run type-check`
Expected：0 error（所有视图与路由引用齐全）。

- [ ] **Step 4: Commit**
```bash
git add src/views
git commit -m "feat(views): 装配 dashboard/报警/视频/权限/404 页面"
```

---

### Task 6: 验证与落盘核对

**Files:** 全部（无新增，仅验证）

- [ ] **Step 1: 非沙箱核对全部文件真实落盘**

Run（dangerouslyDisableSandbox）：
```bash
find frontend-scaffold -type f -not -path "*/node_modules/*" -not -path "*/dist/*" | sort
```
Expected：出现 openspec/、docs/superpowers/、src/ 全部文件。

- [ ] **Step 2: 全量验证（install/build/lint/test）**

Run（dangerouslyDisableSandbox）：
```bash
cd frontend-scaffold
npm install
npm run build      # 含 vue-tsc 类型检查 + gzip 产物
npm run lint
npm run test
```
Expected：`build` 成功且 dist 含 `.gz`；`lint` 0 error；`test` 全部 PASS（device-code/rbac/realtime 共 12 例）。

- [ ] **Step 3: 收尾**

若全部通过，向用户汇报：脚手架已按 OpenSpec + Superpowers 重搭完成，openspec 规格与实现计划均已落盘，TDD 全绿。将 `changes/rebuild-scaffold-foundation` 标记为可归档（待用户确认后移入 `openspec/changes/archive/`）。不主动归档，待评审。
