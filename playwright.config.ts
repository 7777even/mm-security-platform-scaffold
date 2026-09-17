import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

/**
 * 解析浏览器可执行文件路径（可移植性关键）：
 * - 显式设置 PW_CHROME_PATH → 用它（本地复用系统 Chrome，免下载）；
 * - 否则若本机存在 Windows 默认 Chrome → 用它；
 * - 都不满足（如 ubuntu-latest CI）→ 返回 undefined，回退到 Playwright 自带 chromium
 *   （由 `npx playwright install chromium` 安装）。
 *
 * ⚠️ 早期版本把 Windows Chrome 路径写死成默认值，导致 Linux CI 上 launch 必然失败
 * （"Executable doesn't exist at C:/Program Files/..."）。此处务必保持条件回退。
 */
function resolveChromePath(): string | undefined {
  if (process.env.PW_CHROME_PATH) return process.env.PW_CHROME_PATH;
  const winDefault = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  return existsSync(winDefault) ? winDefault : undefined;
}

/**
 * Playwright E2E 配置（前端 UI 层三端写回链路验证）。
 *
 * 设计要点：
 * 1. dev 模式下主壳会经 VITE_DEV_USERNAME / VITE_DEV_PASSWORD 自动登录真后端，
 *    令牌仅存 JS 内存（见 src/services/token.ts），故每个浏览器上下文都靠 dev 自动登录，
 *    不需要在 auth.setup 里持久化 storageState——直接导航即可。
 * 2. webServer 以隔离端口 8899 指向验证用后端（勿动用户 8787 实例）；
 *    VITE_USE_DEV_MOCK=false 强制走真后端，避免 mock 数据掩盖真实闭环。
 * 3. baseURL 指向 vite dev(5173)，同一 dev server 同时托管主壳(/)、/apps/mgmt、/apps/mobile，
 *    因此一条 server 即可覆盖三端。
 *
 * 运行前置：需先 `npx playwright install chromium`（本沙箱无浏览器，CI 步骤已含）。
 */
const API_BASE = process.env.E2E_API_BASE ?? 'http://localhost:8899/api/v1';
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // 写链路互相干扰，串行更稳
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report' }]]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // 沙箱/CI 无网络下载 Playwright 自带 chromium 时，复用系统已装 Chrome（PW_CHROME_PATH）。
        // 取不到则返回 undefined，交由 Playwright 使用自带 chromium（CI 已 install）。
        launchOptions: {
          executablePath: resolveChromePath(),
          // 沙箱/CI 无 GPU：启用 SwiftShader 软件 WebGL，让 Cesium 大屏能初始化（否则面板不渲染）。
          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--enable-unsafe-swiftshader',
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--ignore-gpu-blocklist',
          ],
        },
      },
    },
  ],
  webServer: {
    // 用 --mode e2e 加载 .env.e2e（指向隔离后端 8899），绕开 .env.development 的 8787，
    // 否则 vite 的 .env 文件会覆盖 process.env，导致自动登录打到未启动的 8787。
    command: 'npx vite --mode e2e --port 5173 --strictPort',
    url: BASE_URL,
    // 始终起新 server：避免复用上一次失败遗留的旧 vite（可能还是 8787 模式）导致鉴权/接口全错。
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      VITE_API_BASE: API_BASE,
      VITE_USE_DEV_MOCK: 'false',
      VITE_DEV_USERNAME: process.env.E2E_DEV_USER ?? 'admin',
      VITE_DEV_PASSWORD: process.env.E2E_DEV_PASSWORD ?? 'admin@2026',
    },
  },
});
