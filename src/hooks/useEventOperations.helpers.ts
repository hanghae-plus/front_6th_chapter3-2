import type { Event, EventForm } from '../types';
import { isRepeatingEvent } from '../utils/eventUtils';
import { generateEventInstances } from '../utils/repeatingEventUtils';

type Enqueue = (message: string, options?: { variant?: 'error' | 'success' | 'info' }) => void;

export interface EventOpsDeps {
  editing: boolean;
  onSave?: () => void;
  setEvents: (events: Event[]) => void;
  enqueueSnackbar: Enqueue;
}

async function fetchEventsImpl(deps: EventOpsDeps): Promise<void> {
  const { setEvents, enqueueSnackbar } = deps;
  try {
    const response = await fetch('/api/events');
    if (!response.ok) throw new Error('Failed to fetch events');
    const { events } = (await response.json()) as { events: Event[] };
    setEvents(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
    throw error;
  }
}

async function saveSingleEvent(editing: boolean, event: Event): Promise<void> {
  const url = editing ? `/api/events/${event.id}` : '/api/events';
  const method = editing ? 'PUT' : 'POST';
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  if (!response.ok) throw new Error('Failed to save event');
}

function buildSavedMessage(editing: boolean, savedCount: number): string {
  if (editing) return '일정이 수정되었습니다.';
  if (savedCount > 1) return '반복 일정이 성공적으로 생성되었습니다.';
  return '일정이 추가되었습니다.';
}

function toEventsToSave(editing: boolean, data: Event | EventForm): Event[] {
  if (!editing && isRepeatingEvent(data as Event)) {
    const e = data as Event;
    return generateEventInstances(e.repeat, e);
  }
  return [data as Event];
}

async function saveEventImpl(deps: EventOpsDeps, eventData: Event | EventForm): Promise<void> {
  const { editing, enqueueSnackbar, onSave } = deps;
  try {
    const eventsToSave = toEventsToSave(editing, eventData);
    for (const e of eventsToSave) await saveSingleEvent(editing, e);
    await fetchEventsImpl(deps);
    onSave?.();
    enqueueSnackbar(buildSavedMessage(editing, eventsToSave.length), { variant: 'success' });
  } catch (error) {
    // 테스트 기대치: 실패 시 에러 토스트가 반드시 노출되어야 함
    console.error('Error saving event:', error);
    enqueueSnackbar('일정 저장 실패', { variant: 'error' });
    throw new Error('Failed to save event');
  }
}

async function deleteEventImpl(deps: EventOpsDeps, id: string): Promise<void> {
  const { enqueueSnackbar } = deps;
  try {
    const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      console.error('Error deleting event:', response.statusText);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
      throw new Error('Failed to delete event');
    }
    await fetchEventsImpl(deps);
    enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Failed to delete event') throw error;
    console.error('Error deleting event:', error);
    enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
    throw new Error('Failed to delete event');
  }
}

async function saveBulkImpl(deps: EventOpsDeps, bulkEvents: Event[]): Promise<void> {
  const { enqueueSnackbar } = deps;
  try {
    const response = await fetch('/api/events-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: bulkEvents }),
    });
    if (!response.ok) {
      enqueueSnackbar('그룹 저장 실패', { variant: 'error' });
      throw new Error('Failed to save bulk events');
    }
    await fetchEventsImpl(deps);
    enqueueSnackbar('그룹이 생성되었습니다.', { variant: 'success' });
  } catch (error) {
    console.error('Error saving bulk events:', error);
    enqueueSnackbar('그룹 저장 실패', { variant: 'error' });
    throw error;
  }
}

async function updateBulkImpl(deps: EventOpsDeps, bulkEvents: Event[]): Promise<void> {
  const { enqueueSnackbar } = deps;
  try {
    const response = await fetch('/api/events-list', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: bulkEvents }),
    });
    if (!response.ok) {
      enqueueSnackbar('그룹 수정 실패', { variant: 'error' });
      throw new Error('Failed to update bulk events');
    }
    await fetchEventsImpl(deps);
    enqueueSnackbar('그룹이 수정되었습니다.', { variant: 'success' });
  } catch (error) {
    console.error('Error updating bulk events:', error);
    enqueueSnackbar('그룹 수정 실패', { variant: 'error' });
    throw error;
  }
}

async function deleteBulkImpl(deps: EventOpsDeps, eventIds: string[]): Promise<void> {
  const { enqueueSnackbar } = deps;
  try {
    const response = await fetch('/api/events-list', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventIds }),
    });
    if (!response.ok) {
      enqueueSnackbar('그룹 삭제 실패', { variant: 'error' });
      throw new Error('Failed to delete bulk events');
    }
    await fetchEventsImpl(deps);
    enqueueSnackbar('그룹이 삭제되었습니다.', { variant: 'info' });
  } catch (error) {
    console.error('Error deleting bulk events:', error);
    enqueueSnackbar('그룹 삭제 실패', { variant: 'error' });
    throw error;
  }
}

export function createEventOperations(deps: EventOpsDeps) {
  return {
    init: async () => {
      try {
        await fetchEventsImpl(deps);
        deps.enqueueSnackbar('일정 로딩 완료!', { variant: 'info' });
      } catch {
        /* already notified in fetch */
      }
    },
    handlers: {
      fetchEvents: () => fetchEventsImpl(deps),
      saveEvent: (eventData: Event | EventForm) => saveEventImpl(deps, eventData),
      deleteEvent: (id: string) => deleteEventImpl(deps, id),
      saveBulkEvents: (bulkEvents: Event[]) => saveBulkImpl(deps, bulkEvents),
      updateBulkEvents: (bulkEvents: Event[]) => updateBulkImpl(deps, bulkEvents),
      deleteBulkEvents: (ids: string[]) => deleteBulkImpl(deps, ids),
    },
  } as const;
}
