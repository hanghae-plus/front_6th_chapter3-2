import type { Event } from '../types';

export const CURRENT_EVENT_SCHEMA_VERSION = 1 as const;

function clampInterval(rawInterval: number | undefined): number {
  if (!Number.isInteger(rawInterval as number)) return 1;
  const value = rawInterval as number;
  if (value < 1) return 1;
  if (value > 99) return 99;
  return value;
}

export function normalizeEvent(event: Event): Event {
  const interval = clampInterval(event.repeat?.interval);
  const isRepeating = event.repeat?.type !== 'none';
  return {
    ...event,
    repeat: {
      ...event.repeat,
      interval,
      // 반복 이벤트에만 버전 부여(없으면 최신 버전), 단일 일정은 생략
      ...(isRepeating ? { version: event.repeat?.version ?? CURRENT_EVENT_SCHEMA_VERSION } : {}),
    },
  };
}

export function normalizeEvents(events: Event[]): Event[] {
  return events.map(normalizeEvent);
}
