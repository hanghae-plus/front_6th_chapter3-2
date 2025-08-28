import { Event, RepeatInfo } from '../types';
import { getWeekDates, isDateInRange } from './dateUtils';

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

const MAX_END_DATE = '2025-10-31';
export const getRepeatedDates = (startDate: string, repeat: RepeatInfo): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(repeat.endDate || MAX_END_DATE);
  console.log('ENDDATE : ', end);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const current = new Date(d);

    switch (repeat.type) {
      case 'daily':
        dates.push(current.toISOString().split('T')[0]);
        break;
      case 'weekly':
        if (current.getDay() === start.getDay()) {
          dates.push(current.toISOString().split('T')[0]);
        }
        break;
      case 'monthly':
        if (current.getDate() === start.getDate()) {
          dates.push(current.toISOString().split('T')[0]);
        }
        break;
      case 'yearly':
        if (current.getMonth() === start.getMonth() && current.getDate() === start.getDate()) {
          dates.push(current.toISOString().split('T')[0]);
        }
        break;
    }
  }

  return dates;
};
