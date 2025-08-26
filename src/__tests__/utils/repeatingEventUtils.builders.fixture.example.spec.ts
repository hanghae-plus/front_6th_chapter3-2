import { describe, it, expect } from 'vitest';

import { exampleDailyRepeatInfo, exampleEventForm } from './fixtures';
import { calculateRepeatingDates } from '../../utils/repeatingEventUtils';

describe('RepeatingEventUtils (builders/fixtures example)', () => {
  it('should calculate daily repeating dates until endDate using fixtures', () => {
    // Given
    const repeat = exampleDailyRepeatInfo;
    const base = exampleEventForm; // date: 2025-01-01

    // When
    const dates = calculateRepeatingDates(repeat, base.date);

    // Then
    expect(dates).toEqual(['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05']);
  });
});
