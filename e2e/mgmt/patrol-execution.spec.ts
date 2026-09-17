import { test, expect } from '@playwright/test';
import { ensureAuthed, pickToday, waitToast } from '../support/helpers';

/**
 * 管理端 · 消防巡更执行写回链路 (R4 = BusinessWriteService.patrolExecution)。
 * 覆盖：UI 提交(execResult 英文枚举 NORMAL) → 真后端落库 → 列表回显。
 * 选择器基于 apps/mgmt/views/fire/PatrolExecutionView.vue（已修中文枚举→英文码断链）。
 */
const UNIQ = `E2E巡更${Date.now()}`;

test.describe('管理端 · 消防巡更执行写回 (R4)', () => {
  test('提交→落库→回显闭环', async ({ page }) => {
    await ensureAuthed(page); // 先让主壳登录种下 rt Cookie
    await page.goto('/apps/mgmt/patrol-execution');

    // 页面头标题（唯一）
    await expect(page.locator('.mgmt-ph__title', { hasText: '消防巡更执行' })).toBeVisible();

    // 打开新建对话框（v-permission 按钮「巡更上报」，限定 main 区避免命中侧栏同名按钮）
    await page.locator('main').getByRole('button', { name: '巡更上报' }).click();
    const dialog = page.locator('.el-dialog');
    await expect(dialog.getByRole('button', { name: '确定上报' })).toBeVisible();

    // 选巡查日期 = 今天
    await pickToday(page, '选择日期');

    // 填唯一值班人员（回显定位）；execResult 默认 NORMAL 无需改
    await page.locator('input[placeholder="巡更人姓名"]').fill(UNIQ);
    await page.locator('input[placeholder="如 T-301 罐区"]').fill('E2E测试部位');

    // 提交（对话框内「确定上报」）
    await dialog.getByRole('button', { name: '确定上报' }).click();

    // 成功 toast
    await waitToast(page, '巡更上报成功');

    // 回显：新行出现
    await expect(page.locator('table').getByText(UNIQ).first()).toBeVisible({ timeout: 15_000 });
  });
});
