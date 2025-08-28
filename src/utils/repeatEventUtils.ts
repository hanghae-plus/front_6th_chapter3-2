import { Event, RepeatType } from '../types';

function formatDateToString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getNextRepeatDate(currentDate: Date, repeatType: RepeatType, interval: number): Date {
  const nextDate = new Date(currentDate);

  switch (repeatType) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7 * interval);
      break;
    case 'monthly': {
      const originalDay = nextDate.getDate();
      nextDate.setMonth(nextDate.getMonth() + interval);

      if (nextDate.getDate() !== originalDay) {
        nextDate.setDate(originalDay);
      }
      break;
    }
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
    default:
      break;
  }

  return nextDate;
}

/**
 * 날짜가 유효한지 확인
 */
function isValidRepeatDate(originalDate: Date, newDate: Date, repeatType: RepeatType): boolean {
  if (repeatType === 'monthly') {
    return originalDate.getDate() === newDate.getDate();
  }

  if (repeatType === 'yearly') {
    return (
      originalDate.getMonth() === newDate.getMonth() && originalDate.getDate() === newDate.getDate()
    );
  }

  return true;
}

/**
 * 반복 일정인지 확인
 */
export function isRepeatEvent(event: Event): boolean {
  return event.repeat.type !== 'none';
}

/**
 * 반복 일정 생성
 */
export function generateRepeatEvents(event: Event, endDate: Date): Event[] {
  if (event.repeat.type === 'none') {
    return [event];
  }

  const events: Event[] = [];
  const startDate = new Date(event.date);

  const repeatEndDate = new Date(event.repeat.endDate ?? '');
  const finalEndDate = repeatEndDate && repeatEndDate < endDate ? repeatEndDate : endDate;

  // 윤년 처리
  if (event.repeat.type === 'yearly') {
    let currentYear = startDate.getFullYear();
    const originalMonth = startDate.getMonth();
    const originalDay = startDate.getDate();

    while (currentYear <= finalEndDate.getFullYear()) {
      const candidateDate = new Date(currentYear, originalMonth, originalDay);

      if (candidateDate > finalEndDate) break;

      if (candidateDate.getMonth() === originalMonth && candidateDate.getDate() === originalDay) {
        events.push({
          ...event,
          date: formatDateToString(candidateDate),
        });
      }

      currentYear += event.repeat.interval;
    }
  } else {
    let currentDate = new Date(startDate);

    while (currentDate <= finalEndDate) {
      if (isValidRepeatDate(startDate, currentDate, event.repeat.type)) {
        events.push({
          ...event,
          date: formatDateToString(currentDate),
        });
      }

      currentDate = getNextRepeatDate(currentDate, event.repeat.type, event.repeat.interval);
    }
  }

  return events;
}

export function removeRepeatEventOnDate(events: Event[], targetDate: string): Event[] {
  if (!events.length || !targetDate) {
    return events;
  }

  return events.filter((event) => event.date !== targetDate);
}
