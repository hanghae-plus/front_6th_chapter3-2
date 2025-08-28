import { expect, test } from '@playwright/test';

test.describe('월간 캘린더 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2025-08-15'));
    await page.goto('http://localhost:5173/');
    await page.getByLabel('뷰 타입 선택').click();
    await page.getByRole('option', { name: 'Month' }).click();
    await page.getByText('2025년 8월');
    const headerTexts = await page.locator('thead th').allTextContents();
    expect(headerTexts).toEqual(['일', '월', '화', '수', '목', '금', '토']);
  });

  test('Month 뷰 렌더링', async ({ page }) => {
    await expect(page.locator('tbody')).toContainText('1');
    await expect(page.locator('tbody')).toContainText('31');
  });

  test('휴일 렌더링', async ({ page }) => {
    await page.waitForSelector('text=15');
    await page.waitForSelector('text=광복절');
  });

  test('다음달로 이동', async ({ page }) => {
    await page.getByTestId('ChevronRightIcon').click();
    await page.waitForSelector('text=2025년 9월');
    await page.getByTestId('ChevronRightIcon').click();
    await page.waitForSelector('text=2025년 10월');
  });

  test('이전달로 이동', async ({ page }) => {
    await page.getByTestId('ChevronLeftIcon').click();
    await page.waitForSelector('text=2025년 7월');
    await page.getByTestId('ChevronLeftIcon').click();
    await page.waitForSelector('text=2025년 6월');
  });
});

test.describe('주간 캘린더 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2025-08-15'));
    await page.goto('http://localhost:5173/');
    await page.getByLabel('뷰 타입 선택').click();
    await page.getByRole('option', { name: 'Week' }).click();
    await page.getByText('2025년 8월 2주');
    const headerTexts = await page.locator('thead th').allTextContents();
    expect(headerTexts).toEqual(['일', '월', '화', '수', '목', '금', '토']);
  });

  test('Week 뷰 렌더링', async ({ page }) => {
    await expect(page.locator('tbody')).toContainText('10');
    await expect(page.locator('tbody')).toContainText('16');
  });

  test('휴일 렌더링', async ({ page }) => {
    await page.waitForSelector('text=15');
    await page.waitForSelector('text=광복절');
  });

  test('다음주로 이동', async ({ page }) => {
    await page.getByTestId('ChevronRightIcon').click();
    await page.waitForSelector('text=2025년 8월 3주');
    await page.getByTestId('ChevronRightIcon').click();
    await page.waitForSelector('text=2025년 8월 4주');
  });

  test('이전주로 이동', async ({ page }) => {
    await page.getByTestId('ChevronLeftIcon').click();
    await page.waitForSelector('text=2025년 8월 1주');
    await page.getByTestId('ChevronLeftIcon').click();
    await page.waitForSelector('text=2025년 7월 5주');
  });
});
