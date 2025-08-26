import { buildEvent, buildEventForm, buildRepeatInfo } from './builders';
import type { Event, EventForm, RepeatInfo } from '../../types';

export const exampleDailyRepeatInfo: RepeatInfo = buildRepeatInfo({
  type: 'daily',
  interval: 1,
  endDate: '2025-01-05',
});

export const exampleWeeklyRepeatInfo: RepeatInfo = buildRepeatInfo({
  type: 'weekly',
  interval: 1,
  endDate: '2025-02-01',
  weekdays: [1, 3, 5],
});

export const exampleEventForm: EventForm = buildEventForm({
  title: '반복 회의',
  date: '2025-01-01',
  repeat: exampleDailyRepeatInfo,
});

export const exampleEvent: Event = buildEvent({
  ...exampleEventForm,
});

export const exampleEvents: Event[] = [
  buildEvent({ title: '단일 일정 1', repeat: buildRepeatInfo({ type: 'none' }) }),
  buildEvent({ title: '단일 일정 2', repeat: buildRepeatInfo({ type: 'none' }) }),
];
