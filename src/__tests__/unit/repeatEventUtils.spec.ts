import { formatDate } from '../../utils/dateUtils.ts';
import { isLeapYear, fixEndDate, REPEAT_MAX_END_DATE } from '../../utils/repeatUtils.ts';

describe('반복 일정 Unit Test', () => {
  it('해가 윤년이라면 true를 반환한다.', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
  });

  it('종료일 미지정/상한 초과 시 2025-10-30으로 반영한다.', () => {
    expect(formatDate(fixEndDate())).toBe('2025-10-30');
    expect(formatDate(fixEndDate('2025-10-15'))).toBe('2025-10-15');
    expect(formatDate(fixEndDate('2026-01-01'))).toBe('2025-10-30');
    expect(formatDate(REPEAT_MAX_END_DATE)).toBe('2025-10-30');
  });
});
