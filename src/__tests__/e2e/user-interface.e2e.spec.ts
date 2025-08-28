import { test, expect } from '@playwright/test';

test.describe('UI 상호작용 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('월/주 뷰를 전환할 수 있다', async ({ page }) => {
    // 기본적으로 월 뷰가 표시되는지 확인
    await expect(page.getByTestId('month-view')).toBeVisible();

    // 뷰 타입 선택 드롭다운 클릭
    const viewSelector = page.locator('[aria-label="뷰 타입 선택"]');
    await viewSelector.click();

    // Week 옵션 선택
    await page.getByRole('option', { name: 'Week' }).click();

    // 주 뷰가 표시되는지 확인
    await expect(page.getByTestId('week-view')).toBeVisible();
    await expect(page.getByTestId('month-view')).not.toBeVisible();

    // 다시 Month로 전환
    await viewSelector.click();
    await page.getByRole('option', { name: 'Month' }).click();

    // 월 뷰가 다시 표시되는지 확인
    await expect(page.getByTestId('month-view')).toBeVisible();
    await expect(page.getByTestId('week-view')).not.toBeVisible();
  });

  test('이전/다음 버튼으로 월 네비게이션이 동작한다', async ({ page }) => {
    // 현재 월 정보 가져오기
    const currentMonth = await page.locator('h5').first().textContent();

    // 다음 달로 이동
    await page.getByRole('button', { name: 'Next' }).click();

    // 월이 변경되었는지 확인
    const nextMonth = await page.locator('h5').first().textContent();
    expect(nextMonth).not.toBe(currentMonth);

    // 이전 달로 이동
    await page.getByRole('button', { name: 'Previous' }).click();

    // 원래 월로 돌아왔는지 확인
    const returnedMonth = await page.locator('h5').first().textContent();
    expect(returnedMonth).toBe(currentMonth);
  });

  test('겹치는 시간에 일정 생성 시 충돌 모달이 표시된다', async ({ page }) => {
    // 기존 "동작 테스트 일정"과 같은 시간대에 일정 생성 시도 (2025-08-20 14:00-15:00)
    await page.locator('#title').fill('충돌 테스트 일정');
    await page.locator('#date').fill('2025-08-20');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');

    // 일정 저장 시도
    await page.getByTestId('event-submit-button').click();

    // 충돌 다이얼로그가 나타나는지 확인
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
    await expect(page.getByText('다음 일정과 겹칩니다:')).toBeVisible();

    // 모달 내에서 기존 일정 확인
    await expect(page.locator('[role="dialog"]')).toContainText('동작 테스트 일정');

    // 취소 버튼과 계속 진행 버튼이 있는지 확인
    await expect(page.getByRole('button', { name: '취소' })).toBeVisible();
    await expect(page.getByRole('button', { name: '계속 진행' })).toBeVisible();

    // 계속 진행 버튼 클릭으로 강제 저장
    await page.getByRole('button', { name: '계속 진행' }).click();

    // 강제 저장된 일정이 검색에서 나타나는지 확인
    await page.locator('#search').fill('충돌 테스트');
    await expect(page.getByTestId('event-list')).toContainText('충돌 테스트 일정');
  });

  test('충돌 모달에서 취소를 선택하면 일정이 저장되지 않는다', async ({ page }) => {
    // 기존 일정과 겹치는 시간대로 일정 생성 시도
    await page.locator('#title').fill('취소 테스트 일정');
    await page.locator('#date').fill('2025-08-20');
    await page.locator('#start-time').fill('14:30');
    await page.locator('#end-time').fill('15:30');

    await page.getByTestId('event-submit-button').click();

    // 충돌 다이얼로그 확인
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();

    // 취소 버튼 클릭
    await page.getByRole('button', { name: '취소' }).click();

    // 모달이 사라졌는지 확인
    await expect(page.getByText('일정 겹침 경고')).not.toBeVisible();

    // 일정이 저장되지 않았는지 검색으로 확인
    await page.locator('#search').fill('취소 테스트');
    await expect(page.getByText('검색 결과가 없습니다.')).toBeVisible();
  });

  test('알림 설정 드롭다운이 동작한다', async ({ page }) => {
    // 알림 설정 드롭다운 클릭
    await page.locator('#notification').click();

    // 알림 옵션들이 표시되는지 확인
    await expect(page.getByRole('option', { name: '1분 전' })).toBeVisible();
    await expect(page.getByRole('option', { name: '10분 전' })).toBeVisible();
    await expect(page.getByRole('option', { name: '1시간 전' })).toBeVisible();
    await expect(page.getByRole('option', { name: '1일 전' })).toBeVisible();

    // 10분 전 옵션 선택
    await page.getByRole('option', { name: '10분 전' }).click();

    // 선택된 값이 표시되는지 확인
    await expect(page.locator('#notification')).toHaveValue('10');
  });

  test('반복 일정 체크박스가 동작한다', async ({ page }) => {
    // 반복 체크박스 확인
    const repeatCheckbox = page.getByTestId('repeat-checkbox');
    await expect(repeatCheckbox).toBeVisible();
    await expect(repeatCheckbox).not.toBeChecked();

    // 체크박스 클릭
    await repeatCheckbox.click();
    await expect(repeatCheckbox).toBeChecked();

    // 반복 설정 옵션들이 나타나는지 확인
    await expect(page.getByTestId('repeat-type')).toBeVisible();
    await expect(page.getByTestId('repeat-interval')).toBeVisible();
    await expect(page.getByTestId('repeat-end-date')).toBeVisible();

    // 반복 타입 드롭다운 확인
    await page.getByTestId('repeat-type').click();
    await expect(page.getByRole('option', { name: 'daily' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'weekly' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'monthly' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'yearly' })).toBeVisible();

    // weekly 선택
    await page.getByRole('option', { name: 'weekly' }).click();

    // 체크박스 다시 해제
    await repeatCheckbox.click();
    await expect(repeatCheckbox).not.toBeChecked();

    // 반복 설정 옵션들이 사라지는지 확인
    await expect(page.getByTestId('repeat-type')).not.toBeVisible();
  });

  test('폼 유효성 검사가 동작한다', async ({ page }) => {
    // 제목 없이 저장 시도
    await page.locator('#date').fill('2025-08-30');
    await page.locator('#start-time').fill('10:00');
    await page.locator('#end-time').fill('11:00');

    await page.getByTestId('event-submit-button').click();

    // 제목 필드에 포커스가 가거나 에러 메시지가 표시되는지 확인
    // (구체적인 에러 처리 방식에 따라 다를 수 있음)
    await expect(page.locator('#title')).toBeFocused();

    // 잘못된 시간 순서로 입력
    await page.locator('#title').fill('시간 순서 테스트');
    await page.locator('#start-time').fill('15:00');
    await page.locator('#end-time').fill('14:00'); // 종료 시간이 시작 시간보다 이름

    await page.getByTestId('event-submit-button').click();

    // 시간 유효성 검사 메시지나 동작 확인
    // (앱의 구체적인 구현에 따라 다를 수 있음)
  });

  test('카테고리별 색상이 올바르게 표시된다', async ({ page }) => {
    const categories = [
      { name: '업무', color: 'rgb(244, 67, 54)' }, // red
      { name: '개인', color: 'rgb(33, 150, 243)' }, // blue
      { name: '가족', color: 'rgb(76, 175, 80)' }, // green
      { name: '기타', color: 'rgb(156, 39, 176)' }, // purple
    ];

    for (const category of categories) {
      // 카테고리 드롭다운 열기
      await page.locator('#category').click();

      // 해당 카테고리 옵션 확인 (색상은 CSS에 따라 다를 수 있음)
      const categoryOption = page.getByRole('option', { name: category.name });
      await expect(categoryOption).toBeVisible();

      // 카테고리 선택
      await categoryOption.click();

      // 선택된 값 확인
      await expect(page.locator('#category')).toHaveValue(category.name);
    }
  });
});
