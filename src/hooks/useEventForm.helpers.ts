import type { Event, RepeatInfo, RepeatType } from '../types';

export interface CreateEventDeps {
  saveEvents: (events: Event[]) => Promise<boolean>;
  showSuccessMessage: (message: string) => void;
  validateRepeatSettings: (repeatInfo: RepeatInfo) => boolean;
  generateEventInstances: (repeatInfo: RepeatInfo, baseEvent: Event) => Event[];
}

export interface FormSnapshot {
  editingEventId?: string | null;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  isRepeating: boolean;
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;
  excludeDates: string[];
  weekdays: number[];
  notificationTime: number;
}

export function buildRepeatInfo(snapshot: FormSnapshot): RepeatInfo {
  return {
    type: snapshot.repeatType,
    interval: snapshot.repeatInterval,
    endDate: snapshot.repeatEndDate || undefined,
    excludeDates: snapshot.excludeDates.length ? snapshot.excludeDates : undefined,
    weekdays: snapshot.weekdays.length ? snapshot.weekdays : undefined,
  };
}

export function buildBaseEvent(snapshot: FormSnapshot): Event {
  return {
    id: snapshot.editingEventId || crypto.randomUUID(),
    title: snapshot.title,
    date: snapshot.date,
    startTime: snapshot.startTime,
    endTime: snapshot.endTime,
    description: snapshot.description,
    location: snapshot.location,
    category: snapshot.category,
    repeat: buildRepeatInfo(snapshot),
    notificationTime: snapshot.notificationTime,
  } as Event;
}

async function saveOrFail(
  deps: Pick<CreateEventDeps, 'saveEvents'>,
  events: Event[],
  errorMessage: string
): Promise<void> {
  const ok = await deps.saveEvents(events);
  if (!ok) throw new Error(errorMessage);
}

export async function createEventsImpl(
  snapshot: FormSnapshot,
  deps: CreateEventDeps
): Promise<Event[]> {
  const baseEvent = buildBaseEvent(snapshot);

  if (snapshot.isRepeating) {
    const repeatInfo = buildRepeatInfo(snapshot);
    if (!deps.validateRepeatSettings(repeatInfo)) {
      throw new Error('Invalid repeat settings');
    }
    const events = deps.generateEventInstances(repeatInfo, baseEvent);
    await saveOrFail(deps, events, 'Failed to save repeating events');
    deps.showSuccessMessage('반복 일정이 성공적으로 생성되었습니다.');
    return events;
  }

  const events = [baseEvent];
  await saveOrFail(deps, events, 'Failed to save events');
  deps.showSuccessMessage('일정이 성공적으로 생성되었습니다.');
  return events;
}
