import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

import type { RepeatInfo } from '../../types';
import { validateRepeatSettings, formatRepeatPreview } from '../../utils/repeatingEventUtils';

beforeAll(() => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  vi.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
});

describe('Story 2.1 - Preview formatting', () => {
  it('formats daily preview with endDate', () => {
    expect(formatRepeatPreview({ type: 'daily', interval: 2, endDate: '2024-01-10' })).toBe(
      '2일마다 (종료: 2024-01-10)'
    );
  });

  it('formats weekly preview without endDate', () => {
    expect(formatRepeatPreview({ type: 'weekly', interval: 3 })).toBe('3주마다');
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('Story 2.1 - Interval validation (1-99)', () => {
  it('accepts interval within 1-99 (boundary: 99)', () => {
    const info: RepeatInfo = { type: 'daily', interval: 99, endDate: '2024-01-10' };
    expect(validateRepeatSettings(info)).toBe(true);
  });

  it('rejects interval greater than 99', () => {
    const info: RepeatInfo = { type: 'daily', interval: 100, endDate: '2024-01-10' };
    expect(validateRepeatSettings(info)).toBe(false);
  });

  it('rejects non-integer interval', () => {
    const info = { type: 'weekly', interval: 2.5, endDate: '2024-02-01' } as unknown as RepeatInfo;
    expect(validateRepeatSettings(info)).toBe(false);
  });
});
