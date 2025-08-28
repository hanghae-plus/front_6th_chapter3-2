import { test } from '@playwright/test';

test.describe('알림 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('text=일정 로딩 완료!');
  });

  test('알림 테스트', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2025-09-20T17:59:30'));
    await page.waitForSelector('text=일정이 시작됩니다');
  });
});
