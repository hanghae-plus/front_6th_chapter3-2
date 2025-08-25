import { describe, it, expect } from 'vitest';

import { buildEventForm, buildRepeatInfo, resetTestIds } from './builders';
import { calculateRepeatingDates } from '../../utils/repeatingEventUtils';

describe('RepeatingEventUtils (GWT example)', () => {
  it('should calculate weekly repeating dates when interval=2', () => {
    // Given
    resetTestIds();
    const base = buildEventForm({ date: '2025-01-01' });
    const repeat = buildRepeatInfo({ type: 'weekly', interval: 2, endDate: '2025-02-01' });

    // When
    const dates = calculateRepeatingDates(repeat, base.date);

    // Then
    expect(dates.length).toBeGreaterThan(0);
    expect(dates[0]).toBe('2025-01-01');
    expect(dates.at(-1)).toBe('2025-01-29');
  });
});
