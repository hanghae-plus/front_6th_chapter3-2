import { formatDate } from '../../utils/dateUtils.ts';

describe('반복 일정 Unit Test', () => {
  it('해가 윤년이라면 true를 반환한다.', () => {
    const date = new Date('2024-02-29');
    const isLeapYear = isLeapYear(date);
    expect(isLeapYear).toBe(true);
  });

  it('종료일 미지정/상한 초과 시 2025-10-30으로 반영한다.', () => {
    expect(formatDate(fixEndDate())).toBe('2025-10-30');
    expect(formatDate(fixEndDate('2025-10-15'))).toBe('2025-10-15');
    expect(formatDate(fixEndDate('2026-01-01'))).toBe('2025-10-30');
    expect(formatDate(REPEAT_MAX_END_DATE)).toBe('2025-10-30');
  });
});
