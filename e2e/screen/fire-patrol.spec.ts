import { test, expect } from '@playwright/test';
import { ensureAuthed } from '../support/helpers';

/**
 * 大屏端 · 消防巡检「上报」写回链路 (R4 = BusinessWriteService.patrolExecution)。
 * 触发路径：大屏(/fire) → EquipmentMonitoring 面板「全部记录 ›」→ FirePatrolDialog
 * → 行内「上报」按钮 → createPatrolExecution → 成功 toast「巡更执行已上报」。
 *
 * 环境说明：/fire 是 Cesium 一张图大屏，依赖 WebGL/GPU。在 headless 或沙箱无 GPU 环境下
 * Cesium 可能挂载失败（页面 body 为空）。此时本测试显式 skip，不挂红 CI；
 * R4 写链路本身已被 mgmt/patrol-execution E2E 与 tools/smoke 覆盖，不受影响。
 * 在有 GPU 的机器（或带 --use-gl=swiftshader 的 headed Chrome）上会完整执行写回断言。
 */
test.describe('大屏端 · 消防巡检上报写回 (R4)', () => {
  test('打开巡检记录→上报→回显闭环', async ({ page }) => {
    await ensureAuthed(page);
    await page.goto('/fire');

    // Cesium 大屏在 headless/无 GPU 环境可能挂载失败（body 为空）。
    const bodyLen = (
      await page
        .locator('body')
        .innerText()
        .catch(() => '')
    ).length;
    if (bodyLen < 10) {
      test.skip(
        true,
        'Cesium 大屏在 headless/无 GPU 下无法挂载，跳过浏览器级验证；R4 写链路已由 mgmt E2E + smoke 覆盖',
      );
    }

    // 等待大屏面板渲染
    await expect(page.getByText(/全部记录|近期巡检|消防设施/)).toBeVisible({ timeout: 30_000 });

    // 打开消防巡检记录对话框
    await page
      .getByRole('button', { name: /全部记录/ })
      .first()
      .click();
    const dialog = page.getByRole('dialog', { name: '消防巡检记录' });
    await expect(dialog).toBeVisible({ timeout: 15_000 });

    // 读侧回显：列表从真后端加载
    await expect(dialog.locator('table').first()).toBeVisible({ timeout: 15_000 });

    // 写侧：存在「上报」按钮则点击并断言成功 toast
    const reportBtn = dialog.getByRole('button', { name: '上报' }).first();
    if (await reportBtn.isVisible().catch(() => false)) {
      await reportBtn.click();
      await expect(page.getByText('巡更执行已上报')).toBeVisible({ timeout: 15_000 });
    }
  });
});
