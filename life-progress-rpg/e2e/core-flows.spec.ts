import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function completeOnboarding(page: Page, aiConsent = false) {
  await page.goto('/');
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByRole('spinbutton', { name: /出生年份/ }).fill('1990');
  await page.getByRole('spinbutton', { name: /预期寿命/ }).fill('85');
  if (aiConsent) {
    await page.getByRole('checkbox', { name: /允许 AI/ }).check();
  }
  await page.getByRole('button', { name: '开始设置' }).click();
  await expect(page).toHaveURL(/\/$/);
}

async function saveRecord(page: Page, note = '完成了今天的项目复盘') {
  await page.goto('/record');
  await page.getByRole('button', { name: '不错' }).click();
  await page.locator('input[type="range"]').fill('7');
  await page.getByRole('textbox', { name: /标签/ }).fill('学习, 复盘, 学习');
  await page.getByRole('textbox', { name: /备注/ }).fill(note);
  await page.getByRole('button', { name: '保存今日记录' }).click();
  await expect(page.getByText(/已保存到本地/)).toBeVisible();
}

test('F-001~F-007、F-009~F-010：引导、记录、反馈、同日更新和删除闭环', async ({ page }) => {
  await completeOnboarding(page);
  await expect(page.getByText('估算人生进度（近似）')).toBeVisible();
  await expect(page.getByText('今日尚未记录')).toBeVisible();

  await saveRecord(page);
  await expect(page.getByText(/今日聚焦：学习 \/ 复盘/)).toBeVisible();
  for (const feedback of ['有帮助', '没帮助', '事实不准确']) {
    await page.getByRole('button', { name: feedback }).click();
    await expect(page.getByText('评价已保存。')).toBeVisible();
  }
  await page.getByRole('button', { name: '事实不准确' }).click();
  await expect(page.getByRole('button', { name: '事实不准确' })).not.toHaveClass(/chip--active/);

  await page.getByRole('link', { name: '今日' }).click();
  await expect(page.getByText(/今日已记录：心情 4，活力 7/)).toBeVisible();
  await page.getByRole('link', { name: '历史', exact: true }).click();
  await expect(page.getByText('完成了今天的项目复盘')).toBeVisible();
  await page.getByRole('link', { name: '编辑' }).click();
  await page.getByRole('textbox', { name: /备注/ }).fill('同日更新后的复盘');
  await page.getByRole('button', { name: '保存今日记录' }).click();
  await page.getByRole('link', { name: '返回历史列表' }).click();
  await expect(page.getByText('同日更新后的复盘')).toBeVisible();
  await expect(page.locator('.history-item')).toHaveCount(1);

  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: '删除' }).click();
  await expect(page.locator('.history-item')).toHaveCount(1);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: '删除' }).click();
  await expect(page.getByText('还没有历史记录。')).toBeVisible();
});

test('F-008：AI 请求失败不阻塞本地保存', async ({ page }) => {
  await completeOnboarding(page, true);
  await page.route('**/api/reflections', (route) => route.abort());
  await page.goto('/record');
  await page.getByRole('button', { name: '一般' }).click();
  await page.locator('input[type="range"]').fill('5');
  await page.getByRole('textbox', { name: /备注/ }).fill('网络失败也要保留这条记录');
  await page.getByRole('checkbox', { name: /允许 AI/ }).check();
  await page.getByRole('button', { name: '保存今日记录' }).click();
  await expect(page.getByText('已保存到本地，AI 不可用，已回退到本地回应。')).toBeVisible();
  await expect(page.getByText('本地回复')).toBeVisible();
});

test('F-011、F-017：设置可关闭进度并持久化主题', async ({ page }) => {
  await completeOnboarding(page);
  await page.goto('/settings');
  await page.getByRole('checkbox', { name: '显示估算人生进度' }).uncheck();
  for (const theme of ['spring', 'study', 'explore', 'root', 'spring']) {
    await page.getByRole('combobox', { name: '主题' }).selectOption(theme);
    await page.getByRole('button', { name: '保存设置' }).click();
    await expect(page.getByText('设置已保存。后续更改会保存在此设备。')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  }

  await page.reload();
  await expect(page.getByRole('combobox', { name: '主题' })).toHaveValue('spring');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'spring');
  await page.goto('/');
  await expect(page.getByText('估算人生进度（近似）')).toHaveCount(0);
});

test('F-012~F-014：导出、清空和重新导入闭环', async ({ page }) => {
  await completeOnboarding(page);
  await saveRecord(page, '用于验证导入导出的记录');
  await page.goto('/data-management');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出我的数据' }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  if (!downloadPath) {
    throw new Error('导出文件路径不可用');
  }
  const backup = JSON.parse(await readFile(downloadPath, 'utf8')) as { records: unknown[] };
  expect(backup.records).toHaveLength(1);

  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: '清空全部本地数据' }).click();
  await expect(page.getByText(/导出 JSON/)).toBeVisible();
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: '清空全部本地数据' }).click();
  await expect(page.getByText('已清空全部本地数据。')).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/onboarding$/);

  await page.getByRole('button', { name: '开始设置' }).click();
  await page.goto('/data-management');
  await page.locator('input[type="file"]').setInputFiles(downloadPath);
  await expect(page.getByText(/校验通过/)).toBeVisible();
  await page.getByRole('button', { name: /确认导入并覆盖/ }).click();
  await expect(page.getByText(/导入成功：已替换为 1 条记录/)).toBeVisible();
  await page.goto('/history');
  await expect(page.getByText('用于验证导入导出的记录')).toBeVisible();
});

test('F-015~F-016：未知路由、响应式和加载后离线保存', async ({ context, page }) => {
  await completeOnboarding(page);
  await page.goto('/not-found');
  await expect(page).toHaveURL(/\/$/);

  for (const viewport of [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasOverflow).toBe(false);
  }

  await page.goto('/record');
  await context.setOffline(true);
  await page.getByRole('button', { name: '很好' }).click();
  await page.locator('input[type="range"]').fill('8');
  await page.getByRole('textbox', { name: /备注/ }).fill('离线状态保存成功');
  await page.getByRole('button', { name: '保存今日记录' }).click();
  await expect(page.getByText('已保存到本地。今天的记录可继续覆盖更新。')).toBeVisible();
  await context.setOffline(false);
  await page.reload();
  await expect(page.getByRole('textbox', { name: /备注/ })).toHaveValue('离线状态保存成功');
});
