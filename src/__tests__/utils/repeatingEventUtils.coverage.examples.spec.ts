import { describe, it, expect } from 'vitest';

import { buildEvent, buildRepeatInfo } from './builders';
import { calculateRepeatingDates, generateEventInstances } from '../../utils/repeatingEventUtils';

describe('Coverage enhancements for repeating events', () => {
  it('limits to max 10 when no endDate is provided', () => {
    // Given
    const repeat = buildRepeatInfo({ type: 'daily', interval: 1 });
    const start = '2025-01-01';

    // When
    const dates = calculateRepeatingDates(repeat, start);

    // Then
    expect(dates.length).toBeLessThanOrEqual(10);
  });

  it('preserves provided repeat.id across instances', () => {
    // Given
    const groupId = 'group-123';
    const repeat = buildRepeatInfo({
      type: 'weekly',
      interval: 1,
      endDate: '2025-02-01',
      id: groupId,
    });
    const base = buildEvent({ date: '2025-01-01' });

    // When
    const instances = generateEventInstances(repeat, base);

    // Then
    const ids = new Set(instances.map((e) => e.repeat.id));
    expect(ids.size).toBe(1);
    expect([...ids][0]).toBe(groupId);
  });
});
