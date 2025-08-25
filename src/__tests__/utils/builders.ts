import type { Event, EventForm, RepeatInfo, RepeatType } from '../../types';

let idCounter = 1;
function makeId(prefix: string): string {
  const id = `${prefix}-${idCounter}`;
  idCounter += 1;
  return id;
}

export function buildRepeatInfo(overrides: Partial<RepeatInfo> = {}): RepeatInfo {
  const defaults: RepeatInfo = {
    type: 'none',
    interval: 1,
    endDate: undefined,
    version: 1,
    excludeDates: [],
    weekdays: undefined,
    id: undefined,
  };
  return { ...defaults, ...overrides } as RepeatInfo;
}

export function buildEventForm(overrides: Partial<EventForm> = {}): EventForm {
  const defaults: EventForm = {
    title: '기본 제목',
    date: '2025-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '회의실 A',
    category: 'default',
    repeat: buildRepeatInfo(),
    notificationTime: 0,
  };
  return { ...defaults, ...overrides } as EventForm;
}

export function buildEvent(overrides: Partial<Event> = {}): Event {
  const base = buildEventForm(overrides as Partial<EventForm>);
  const defaults: Event = {
    ...base,
    id: makeId('evt'),
  };
  return { ...defaults, ...overrides } as Event;
}

export function withRepeat(
  repeatType: RepeatType,
  overrides: Partial<RepeatInfo> = {}
): RepeatInfo {
  return buildRepeatInfo({ type: repeatType, ...overrides });
}

export function resetTestIds(): void {
  idCounter = 1;
}
