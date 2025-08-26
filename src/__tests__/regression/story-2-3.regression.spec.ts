import { describe, it, expect, vi, beforeAll } from 'vitest';

import type { RepeatInfo } from '../../types';
import { calculateRepeatingDates } from '../../utils/repeatingEventUtils';

beforeAll(() => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  vi.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
});

describe('Regression - Story 2.3', () => {
  it('weekday 기능 추가 이후에도 기본 주간/월간/연간 로직은 동일하게 동작한다', () => {
    // Given
    const baseWeekly: RepeatInfo = { type: 'weekly', interval: 1, endDate: '2024-01-29' };
    const baseMonthly: RepeatInfo = { type: 'monthly', interval: 1, endDate: '2024-04-01' };
    const baseYearly: RepeatInfo = { type: 'yearly', interval: 1, endDate: '2026-01-01' };

    // When
    const weekly = calculateRepeatingDates(baseWeekly, '2024-01-01');
    const monthly = calculateRepeatingDates(baseMonthly, '2024-01-01');
    const yearly = calculateRepeatingDates(baseYearly, '2024-01-01');

    // Then
    expect(weekly).toEqual(['2024-01-01', '2024-01-08', '2024-01-15', '2024-01-22', '2024-01-29']);
    expect(monthly).toEqual(['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01']);
    expect(yearly).toEqual(['2024-01-01', '2025-01-01', '2026-01-01']);
  });

  it('weekday 미지정 시 주간 반복은 기존과 동일하고, 지정 시 선택 요일로만 제한된다', () => {
    // Given
    const noWeekdays: RepeatInfo = { type: 'weekly', interval: 1, endDate: '2024-01-15' };
    const withWeekdays: RepeatInfo = {
      type: 'weekly',
      interval: 1,
      endDate: '2024-01-15',
      weekdays: [1, 3], // Mon, Wed
    };

    // When
    const resultNo = calculateRepeatingDates(noWeekdays, '2024-01-01');
    const resultWith = calculateRepeatingDates(withWeekdays, '2024-01-01');

    // Then
    expect(resultNo).toEqual(['2024-01-01', '2024-01-08', '2024-01-15']);
    expect(resultWith).toEqual([
      '2024-01-01',
      '2024-01-03',
      '2024-01-08',
      '2024-01-10',
      '2024-01-15',
    ]);
  });

  it('격주(2주) 간격에서도 선택 요일만 유지된다', () => {
    // Given
    const info: RepeatInfo = {
      type: 'weekly',
      interval: 2,
      endDate: '2024-02-12',
      weekdays: [1, 4], // Mon, Thu
    };

    // When
    const result = calculateRepeatingDates(info, '2024-01-01'); // Tue (시작)

    // Then
    expect(result).toEqual([
      '2024-01-01',
      '2024-01-04',
      '2024-01-15',
      '2024-01-18',
      '2024-01-29',
      '2024-02-01',
      '2024-02-12',
    ]);
  });

  it('종료일이 없을 때 최대 10회 제한이 유지된다 (weekday 조합 포함)', () => {
    // Given
    const info: RepeatInfo = { type: 'weekly', interval: 1, weekdays: [1, 3] };

    // When
    const result = calculateRepeatingDates(info, '2024-01-01');

    // Then
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it('excludeDates와 요일 선택이 함께 설정돼도 일관되게 필터링된다', () => {
    // Given
    const info: RepeatInfo = {
      type: 'weekly',
      interval: 1,
      endDate: '2024-01-15',
      weekdays: [1, 3],
      excludeDates: ['2024-01-10'], // 수
    };

    // When
    const result = calculateRepeatingDates(info, '2024-01-01');

    // Then
    expect(result).toEqual(['2024-01-01', '2024-01-03', '2024-01-08', '2024-01-15']);
  });
});
