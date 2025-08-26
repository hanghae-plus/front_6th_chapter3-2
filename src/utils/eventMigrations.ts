import type { Event } from '../types';

export const CURRENT_EVENT_SCHEMA_VERSION = 1 as const;

function clampInterval(rawInterval: number | undefined): number {
  const value = Number.isInteger(rawInterval as number) ? (rawInterval as number) : 1;
  if (value < 1) return 1;
  if (value > 99) return 99;
  return value;
}

export function normalizeEvent(event: Event): Event {
  const repeat = event.repeat ?? ({ type: 'none', interval: 1 } as Event['repeat']);
  const interval = clampInterval(repeat.interval);
  const isRepeating = repeat.type !== 'none';
  return {
    ...event,
    repeat: {
      ...repeat,
      interval,
      ...(isRepeating ? { version: repeat.version ?? CURRENT_EVENT_SCHEMA_VERSION } : {}),
    },
  };
}

export function normalizeEvents(events: Event[]): Event[] {
  return events.map(normalizeEvent);
}
