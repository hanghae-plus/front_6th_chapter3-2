import { Event, EventForm } from '../types';

// 반복 일정을 단일 일정으로 변환
export const toSingleEvent = (event: Event | EventForm): Event | EventForm => ({
  ...event,
  repeat: { type: 'none', interval: 0 },
});

// 반복 시작 날짜가 반복 종료 날짜보다 앞인지 확인
export const checkEndDateValid = (start: string, end?: string): boolean => {
  const repeatStart = new Date(start);
  const repeatEnd = new Date(end ?? '2025-10-30');
  return repeatStart <= repeatEnd;
};

// 매일 반복 일정 배열
export const getDailyRepeatEvents = (event: EventForm): EventForm[] => {
  const { date, repeat } = event;
  const results: EventForm[] = [];

  let current = new Date(date);
  const endDate = repeat.endDate ? new Date(repeat.endDate) : new Date(2025, 10, 30);

  while (current <= endDate) {
    results.push({ ...event, date: current.toISOString().slice(0, 10) }); // YYYY-MM-DD
    current.setDate(current.getDate() + repeat.interval);
  }
  return results;
};

// 매주 반복 일정 배열
export const getWeeklyRepeatEvents = (event: EventForm): EventForm[] => {
  const { date, repeat } = event;
  const results: EventForm[] = [];

  let current = new Date(date);
  const endDate = repeat.endDate ? new Date(repeat.endDate) : new Date('2025-10-30');

  while (current <= endDate) {
    results.push({ ...event, date: current.toISOString().slice(0, 10) });
    current.setDate(current.getDate() + 7 * repeat.interval);
  }
  return results;
};

// 매월 반복 일정 배열
export const getMonthlyRepeatEvents = (event: EventForm): EventForm[] => {
  const { date, repeat } = event;
  const results: EventForm[] = [];

  let current = new Date(date);
  const endDate = repeat.endDate ? new Date(repeat.endDate) : new Date('2025-10-30');
  const day = current.getDate();
  const interval = repeat.interval;

  while (current <= endDate) {
    results.push({ ...event, date: current.toISOString().slice(0, 10) });

    // 다음 달로 이동
    let nextYear = current.getFullYear();
    let nextMonth = current.getMonth() + interval;

    if (nextMonth > 11) {
      nextYear += Math.floor(nextMonth / 12);
      nextMonth = nextMonth % 12;
    }

    // 같은 날짜가 존재하는 달을 찾을 때까지 다음 달로 이동
    let next = new Date(nextYear, nextMonth, day);
    while (next.getDate() !== day) {
      nextMonth++;
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
      }
      next = new Date(nextYear, nextMonth, day);
    }

    current = next;
  }

  return results;
};

// 매년 반복 일정 배열
export const getYearlyRepeatEvents = (event: EventForm): EventForm[] => {
  const { date, repeat } = event;
  const results: EventForm[] = [];

  let current = new Date(date);
  const endDate = repeat.endDate ? new Date(repeat.endDate) : new Date('2025-10-30');

  const month = current.getMonth();
  const day = current.getDate();

  while (current <= endDate) {
    results.push({ ...event, date: current.toISOString().slice(0, 10) });

    let nextYear = current.getFullYear() + repeat.interval;
    let nextDate = new Date(nextYear, month, day);

    // 윤년 처리
    while (month === 1 && day === 29 && nextDate.getDate() !== 29) {
      nextYear++;
      nextDate = new Date(nextYear, month, day);
    }

    current = nextDate;
  }
  return results;
};

export const getRepeatEventList = (event: EventForm): EventForm[] => {
  if (!event.repeat.endDate || event.repeat.type === 'none') return [event];

  switch (event.repeat.type) {
    case 'daily':
      return getDailyRepeatEvents(event);
    case 'weekly':
      return getWeeklyRepeatEvents(event);
    case 'monthly':
      return getMonthlyRepeatEvents(event);
    case 'yearly':
      return getYearlyRepeatEvents(event);
    default:
      return [event];
  }
};
