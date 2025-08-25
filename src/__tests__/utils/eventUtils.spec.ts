import { describe, it, expect } from 'vitest';

import { buildEvent, buildRepeatInfo } from './builders';
import type { Event, RepeatType } from '../../types';
import { isRepeatingEvent, getRepeatIcon } from '../../utils/eventUtils';

describe('isRepeatingEvent', () => {
  it('일반 일정은 false를 반환해야 함', () => {
    // Given
    const event: Event = buildEvent({ repeat: buildRepeatInfo({ type: 'none', interval: 1 }) });

    // When
    const result = isRepeatingEvent(event);

    // Then
    expect(result).toBe(false);
  });

  it('반복 타입이 none이 아닌 일정은 true를 반환해야 함', () => {
    // Given
    const repeatingEvent: Event = buildEvent({
      repeat: buildRepeatInfo({ type: 'daily', interval: 1 }),
    });

    // When
    const result = isRepeatingEvent(repeatingEvent);

    // Then
    expect(result).toBe(true);
  });

  it('repeat 속성이 없는 일정은 false를 반환해야 함', () => {
    // Given
    const eventWithoutRepeat = { ...buildEvent(), repeat: undefined } as unknown as Event;

    // When
    const result = isRepeatingEvent(eventWithoutRepeat);

    // Then
    expect(result).toBe(false);
  });
});

describe('getRepeatIcon', () => {
  it('각 반복 유형별로 올바른 아이콘을 반환해야 함', () => {
    // Given
    const testCases: { type: RepeatType; expected: string }[] = [
      { type: 'daily', expected: '🔄' },
      { type: 'weekly', expected: '📅' },
      { type: 'monthly', expected: '📆' },
      { type: 'yearly', expected: '🎯' },
      { type: 'none', expected: '' },
    ];

    // When / Then
    testCases.forEach(({ type, expected }) => {
      expect(getRepeatIcon(type)).toBe(expected);
    });
  });

  it('유효하지 않은 반복 유형에 대해 빈 문자열을 반환해야 함', () => {
    // Given
    const invalidType = 'invalid' as RepeatType;

    // When
    const icon = getRepeatIcon(invalidType);

    // Then
    expect(icon).toBe('');
  });
});
