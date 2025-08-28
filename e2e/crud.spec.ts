import { test } from '@playwright/test';

test.describe('CRUD 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('text=일정 로딩 완료!');
  });

  test('일정 추가', async ({ page }) => {
    await page.getByRole('textbox', { name: '제목' }).fill('새 회의');
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-05-19');
    await page.getByRole('textbox', { name: '시작 시간' }).fill('10:00');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('11:00');
    await page.getByRole('textbox', { name: '설명' }).fill('설명');
    await page.getByRole('textbox', { name: '위치' }).fill('위치');
    await page.getByTestId('event-submit-button').click();
    await page.waitForSelector('text=일정이 추가되었습니다.');
  });

  test('반복 일정 추가', async ({ page }) => {
    await page.getByRole('textbox', { name: '제목' }).fill('새 회의');
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-05-20');
    await page.getByRole('textbox', { name: '시작 시간' }).fill('10:00');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('11:00');
    await page.getByRole('textbox', { name: '설명' }).fill('설명');
    await page.getByRole('textbox', { name: '위치' }).fill('위치');
    await page.getByLabel('반복 일정').check();
    await page.getByTestId('repeat-type-select').click();
    await page.getByRole('option', { name: '매일' }).click();
    await page.getByRole('spinbutton', { name: '반복 간격' }).fill('2');
    await page.getByRole('textbox', { name: '반복 종료일' }).fill('2025-05-25');
    await page.getByTestId('event-submit-button').click();
    await page.waitForSelector('text=일정이 추가되었습니다.');
  });

  test('일정 수정', async ({ page }) => {
    await page.getByLabel('Edit event').first().click();
    await page.getByRole('textbox', { name: '제목' }).fill('수정된 회의');
    await page.getByRole('textbox', { name: '설명' }).fill('수정된 회의');
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-09-20');
    await page.getByTestId('event-submit-button').click();
    await page.waitForSelector('text=일정이 수정되었습니다.');
  });

  test('일정 삭제', async ({ page }) => {
    await page.getByLabel('Delete event').last().click();
    await page.waitForSelector('text=일정이 삭제되었습니다.');
  });

  test('필수 정보 누락', async ({ page }) => {
    await page.getByRole('button', { name: '추가' }).click();
    await page.waitForSelector('text=필수 정보를 모두 입력해주세요.');
  });

  test('시간 설정 오류', async ({ page }) => {
    await page.getByRole('textbox', { name: '시작 시간' }).fill('11:00');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('10:00');
    await page.getByTestId('event-submit-button').click();
    await page.waitForSelector('text=시작 시간은 종료 시간보다 빨라야 합니다');
    await page.waitForSelector('text=종료 시간은 시작 시간보다 늦어야 합니다');
  });

  test('중복 일정 -> 취소', async ({ page }) => {
    await page.getByRole('textbox', { name: '제목' }).fill('새 회의');
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-08-28');
    await page.getByRole('textbox', { name: '시작 시간' }).fill('19:00');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('22:00');
    await page.getByRole('textbox', { name: '설명' }).fill('설명');
    await page.getByRole('textbox', { name: '위치' }).fill('위치');
    await page.getByTestId('event-submit-button').click();
    await page.waitForSelector('text=일정 겹침 경고');
    await page.getByRole('button', { name: '취소' }).click();
    await page.waitForSelector('text=일정 겹침 경고', { state: 'hidden' });
    await page.waitForSelector('text=일정이 추가되었습니다.', { state: 'hidden' });
  });

  test('중복 일정 -> 저장', async ({ page }) => {
    await page.getByRole('textbox', { name: '제목' }).fill('새 회의');
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-08-28');
    await page.getByRole('textbox', { name: '시작 시간' }).fill('19:00');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('22:00');
    await page.getByRole('textbox', { name: '설명' }).fill('설명');
    await page.getByRole('textbox', { name: '위치' }).fill('위치');
    await page.getByTestId('event-submit-button').click();
    await page.waitForSelector('text=일정 겹침 경고');
    await page.getByRole('button', { name: '계속 진행' }).click();
    await page.waitForSelector('text=일정 겹침 경고', { state: 'hidden' });
    await page.waitForSelector('text=일정이 추가되었습니다.');
  });
});
