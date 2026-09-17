import { test, expect } from '@playwright/test';

/**
 * 移动端 · 现场采集回传页面可达性 (三端覆盖占位)。
 * 路由：主壳 src/router/index.ts 的 /mobile/field-report（@/views/mobile/fieldReport.vue）。
 * 该页当前以只读展示为主；此处校验页面在 dev 自动登录后能正常渲染，
 * 作为移动端三端交互冒烟的起始模板，后续可扩展为具体写链路断言。
 */
test.describe('移动端 · 现场采集回传可达', () => {
  test('页面在 dev 登录态下可渲染', async ({ page }) => {
    await page.goto('/mobile/field-report');
    // 页面标题（唯一）出现即证明移动端 dev 自动登录 + 渲染成功
    await expect(page.getByText('防爆移动端 · 现场采集回传', { exact: true })).toBeVisible({
      timeout: 30_000,
    });
  });
});
