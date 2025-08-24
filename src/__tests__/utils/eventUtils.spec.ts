import { describe, it, expect } from 'vitest';

import type { Event, RepeatType } from '../../types';
import { isRepeatingEvent, getRepeatIcon } from '../../utils/eventUtils';

describe('isRepeatingEvent', () => {
  it('일반 일정은 false를 반환해야 함', () => {
    const event: Event = {
      id: '1',
      title: '일반 회의',
      date: '2024-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      notificationTime: 0,
      repeat: { type: 'none', interval: 0 },
    };

    expect(isRepeatingEvent(event)).toBe(false);
  });

  it('반복 타입이 none이 아닌 일정은 true를 반환해야 함', () => {
    const repeatingEvent: Event = {
      id: '1',
      title: '반복 회의',
      date: '2024-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      notificationTime: 0,
      repeat: { type: 'daily', interval: 1 },
    };

    expect(isRepeatingEvent(repeatingEvent)).toBe(true);
  });

  it('repeat 속성이 없는 일정은 false를 반환해야 함', () => {
    const eventWithoutRepeat = {
      id: '1',
      title: '일반 회의',
      date: '2024-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      notificationTime: 0,
    } as Event;

    expect(isRepeatingEvent(eventWithoutRepeat)).toBe(false);
  });
});

describe('getRepeatIcon', () => {
  it('각 반복 유형별로 올바른 아이콘을 반환해야 함', () => {
    const testCases: { type: RepeatType; expected: string }[] = [
      { type: 'daily', expected: '🔄' },
      { type: 'weekly', expected: '📅' },
      { type: 'monthly', expected: '📆' },
      { type: 'yearly', expected: '🎯' },
      { type: 'none', expected: '' },
    ];

    testCases.forEach(({ type, expected }) => {
      expect(getRepeatIcon(type)).toBe(expected);
    });
  });

  it('유효하지 않은 반복 유형에 대해 빈 문자열을 반환해야 함', () => {
    const invalidType = 'invalid' as RepeatType;
    expect(getRepeatIcon(invalidType)).toBe('');
  });
});
