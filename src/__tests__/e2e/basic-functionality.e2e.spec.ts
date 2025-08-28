import { test, expect } from '@playwright/test';

test.describe('스모크 테스트 - 기본 기능 검증', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('페이지가 로드되고 기본 요소들이 표시된다', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/일정관리 앱으로 학습하는 테스트 코드/);

    // 기본 헤딩 요소들 확인
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '일정 보기' })).toBeVisible();

    // 네비게이션 버튼들 확인
    await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  });

  test('새 일정을 빠르게 생성할 수 있다', async ({ page }) => {
    // 기본 폼 입력 (겹치지 않는 시간대)
    await page.locator('#title').fill('스모크 테스트 일정');
    await page.locator('#date').fill('2025-08-25');
    await page.locator('#start-time').fill('09:00');
    await page.locator('#end-time').fill('10:00');

    // 카테고리 선택
    await page.locator('#category').click();
    await page.getByRole('option', { name: '개인' }).click();

    // 일정 저장
    await page.getByTestId('event-submit-button').click();

    // 겹침 모달 처리 (만약 나타나면)
    const continueButton = page.getByRole('button', { name: '계속 진행' });
    if (await continueButton.isVisible({ timeout: 2000 })) {
      await continueButton.click();
    }

    // 검색으로 생성 확인
    await page.locator('#search').fill('스모크 테스트');
    await expect(page.getByTestId('event-list')).toContainText('스모크 테스트 일정');
  });

  test('검색 기능이 기본적으로 동작한다', async ({ page }) => {
    // 기존 일정 검색
    await page.locator('#search').fill('팀 회의');
    await expect(page.getByTestId('event-list')).toContainText('팀 회의');

    // 빈 검색어로 초기화
    await page.locator('#search').fill('');
  });

  test('월 뷰가 기본으로 표시된다', async ({ page }) => {
    // 기본 월 뷰 확인
    await expect(page.getByTestId('month-view')).toBeVisible();
  });
});
