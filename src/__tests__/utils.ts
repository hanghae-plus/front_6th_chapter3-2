import { EventForm } from '../types';
import { fillZero } from '../utils/dateUtils';

export const assertDate = (date1: Date, date2: Date) => {
  expect(date1.toISOString()).toBe(date2.toISOString());
};

export const parseHM = (timestamp: number) => {
  const date = new Date(timestamp);
  const h = fillZero(date.getHours());
  const m = fillZero(date.getMinutes());
  return `${h}:${m}`;
};

export const makeEventForm = (overrides: Partial<EventForm> = {}): EventForm => ({
  title: overrides.title ?? '테스트 일정',
  date: overrides.date ?? '2025-10-28',
  startTime: overrides.startTime ?? '09:00',
  endTime: overrides.endTime ?? '10:00',
  description: overrides.description ?? '',
  location: overrides.location ?? '',
  category: overrides.category ?? 'default',
  repeat: overrides.repeat ?? { type: 'none', interval: 1, endDate: undefined },
  notificationTime: overrides.notificationTime ?? 0,
});
