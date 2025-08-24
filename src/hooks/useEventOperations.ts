import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { isRepeatingEvent } from '../utils/eventUtils';
import { generateEventInstances } from '../utils/repeatingEventUtils';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
      throw error;
    }
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      let eventsToSave: Event[];

      if (!editing && isRepeatingEvent(eventData as Event)) {
        eventsToSave = generateEventInstances((eventData as Event).repeat, eventData as Event);
      } else {
        eventsToSave = [eventData as Event];
      }

      // 모든 이벤트 저장
      for (const event of eventsToSave) {
        const response = await fetch(editing ? `/api/events/${event.id}` : '/api/events', {
          method: editing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });

        if (!response.ok) {
          enqueueSnackbar('일정 저장 실패', { variant: 'error' });
          throw new Error('Failed to save event');
        }
      }

      await fetchEvents();
      onSave?.();

      const message = editing
        ? '일정이 수정되었습니다.'
        : eventsToSave.length > 1
          ? '반복 일정이 성공적으로 생성되었습니다.'
          : '일정이 추가되었습니다.';

      enqueueSnackbar(message, { variant: 'success' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Failed to save event') {
        throw error;
      }
      console.error('Error saving event:', error);
      enqueueSnackbar('일정 저장 실패', { variant: 'error' });
      throw new Error('Failed to save event');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        console.error('Error deleting event:', response.statusText);
        enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
        throw new Error('Failed to delete event');
      }

      try {
        await fetchEvents();
        enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
      } catch {
        // fetchEvents에서 이미 에러 메시지를 표시했으므로 여기서는 무시
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Failed to delete event') {
        throw error;
      }
      console.error('Error deleting event:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
      throw new Error('Failed to delete event');
    }
  };

  async function init() {
    try {
      await fetchEvents();
      enqueueSnackbar('일정 로딩 완료!', { variant: 'info' });
    } catch {
      // fetchEvents에서 이미 에러 메시지를 표시했으므로 여기서는 무시
    }
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent };
};
