import { test, expect, type Page } from '@playwright/test';

test.describe('캘린더 앱 E2E 테스트', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // 애플리케이션으로 이동
    await page.goto('/');

    // 일정 로딩 완료 대기
    await page.waitForSelector('text=일정 로딩 완료!', { timeout: 10000 });
  });

  test('기본 UI 요소들이 정상적으로 표시된다', async ({ page }: { page: Page }) => {
    // 주요 UI 요소들이 표시되는지 확인
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '일정 보기' })).toBeVisible();
    await expect(page.locator('[data-testid="month-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-list"]')).toBeVisible();
    await expect(page.locator('input[placeholder="검색어를 입력하세요"]')).toBeVisible();
  });

  test('일정 폼의 모든 입력 필드가 정상적으로 작동한다', async ({ page }: { page: Page }) => {
    // 일정 폼 입력 테스트
    await page.fill('input[id="title"]', '테스트 회의');
    await page.fill('input[id="date"]', '2025-10-15');
    await page.fill('input[id="start-time"]', '14:00');
    await page.fill('input[id="end-time"]', '15:00');
    await page.fill('input[id="description"]', '테스트 설명');
    await page.fill('input[id="location"]', '테스트 장소');

    // 카테고리 선택
    await page.click('[aria-label="카테고리"]');
    await page.click('li[aria-label="업무-option"]');

    // 입력된 값들이 올바르게 표시되는지 확인
    await expect(page.locator('input[id="title"]')).toHaveValue('테스트 회의');
    await expect(page.locator('input[id="date"]')).toHaveValue('2025-10-15');
    await expect(page.locator('input[id="start-time"]')).toHaveValue('14:00');
    await expect(page.locator('input[id="end-time"]')).toHaveValue('15:00');
    await expect(page.locator('input[id="description"]')).toHaveValue('테스트 설명');
    await expect(page.locator('input[id="location"]')).toHaveValue('테스트 장소');
  });

  test('반복 일정 설정 UI가 정상적으로 작동한다', async ({ page }: { page: Page }) => {
    // 반복 일정 체크박스 클릭
    await page.check('input[type="checkbox"]');

    // 반복 설정 필드들이 나타나는지 확인
    await expect(page.locator('[aria-label="반복 유형"]')).toBeVisible();
    await expect(page.locator('input[type="number"]')).toBeVisible();
    await expect(page.locator('input[id="repeat-end-date"]')).toBeVisible();

    // 반복 유형 선택
    await page.click('[aria-label="반복 유형"]');
    await page.click('li[aria-label="daily-option"]');

    // 간격 설정
    await page.fill('input[type="number"]', '2');

    // 종료일 설정
    await page.fill('input[id="repeat-end-date"]', '2025-10-05');

    // 미리보기가 표시되는지 확인 (일정 정보가 입력되어야 미리보기가 나타남)
    await page.fill('input[id="title"]', '반복 테스트');
    await page.fill('input[id="date"]', '2025-10-01');
    await page.fill('input[id="start-time"]', '09:00');
    await page.fill('input[id="end-time"]', '10:00');

    // 미리보기 확인
    await expect(page.locator('text=개의 반복 일정이 생성됩니다.')).toBeVisible();
  });

  test('뷰 전환이 정상적으로 작동한다', async ({ page }: { page: Page }) => {
    // 기본적으로 월별 뷰가 표시되는지 확인
    await expect(page.locator('[data-testid="month-view"]')).toBeVisible();

    // 주별 뷰로 전환
    await page.click('[aria-label="뷰 타입 선택"]');
    await page.click('li[aria-label="week-option"]');
    await expect(page.locator('[data-testid="week-view"]')).toBeVisible();

    // 월별 뷰로 다시 전환
    await page.click('[aria-label="뷰 타입 선택"]');
    await page.click('li[aria-label="month-option"]');
    await expect(page.locator('[data-testid="month-view"]')).toBeVisible();
  });

  test('달력 네비게이션이 정상적으로 작동한다', async ({ page }: { page: Page }) => {
    // 다음 달로 이동
    await page.click('[aria-label="Next"]');

    // 이전 달로 이동
    await page.click('[aria-label="Previous"]');

    // 월별 뷰가 여전히 표시되는지 확인
    await expect(page.locator('[data-testid="month-view"]')).toBeVisible();
  });

  test('검색 기능이 정상적으로 작동한다', async ({ page }: { page: Page }) => {
    const searchInput = page.locator('input[placeholder="검색어를 입력하세요"]');

    // 검색어 입력
    await searchInput.fill('테스트');
    await expect(searchInput).toHaveValue('테스트');

    // 검색어 지우기
    await searchInput.fill('');
    await expect(searchInput).toHaveValue('');
  });
});
