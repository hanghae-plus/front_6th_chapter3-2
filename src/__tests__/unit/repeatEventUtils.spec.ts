import { formatDate } from '../../utils/dateUtils.ts';
import {
  isLeapYear,
  fixEndDate,
  REPEAT_MAX_END_DATE,
  generateDailyDates,
  generateWeeklyDates,
} from '../../utils/repeatUtils.ts';

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

  it('일정 날짜 구하기 - 일 단위로 날짜를 반환한다.', () => {
    const startDate = '2025-10-28';
    const endDate = '2025-10-30';
    const dates = generateDailyDates(startDate, endDate);
    expect(dates).toEqual(['2025-10-28', '2025-10-29', '2025-10-30']);
  });

  it('일정 날짜 구하기 - 주 단위로 날짜를 반환한다.', () => {
    const startDate = '2025-10-10';
    const endDate = '2025-10-30';
    const dates = generateWeeklyDates(startDate, endDate);
    expect(dates).toEqual(['2025-10-10', '2025-10-17', '2025-10-24']);
  });

  it('일정 날짜 구하기 - 월 단위로 날짜를 반환한다.', () => {
    const datesWith31 = generateMonthlyDates('2025-08-31', '2025-11-30');
    expect(datesWith31).toEqual(['2025-08-31', '2025-10-31']);
    expect(datesWith31).toHaveLength(2);
    expect(datesWith31).not.toContain('2025-09-30');
    expect(datesWith31).not.toContain('2025-11-30');

    const datesWith30 = generateMonthlyDates('2025-04-30', '2025-06-30');
    expect(datesWith30).toEqual(['2025-04-30', '2025-05-30', '2025-06-30']);
    expect(datesWith30).toContain('2025-05-30');
    expect(datesWith30).not.toContain('2025-05-31');
  });

  it('일정 날짜 구하기 - 연 단위로 날짜를 반환한다.', () => {
    const datesWithLeap = generateYearlyDates('2024-02-29', '2030-12-31');
    expect(datesWithLeap).toEqual(['2024-02-29', '2028-02-29']);
    expect(datesWithLeap).toHaveLength(2);
    expect(datesWithLeap).not.toContain('2025-02-29');
    expect(datesWithLeap).not.toContain('2026-02-29');

    const datesWithoutLeap = generateYearlyDates('2025-02-28', '2027-03-01');
    expect(datesWithoutLeap).toEqual(['2025-02-28', '2026-02-28', '2027-02-28']);
    expect(datesWithoutLeap).toContain('2026-02-28');
  });
});
