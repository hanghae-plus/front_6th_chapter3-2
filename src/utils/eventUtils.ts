import { Event, type EventForm } from '../types';
import { formatDate, getWeekDates, isDateInRange, getDaysInMonth } from './dateUtils';

function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}

function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

function filterEventsByDateRangeAtMonth(events: Event[], currentDate: Date) {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  return filterEventsByDateRange(events, monthStart, monthEnd);
}

export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  const searchedEvents = searchEvents(events, searchTerm);

  if (view === 'week') {
    return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
  }

  if (view === 'month') {
    return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
  }

  return searchedEvents;
}

/**
 * 반복 주기에 맞는 모든 이벤트를 배열로 반환합니다.
 * 주기가 daily 인 경우 interval 만큼 더해서 이벤트를 생성합니다.
 * 주기가 weekly 인 경우 interval * 7 만큼 더해서 이벤트를 생성합니다.
 * 주기가 monthly 인 경우 다음달에 해당일이 있는 경우만 이벤트를 생성합니다. 31일로 설정된 경우 31일이 존재하는 달에만 이벤트를 생성함
 * 주기가 yearly 인 경우 해당 년도 해당월에 해당일이 있는 경우만 이벤트를 생성합니다. 2월 29일로 설정된 경우 윤년에만 이벤트가 추가됨.
 * endDate가 설정되지 않은 경우 2025-10-30까지 이벤트를 생성합니다.
 * 주기가 none 인 경우 해당 이벤트만 배열 형태로 반환합니다.
 */
export function createRecurringEvents<T extends Event | EventForm>(event: T): T[] {
  const MAX_DATE = '2025-10-30';
  const { repeat } = event;

  // none인 경우 해당 이벤트만 반환
  if (repeat.type === 'none') {
    return [event];
  }

  const events: T[] = [event];
  const startDate = new Date(event.date);
  const endDate = new Date(repeat.endDate || MAX_DATE);
  const interval = repeat.interval || 1;

  let currentDate = new Date(startDate);

  switch (repeat.type) {
    case 'daily':
      while (true) {
        currentDate.setDate(currentDate.getDate() + interval);
        if (currentDate > endDate) break;

        const newEvent: T = {
          ...event,
          date: formatDate(currentDate),
        };
        events.push(newEvent);
      }
      break;

    case 'weekly':
      while (true) {
        currentDate.setDate(currentDate.getDate() + interval * 7);
        if (currentDate > endDate) break;

        const newEvent: T = {
          ...event,
          date: formatDate(currentDate),
        };
        events.push(newEvent);
      }
      break;

    case 'monthly':
      while (true) {
        // 다음 달로 이동
        currentDate.setMonth(currentDate.getMonth() + interval);

        if (currentDate > endDate) break;

        // 해당 월에 원래 일자가 존재하는지 확인
        const originalDay = startDate.getDate();
        const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth() + 1);

        if (originalDay <= daysInMonth) {
          const newDate = new Date(currentDate);
          newDate.setDate(originalDay);

          const newEvent: T = {
            ...event,
            date: formatDate(newDate),
          };
          events.push(newEvent);
        }
      }
      break;

    case 'yearly':
      while (true) {
        // 다음 년도로 이동
        currentDate.setFullYear(currentDate.getFullYear() + interval);

        if (currentDate > endDate) break;

        // 해당 년도에 원래 월/일이 존재하는지 확인 (윤년 고려)
        const originalMonth = startDate.getMonth();
        const originalDay = startDate.getDate();
        const daysInMonth = getDaysInMonth(currentDate.getFullYear(), originalMonth + 1);

        if (originalDay <= daysInMonth) {
          const newDate = new Date(currentDate);
          newDate.setMonth(originalMonth);
          newDate.setDate(originalDay);

          const newEvent: T = {
            ...event,
            date: formatDate(newDate),
          };
          events.push(newEvent);
        }
      }
      break;
  }

  return events;
}
