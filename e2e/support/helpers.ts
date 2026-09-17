import { Page } from '@playwright/test';

const API_BASE = process.env.E2E_API_BASE ?? 'http://localhost:8899/api/v1';
const API_ORIGIN = new URL(API_BASE).origin; // http://localhost:8899

/**
 * 预登录（关键）：mgmt / screen 等独立子应用自身不登录，依赖主壳登录后种下的
 * `rt`(HttpOnly) Cookie 做静默续期。若直接深链进 /apps/mgmt/...，主壳尚未登录、
 * 无 rt Cookie → 被踢回主壳登录页且丢失原路径。故先访问主壳触发 dev 自动登录，
 * 待 rt Cookie 落盘后再进深链。rt 为 HttpOnly，JS 读不到，用 context.cookies() 轮询。
 */
export async function ensureAuthed(page: Page): Promise<void> {
  await page.goto('/');
  const deadline = Date.now() + 25_000;
  while (Date.now() < deadline) {
    const cookies = await page.context().cookies(API_ORIGIN);
    if (cookies.some((c) => c.name === 'rt')) return;
    await page.waitForTimeout(400);
  }
  throw new Error('ensureAuthed: rt Cookie 未种下，主壳 dev 自动登录可能失败');
}

/** Element Plus 日期选择器：直接向输入框填入今天日期并回车提交（避开面板 DOM 差异）。 */
export async function pickToday(page: Page, placeholder: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const input = page.locator(`.el-date-editor input[placeholder="${placeholder}"]`);
  await input.click();
  await input.fill(today);
  await input.press('Enter');
}

/** 等待 Element Plus 消息提示（ElMessage）出现。 */
export async function waitToast(page: Page, text: string): Promise<void> {
  await page.getByText(text, { exact: false }).first().waitFor({ timeout: 15_000 });
}
