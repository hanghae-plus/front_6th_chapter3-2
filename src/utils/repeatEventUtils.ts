import { RepeatInfo, Event } from '../types';

interface RepeatEventInput {
  date: string;
  repeatType: RepeatInfo['type'];
  interval: number;
  endDate: string;
}

export const generateRepeatDates = (event: RepeatEventInput): string[] => {
  const { repeatType } = event;

  // 입력 유효성 검사
  if (!isValidDate(event.date) || !isValidDate(event.endDate)) {
    throw new Error('Invalid date format');
  }

  // 시작일과 종료일 비교
  if (new Date(event.date) > new Date(event.endDate)) {
    return [];
  }

  if (repeatType === 'daily') {
    return generateDailyRepeatDates(event);
  }

  if (repeatType === 'weekly') {
    return generateWeeklyRepeatDates(event);
  }

  if (repeatType === 'monthly') {
    return generateMonthlyRepeatDates(event);
  }

  if (repeatType === 'yearly') {
    return generateYearlyRepeatDates(event);
  }

  return [];
};

const generateDailyRepeatDates = (event: RepeatEventInput): string[] => {
  const dates: string[] = [];
  let currentDate = new Date(event.date);
  const endDate = new Date(event.endDate);

  while (currentDate <= endDate) {
    dates.push(formatDate(currentDate));
    currentDate.setDate(currentDate.getDate() + event.interval);
  }

  return dates;
};

const generateWeeklyRepeatDates = (event: RepeatEventInput): string[] => {
  const dates: string[] = [];
  let currentDate = new Date(event.date);
  const endDate = new Date(event.endDate);

  while (currentDate <= endDate) {
    dates.push(formatDate(currentDate));
    currentDate.setDate(currentDate.getDate() + event.interval * 7);
  }

  return dates;
};

const generateMonthlyRepeatDates = (event: RepeatEventInput): string[] => {
  const dates: string[] = [];
  let currentDate = new Date(event.date);
  const endDate = new Date(event.endDate);
  const originalDay = currentDate.getDate();

  while (currentDate <= endDate) {
    dates.push(formatDate(currentDate));

    // 다음 달 계산
    let nextMonth = currentDate.getMonth() + event.interval;
    let nextYear = currentDate.getFullYear() + Math.floor(nextMonth / 12);
    nextMonth = nextMonth % 12;

    // 원래 날짜가 다음 달에 존재하지 않는 경우 해당 달을 건너뛰기
    const lastDayOfNextMonth = getLastDayOfMonth(nextYear, nextMonth);

    if (originalDay > lastDayOfNextMonth) {
      // 해당 달을 건너뛰고 다음 달의 같은 날짜로 설정
      nextMonth = nextMonth + 1;
      if (nextMonth >= 12) {
        nextMonth = 0;
        nextYear += 1;
      }

      // 다음 달도 원래 날짜가 없으면 계속 건너뛰기
      while (getLastDayOfMonth(nextYear, nextMonth) < originalDay) {
        nextMonth += 1;
        if (nextMonth >= 12) {
          nextMonth = 0;
          nextYear += 1;
        }
      }
    }

    const nextDate = new Date(nextYear, nextMonth, originalDay);

    // endDate를 초과하면 종료
    if (nextDate > endDate) {
      break;
    }

    currentDate = nextDate;
  }

  return dates;
};

const generateYearlyRepeatDates = (event: RepeatEventInput): string[] => {
  const dates: string[] = [];
  let currentDate = new Date(event.date);
  const endDate = new Date(event.endDate);
  const originalMonth = currentDate.getMonth();
  const originalDay = currentDate.getDate();

  while (currentDate <= endDate) {
    dates.push(formatDate(currentDate));

    // 다음 해 계산
    let nextYear = currentDate.getFullYear() + event.interval;

    // 원래 날짜가 다음 해에 존재하지 않는 경우 해당 해를 건너뛰기
    const lastDayOfNextMonth = getLastDayOfMonth(nextYear, originalMonth);

    if (originalDay > lastDayOfNextMonth) {
      // 해당 해를 건너뛰고 다음 해의 같은 날짜로 설정
      nextYear += 1;

      // 다음 해도 원래 날짜가 없으면 계속 건너뛰기
      while (getLastDayOfMonth(nextYear, originalMonth) < originalDay) {
        nextYear += 1;
      }
    }

    const nextDate = new Date(nextYear, originalMonth, originalDay);

    // endDate를 초과하면 종료
    if (nextDate > endDate) {
      break;
    }

    currentDate = nextDate;
  }

  return dates;
};

// 날짜 유효성 검사
const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

// 월의 마지막 날짜 계산
const getLastDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

// 날짜를 YYYY-MM-DD 형식으로 변환
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 반복 일정인지 확인하는 함수
export const isRepeatEvent = (event: Event): boolean => {
  return event.repeat.type !== 'none';
};

// 반복 일정을 단일 수정 이벤트로 생성하는 함수
export const createSingleEditEvent = (originalEvent: Event, targetDate: string): Event => {
  return {
    ...originalEvent,
    id: `${originalEvent.id}-single-edit-${targetDate}`,
    date: targetDate,
    repeat: {
      type: 'none',
      interval: 1,
      endDate: undefined,
    },
  };
};

// 반복 일정 중 특정 일정만 삭제하는 함수
export const deleteSingleRepeatEvent = (events: Event[], eventIdToDelete: string): Event[] => {
  return events.filter((event) => event.id !== eventIdToDelete);
};
