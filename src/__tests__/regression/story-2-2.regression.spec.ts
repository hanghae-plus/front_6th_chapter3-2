import { describe, it, expect, vi, beforeAll } from 'vitest';

import type { RepeatInfo } from '../../types';
import { calculateRepeatingDates, validateRepeatSettings } from '../../utils/repeatingEventUtils';

beforeAll(() => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  vi.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
});

describe('Regression - Story 2.2', () => {
  it('기존 반복 계산 로직이 excludeDates 추가 후에도 동일하게 동작한다', () => {
    const base: RepeatInfo = { type: 'daily', interval: 1, endDate: '2024-01-05' };
    const before = calculateRepeatingDates(base, '2024-01-01');

    const after = calculateRepeatingDates({ ...base, excludeDates: [] }, '2024-01-01');
    expect(after).toEqual(before);
  });

  it('excludeDates에 포함된 날짜만 정확히 제외된다', () => {
    const repeatInfo: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: '2024-01-05',
      excludeDates: ['2024-01-03'],
    };
    const dates = calculateRepeatingDates(repeatInfo, '2024-01-01');
    expect(dates).toEqual(['2024-01-01', '2024-01-02', '2024-01-04', '2024-01-05']);
  });

  it('유효성 검증은 interval 범위(1-99)와 타입만 영향을 받으며 excludeDates는 통과에 영향 주지 않는다', () => {
    expect(
      validateRepeatSettings({
        type: 'daily',
        interval: 1,
        endDate: '2024-01-10',
        excludeDates: ['2024-01-02'],
      })
    ).toBe(true);
  });
});
