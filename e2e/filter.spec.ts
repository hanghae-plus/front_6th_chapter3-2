import { expect, test } from '@playwright/test';

test.describe('이벤트 필터링 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('text=일정 로딩 완료!');
  });

  test('검색어 테스트', async ({ page }) => {
    const eventList = await page.getByTestId('event-list');

    await eventList.getByLabel('일정 검색').fill('아무런 키워드로 검색하기');
    await expect(eventList.getByText('검색 결과가 없습니다.')).toBeVisible();

    await eventList.getByLabel('일정 검색').fill('동료와 점심 식사');
    await expect(eventList.getByText('점심 약속')).toBeVisible();
    await expect(eventList.getByText('2025-08-21')).toBeVisible();
    await expect(eventList.getByText('12:30 - 13:30')).toBeVisible();
    await expect(eventList.getByText('동료와 점심 식사')).toBeVisible();
    await expect(eventList.getByText('회사 근처 식당')).toBeVisible();
    await expect(eventList.getByText('개인')).toBeVisible();
  });
});
