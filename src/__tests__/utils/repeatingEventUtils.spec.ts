import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

// eslint-disable-next-line import/order
import type { RepeatInfo, Event } from '../../types';

beforeAll(() => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  vi.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
});

afterAll(() => {
  vi.restoreAllMocks();
});

import {
  calculateRepeatingDates,
  validateRepeatSettings,
  generateEventInstances,
} from '../../utils/repeatingEventUtils';

// 테스트에서 사용할 mock 데이터
const mockEvent: Event = {
  id: '1',
  title: '테스트 이벤트',
  date: '2024-03-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '테스트 설명',
  location: '테스트 장소',
  category: '회의',
  repeat: {
    type: 'none',
    interval: 1,
  },
  notificationTime: 30,
};

describe('calculateRepeatingDates', () => {
  it('should calculate daily repeating dates correctly', () => {
    const repeatInfo: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: '2024-03-20',
    };

    const result = calculateRepeatingDates(repeatInfo, '2024-03-15');

    expect(result).toEqual([
      '2024-03-15',
      '2024-03-16',
      '2024-03-17',
      '2024-03-18',
      '2024-03-19',
      '2024-03-20',
    ]);
  });

  it('should calculate weekly repeating dates correctly', () => {
    const repeatInfo: RepeatInfo = {
      type: 'weekly',
      interval: 1,
      endDate: '2024-04-05',
    };

    const result = calculateRepeatingDates(repeatInfo, '2024-03-15');

    expect(result).toEqual(['2024-03-15', '2024-03-22', '2024-03-29', '2024-04-05']);
  });

  it('should calculate monthly repeating dates correctly', () => {
    const repeatInfo: RepeatInfo = {
      type: 'monthly',
      interval: 1,
      endDate: '2024-06-15',
    };

    const result = calculateRepeatingDates(repeatInfo, '2024-03-15');

    expect(result).toEqual(['2024-03-15', '2024-04-15', '2024-05-15', '2024-06-15']);
  });

  it('should calculate yearly repeating dates correctly', () => {
    const repeatInfo: RepeatInfo = {
      type: 'yearly',
      interval: 1,
      endDate: '2026-03-15',
    };

    const result = calculateRepeatingDates(repeatInfo, '2024-03-15');

    expect(result).toEqual(['2024-03-15', '2025-03-15', '2026-03-15']);
  });

  it('should handle interval greater than 1', () => {
    const repeatInfo: RepeatInfo = {
      type: 'daily',
      interval: 2,
      endDate: '2024-03-20',
    };

    const result = calculateRepeatingDates(repeatInfo, '2024-03-15');

    expect(result).toEqual(['2024-03-15', '2024-03-17', '2024-03-19']);
  });

  it('should return only start date for non-repeating events', () => {
    const repeatInfo: RepeatInfo = {
      type: 'none',
      interval: 1,
    };

    const result = calculateRepeatingDates(repeatInfo, '2024-03-15');

    expect(result).toEqual(['2024-03-15']);
  });

  it('should exclude dates listed in excludeDates', () => {
    const repeatInfo: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: '2024-01-05',
      excludeDates: ['2024-01-03'],
    };

    const result = calculateRepeatingDates(repeatInfo, '2024-01-01');

    expect(result).toEqual(['2024-01-01', '2024-01-02', '2024-01-04', '2024-01-05']);
  });

  it('should filter weekly dates by selected weekdays', () => {
    const repeatInfo: RepeatInfo = {
      type: 'weekly',
      interval: 1,
      endDate: '2024-02-05',
      weekdays: [1, 3], // Mon, Wed
    };

    const result = calculateRepeatingDates(repeatInfo, '2024-01-29'); // Mon

    expect(result).toEqual(['2024-01-29', '2024-01-31', '2024-02-05']);
  });

  it('should skip months without 31 when starting on 31st (monthly)', () => {
    const repeatInfo: RepeatInfo = {
      type: 'monthly',
      interval: 1,
      endDate: '2024-05-31',
    };

    const result = calculateRepeatingDates(repeatInfo, '2024-01-31');

    expect(result).toEqual(['2024-01-31', '2024-03-31', '2024-05-31']);
  });

  it('should generate only leap-year instances when starting on Feb 29 (yearly)', () => {
    const repeatInfo: RepeatInfo = {
      type: 'yearly',
      interval: 1,
      endDate: '2030-12-31',
    };

    const result = calculateRepeatingDates(repeatInfo, '2024-02-29');

    expect(result).toEqual(['2024-02-29', '2028-02-29']);
  });

  it('should cap generation at 2025-10-30 when endDate is missing', () => {
    const repeatInfo: RepeatInfo = {
      type: 'daily',
      interval: 1,
    };

    const result = calculateRepeatingDates(repeatInfo, '2025-10-25');

    expect(result).toEqual([
      '2025-10-25',
      '2025-10-26',
      '2025-10-27',
      '2025-10-28',
      '2025-10-29',
      '2025-10-30',
    ]);
  });

  it('should not cap when endDate is provided (uses provided endDate even if later than cap)', () => {
    const repeatInfo: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: '2025-11-05',
    };

    const result = calculateRepeatingDates(repeatInfo, '2025-10-25');

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

describe('validateRepeatSettings', () => {
  it('should validate valid repeat settings', () => {
    const validSettings: RepeatInfo[] = [
      { type: 'none', interval: 1 },
      { type: 'daily', interval: 1, endDate: '2024-01-10' },
      { type: 'weekly', interval: 2, endDate: '2024-02-01' },
      { type: 'monthly', interval: 1, endDate: '2024-04-01' },
      { type: 'yearly', interval: 1, endDate: '2025-01-01' },
    ];

    validSettings.forEach((settings) => {
      const result = validateRepeatSettings(settings);
      if (!result) {
        console.log('Failed settings:', settings);
      }
      expect(result).toBe(true);
    });
  });

  it('should invalidate settings with invalid type', () => {
    // 잘못된 타입을 테스트하기 위한 객체
    const invalidSettings = {
      type: 'invalid-type' as const,
      interval: 1,
      endDate: '2024-03-20',
    } as const;

    expect(validateRepeatSettings(invalidSettings as unknown as RepeatInfo)).toBe(false);
  });

  it('should invalidate settings with invalid interval', () => {
    const invalidSettings: RepeatInfo[] = [
      { type: 'daily', interval: 0, endDate: '2024-03-20' },
      { type: 'weekly', interval: -1, endDate: '2024-03-20' },
    ];

    invalidSettings.forEach((settings) => {
      expect(validateRepeatSettings(settings)).toBe(false);
    });
  });

  it('should invalidate settings with invalid end date format', () => {
    const invalidSettings: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: 'invalid-date',
    };

    expect(validateRepeatSettings(invalidSettings)).toBe(false);
  });

  it('should invalidate settings with end date before current date', () => {
    const invalidSettings: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: '2020-01-01', // 과거 날짜
    };

    expect(validateRepeatSettings(invalidSettings)).toBe(false);
  });

  it('should invalidate when excludeDates has invalid format or duplicates or out of range', () => {
    expect(
      validateRepeatSettings({
        type: 'daily',
        interval: 1,
        endDate: '2024-01-10',
        excludeDates: ['invalid'],
      } as unknown as RepeatInfo)
    ).toBe(false);

    expect(
      validateRepeatSettings({
        type: 'daily',
        interval: 1,
        endDate: '2024-01-10',
        excludeDates: ['2024-01-05', '2024-01-05'],
      } as RepeatInfo)
    ).toBe(false);

    expect(
      validateRepeatSettings({
        type: 'daily',
        interval: 1,
        endDate: '2024-01-05',
        excludeDates: ['2024-01-06'],
      } as RepeatInfo)
    ).toBe(false);
  });
});

