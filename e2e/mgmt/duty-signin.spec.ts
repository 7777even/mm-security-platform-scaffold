import { test, expect } from '@playwright/test';
import { ensureAuthed, pickToday, waitToast } from '../support/helpers';

/**
 * 管理端 · 值班签到写回链路 (R2 = BusinessWriteService.dutySignIn)。
 * 覆盖：UI 提交(英文枚举 SIGN_IN) → 真后端落库 → 列表回显。
 * 选择器基于 apps/mgmt/views/emergency/DutySignInView.vue（已修中文枚举→英文码断链）。
 */
const UNIQ = `E2E签到${Date.now()}`;

test.describe('管理端 · 值班签到写回 (R2)', () => {
  test('提交→落库→回显闭环', async ({ page }) => {
    await ensureAuthed(page); // 先让主壳登录种下 rt Cookie，否则 mgmt 深链会被踢回登录页
    await page.goto('/apps/mgmt/duty-sign-in');

    // 页面头标题（唯一），证明 mgmt 已通过 rt 续期正常进入
    await expect(page.locator('.mgmt-ph__title', { hasText: '值班签到' })).toBeVisible();

    // 打开新建对话框（v-permission 按钮，admin 可见；限定 main 区避免命中侧栏导航同名按钮）
    await page.locator('main').getByRole('button', { name: '值班签到' }).click();
    const dialog = page.locator('.el-dialog');
    await expect(dialog.getByRole('button', { name: '确定' })).toBeVisible();

    // 选值班日期 = 今天（Element Plus 日期选择器）
    await pickToday(page, '选择日期');

    // 填唯一姓名，用于回显定位；signAction 默认 SIGN_IN 无需改
    await page.locator('input[placeholder="值班人姓名"]').fill(UNIQ);

    // 提交（对话框内的确定按钮）
    await dialog.getByRole('button', { name: '确定' }).click();

    // 成功 toast（toastOk('签到成功')）
    await waitToast(page, '签到成功');

    // 回显：新行出现在列表
    await expect(page.locator('table').getByText(UNIQ).first()).toBeVisible({ timeout: 15_000 });
  });
});
