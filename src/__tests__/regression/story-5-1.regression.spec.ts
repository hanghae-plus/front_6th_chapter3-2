import { describe, it, expect, vi, beforeAll } from 'vitest';

import type { RepeatInfo } from '../../types';
import { calculateRepeatingDates } from '../../utils/repeatingEventUtils';

beforeAll(() => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  vi.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
});

describe('Regression - Story 5.1 (월/연 경계 규칙)', () => {
  it('월 31일 시작 시 31일이 없는 달은 생성하지 않는다', () => {
    const info: RepeatInfo = { type: 'monthly', interval: 1, endDate: '2024-05-31' };
    const result = calculateRepeatingDates(info, '2024-01-31');
    expect(result).toEqual(['2024-01-31', '2024-03-31', '2024-05-31']);
  });

  it('연 2/29 시작 시 비윤년에는 생성하지 않는다', () => {
    const info: RepeatInfo = { type: 'yearly', interval: 1, endDate: '2030-12-31' };
    const result = calculateRepeatingDates(info, '2024-02-29');
    expect(result).toEqual(['2024-02-29', '2028-02-29']);
  });
});
