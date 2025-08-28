import { Event } from '../types';
import { expandRecurringEvent } from './expandRecurringEvent';

export const addRepeatIconIfNeeded = (mockEvent: Event): Event[] => {
  const expanded = expandRecurringEvent(mockEvent);

  return expanded.map((e) => {
    if (!e.repeat?.type || e.repeat.type === 'none') {
      return e;
    }
    return {
      ...e,
      repeat: { ...e.repeat, repeatIcon: true },
    };
  });
};