describe('generateEventInstances', () => {
  it('should generate daily repeating events correctly', () => {
    const repeatInfo: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: '2024-01-05',
    };

    const baseEvent: Event = {
      ...mockEvent,
      date: '2024-01-01',
    };

    const result = generateEventInstances(repeatInfo, baseEvent);

    expect(result).toHaveLength(5);
    expect(result[0].date).toBe('2024-01-01');
    expect(result[1].date).toBe('2024-01-02');
    expect(result[2].date).toBe('2024-01-03');
    expect(result[3].date).toBe('2024-01-04');
    expect(result[4].date).toBe('2024-01-05');

    // 각 이벤트가 고유한 ID를 가지는지 확인
    const ids = new Set(result.map((event) => event.id));
    expect(ids.size).toBe(result.length);
  });

  it('should generate weekly repeating events correctly', () => {
    const repeatInfo: RepeatInfo = {
      type: 'weekly',
      interval: 1,
      endDate: '2024-01-22',
    };

    const baseEvent: Event = {
      ...mockEvent,
      date: '2024-01-01',
    };

    const result = generateEventInstances(repeatInfo, baseEvent);

    expect(result).toHaveLength(4);
    expect(result[0].date).toBe('2024-01-01');
    expect(result[1].date).toBe('2024-01-08');
    expect(result[2].date).toBe('2024-01-15');
    expect(result[3].date).toBe('2024-01-22');
  });

  it('assigns the same repeat.id for all generated instances (grouping)', () => {
    const repeatInfo: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: '2024-01-03',
    };

    const baseEvent: Event = {
      ...mockEvent,
      date: '2024-01-01',
    };

    const result = generateEventInstances(repeatInfo, baseEvent);
    // 모두 repeat.id가 존재하며 동일해야 한다
    const ids = new Set(result.map((e) => e.repeat.id));
    expect(ids.size).toBe(1);
    expect([...ids][0]).toBeTruthy();
  });

  it('should generate monthly repeating events correctly', () => {
    const repeatInfo: RepeatInfo = {
      type: 'monthly',
      interval: 1,
      endDate: '2024-04-01',
    };

    const baseEvent: Event = {
      ...mockEvent,
      date: '2024-01-01',
    };

    const result = generateEventInstances(repeatInfo, baseEvent);

    expect(result).toHaveLength(4);
    expect(result[0].date).toBe('2024-01-01');
    expect(result[1].date).toBe('2024-02-01');
    expect(result[2].date).toBe('2024-03-01');
    expect(result[3].date).toBe('2024-04-01');
  });

  it('should generate yearly repeating events correctly', () => {
    const repeatInfo: RepeatInfo = {
      type: 'yearly',
      interval: 1,
      endDate: '2026-01-01',
    };

    const baseEvent: Event = {
      ...mockEvent,
      date: '2024-01-01',
    };

    const result = generateEventInstances(repeatInfo, baseEvent);

    expect(result).toHaveLength(3);
    expect(result[0].date).toBe('2024-01-01');
    expect(result[1].date).toBe('2025-01-01');
    expect(result[2].date).toBe('2026-01-01');
  });

  it('should handle interval greater than 1', () => {
    const repeatInfo: RepeatInfo = {
      type: 'daily',
      interval: 2,
      endDate: '2024-01-05',
    };

    const baseEvent: Event = {
      ...mockEvent,
      date: '2024-01-01',
    };

    const result = generateEventInstances(repeatInfo, baseEvent);

    expect(result).toHaveLength(3);
    expect(result[0].date).toBe('2024-01-01');
    expect(result[1].date).toBe('2024-01-03');
    expect(result[2].date).toBe('2024-01-05');
  });

  it('should return only base event for non-repeating events', () => {
    const repeatInfo: RepeatInfo = {
      type: 'none',
      interval: 1,
    };

    const baseEvent: Event = {
      ...mockEvent,
      date: '2024-01-01',
    };

    const result = generateEventInstances(repeatInfo, baseEvent);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(baseEvent);
  });
});
