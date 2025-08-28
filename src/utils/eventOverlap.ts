import { Event, EventForm } from '../types';
import { createRecurringEvents } from './eventUtils';

export function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

export function convertEventToDateRange({ date, startTime, endTime }: Event | EventForm) {
  return {
    start: parseDateTime(date, startTime),
    end: parseDateTime(date, endTime),
  };
}

// 반복 이벤트일 때 두 이벤트가 겹치는지 확인
export function isOverlapping(event1: Event | EventForm, event2: Event | EventForm) {
  const { start: start1, end: end1 } = convertEventToDateRange(event1);
  const { start: start2, end: end2 } = convertEventToDateRange(event2);

  return start1 < end2 && start2 < end1;
}

export function findOverlappingEvents(newEvent: Event | EventForm, events: Event[]) {
  // 새로운 이벤트가 반복 이벤트인 경우 모든 반복 이벤트를 생성
  const recurringEvents = createRecurringEvents(newEvent);

  // 각 반복 이벤트에 대해 겹치는 기존 이벤트들을 찾음
  const overlappingEvents = new Set<Event>();

  recurringEvents.forEach((recurringEvent) => {
    const overlapping = events.filter(
      (event) => event.id !== (newEvent as Event).id && isOverlapping(event, recurringEvent)
    );
    overlapping.forEach((event) => overlappingEvents.add(event));
  });

  return Array.from(overlappingEvents);
}

/**
 * 반복 이벤트와 기존 이벤트 간의 겹침 정보를 상세히 반환합니다.
 * @param newEvent 새로운 이벤트 (반복 이벤트일 수 있음)
 * @param events 기존 이벤트 목록
 * @returns 겹치는 이벤트와 해당 반복 이벤트의 정보
 */
export function findDetailedOverlappingEvents(newEvent: Event | EventForm, events: Event[]) {
  const recurringEvents = createRecurringEvents(newEvent);
  const overlappingDetails: Array<{
    recurringEvent: Event | EventForm;
    overlappingEvents: Event[];
  }> = [];

  recurringEvents.forEach((recurringEvent) => {
    const overlapping = events.filter(
      (event) => event.id !== (newEvent as Event).id && isOverlapping(event, recurringEvent)
    );

    if (overlapping.length > 0) {
      overlappingDetails.push({
        recurringEvent,
        overlappingEvents: overlapping,
      });
    }
  });

  return overlappingDetails;
}

/**
 * 반복 이벤트가 특정 날짜 범위에서 겹치는지 확인합니다.
 * @param newEvent 새로운 이벤트
 * @param events 기존 이벤트 목록
 * @param startDate 시작 날짜
 * @param endDate 종료 날짜
 * @returns 해당 범위에서 겹치는 이벤트들
 */
export function findOverlappingEventsInDateRange(
  newEvent: Event | EventForm,
  events: Event[],
  startDate: Date,
  endDate: Date
) {
  const recurringEvents = createRecurringEvents(newEvent);
  const overlappingEvents = new Set<Event>();

  recurringEvents.forEach((recurringEvent) => {
    const eventStart = parseDateTime(recurringEvent.date, recurringEvent.startTime);
    const eventEnd = parseDateTime(recurringEvent.date, recurringEvent.endTime);

    // 이벤트가 지정된 날짜 범위에 있는지 확인
    if (eventStart <= endDate && eventEnd >= startDate) {
      const overlapping = events.filter(
        (event) => event.id !== (newEvent as Event).id && isOverlapping(event, recurringEvent)
      );
      overlapping.forEach((event) => overlappingEvents.add(event));
    }
  });

  return Array.from(overlappingEvents);
}
