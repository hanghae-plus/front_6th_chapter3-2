import { test, expect } from '@playwright/test';

test.describe('CRUD 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('새 일정을 생성할 수 있다', async ({ page }) => {
    // 일정 추가 폼 입력
    await page.locator('#title').fill('CRUD 테스트 일정');
    await page.locator('#date').fill('2025-08-26');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');
    await page.locator('#description').fill('CRUD 테스트를 위한 일정입니다');
    await page.locator('#location').fill('테스트 회의실');

    // 카테고리 선택
    await page.locator('#category').click();
    await page.getByRole('option', { name: '업무' }).click();

    // 일정 저장
    await page.getByTestId('event-submit-button').click();

    // 겹침 모달 처리
    const continueButton = page.getByRole('button', { name: '계속 진행' });
    if (await continueButton.isVisible({ timeout: 2000 })) {
      await continueButton.click();
    }

    // 검색으로 생성된 일정 확인
    await page.locator('#search').fill('CRUD 테스트');
    await expect(page.getByTestId('event-list')).toContainText('CRUD 테스트 일정');
    await expect(page.getByTestId('event-list')).toContainText('2025-08-26');
    await expect(page.getByTestId('event-list')).toContainText('14:00 - 15:00');
  });

  test('일정을 수정할 수 있다', async ({ page }) => {
    // 먼저 수정할 일정 생성
    await page.locator('#title').fill('수정 전 일정');
    await page.locator('#date').fill('2025-08-27');
    await page.locator('#start-time').fill('10:00');
    await page.locator('#end-time').fill('11:00');
    await page.locator('#description').fill('수정 전 설명');

    await page.locator('#category').click();
    await page.getByRole('option', { name: '개인' }).click();

    await page.getByTestId('event-submit-button').click();

    // 겹침 모달 처리
    const continueButton = page.getByRole('button', { name: '계속 진행' });
    if (await continueButton.isVisible({ timeout: 2000 })) {
      await continueButton.click();
    }

    // 생성된 일정 검색
    await page.locator('#search').fill('수정 전 일정');
    await expect(page.getByTestId('event-list')).toContainText('수정 전 일정');

    // 일정 수정 버튼 클릭
    await page.getByTestId('event-list').getByText('수정').click();

    // 수정 폼에 새 데이터 입력
    await page.locator('#title').fill('수정 후 일정');
    await page.locator('#description').fill('수정된 설명입니다');
    await page.locator('#start-time').fill('11:00');
    await page.locator('#end-time').fill('12:00');

    // 수정 저장
    await page.getByTestId('event-submit-button').click();

    // 겹침 모달 처리
    if (await continueButton.isVisible({ timeout: 2000 })) {
      await continueButton.click();
    }

    // 수정된 일정 확인
    await page.locator('#search').fill('수정 후 일정');
    await expect(page.getByTestId('event-list')).toContainText('수정 후 일정');
    await expect(page.getByTestId('event-list')).toContainText('11:00 - 12:00');
  });

  test('일정을 삭제할 수 있다', async ({ page }) => {
    // 먼저 삭제할 일정 생성
    await page.locator('#title').fill('삭제 테스트 일정');
    await page.locator('#date').fill('2025-08-28');
    await page.locator('#start-time').fill('16:00');
    await page.locator('#end-time').fill('17:00');

    await page.locator('#category').click();
    await page.getByRole('option', { name: '개인' }).click();

    await page.getByTestId('event-submit-button').click();

    // 겹침 모달 처리
    const continueButton = page.getByRole('button', { name: '계속 진행' });
    if (await continueButton.isVisible({ timeout: 2000 })) {
      await continueButton.click();
    }

    // 생성된 일정 검색 및 확인
    await page.locator('#search').fill('삭제 테스트');
    await expect(page.getByTestId('event-list')).toContainText('삭제 테스트 일정');

    // 삭제 버튼 클릭
    await page.getByTestId('event-list').getByText('삭제').click();

    // 삭제 후 검색 결과 확인
    await page.locator('#search').fill('삭제 테스트');
    await expect(page.getByText('검색 결과가 없습니다.')).toBeVisible();
  });

  test('일정을 검색할 수 있다', async ({ page }) => {
    // 기존 일정 검색
    await page.locator('#search').fill('팀 회의');
    await expect(page.getByTestId('event-list')).toContainText('팀 회의');

    // 부분 검색
    await page.locator('#search').fill('회의');
    await expect(page.getByTestId('event-list')).toContainText('팀 회의');

    // 존재하지 않는 일정 검색
    await page.locator('#search').fill('존재하지않는일정12345');
    await expect(page.getByText('검색 결과가 없습니다.')).toBeVisible();

    // 검색 초기화
    await page.locator('#search').fill('');
    await expect(page.getByTestId('event-list')).toBeVisible();
  });

  test('카테고리별로 일정을 생성할 수 있다', async ({ page }) => {
    const categories = ['업무', '개인', '가족', '기타'];

    for (const category of categories) {
      // 카테고리별 일정 생성
      await page.locator('#title').fill(`${category} 카테고리 테스트`);
      await page.locator('#date').fill('2025-08-29');
      await page.locator('#start-time').fill(`${10 + categories.indexOf(category)}:00`);
      await page.locator('#end-time').fill(`${11 + categories.indexOf(category)}:00`);

      await page.locator('#category').click();
      await page.getByRole('option', { name: category }).click();

      await page.getByTestId('event-submit-button').click();

      // 겹침 모달 처리
      const continueButton = page.getByRole('button', { name: '계속 진행' });
      if (await continueButton.isVisible({ timeout: 2000 })) {
        await continueButton.click();
      }

      // 생성된 일정 확인
      await page.locator('#search').fill(`${category} 카테고리`);
      await expect(page.getByTestId('event-list')).toContainText(`${category} 카테고리 테스트`);

      // 검색 초기화
      await page.locator('#search').fill('');
    }
  });
});
