import { describe, it, expect, vi, beforeAll } from 'vitest';

import type { RepeatInfo } from '../../types';
import { calculateRepeatingDates } from '../../utils/repeatingEventUtils';

beforeAll(() => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  vi.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
});

describe('Regression - Story 5.2 (EndDate Cap/10회 제한)', () => {
  it('종료일 미지정 시 2025-10-30을 넘지 않는다', () => {
    const info: RepeatInfo = { type: 'daily', interval: 1 };
    const result = calculateRepeatingDates(info, '2025-10-25');
    expect(result).toEqual([
      '2025-10-25',
      '2025-10-26',
      '2025-10-27',
      '2025-10-28',
      '2025-10-29',
      '2025-10-30',
    ]);
  });

  it('종료일 미지정 시 최대 10회 제한이 적용된다', () => {
    const info: RepeatInfo = { type: 'weekly', interval: 1, weekdays: [1, 3] };
    const result = calculateRepeatingDates(info, '2024-01-01');
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it('종료일 지정 시 상한 미적용 및 개수 제한 미적용', () => {
    const info: RepeatInfo = { type: 'daily', interval: 1, endDate: '2025-11-05' };
    const result = calculateRepeatingDates(info, '2025-10-25');
    expect(result).toEqual([
      '2025-10-25',
      '2025-10-26',
      '2025-10-27',
      '2025-10-28',
      '2025-10-29',
      '2025-10-30',
      '2025-10-31',
      '2025-11-01',
      '2025-11-02',
      '2025-11-03',
      '2025-11-04',
      '2025-11-05',
    ]);
  });
});
