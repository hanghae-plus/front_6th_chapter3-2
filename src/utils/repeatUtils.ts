import { Event, EventForm, RepeatType } from '../types';

/**
 * 다음 반복 날짜를 계산합니다
 */
export const getNextRepeatDate = (
  currentDate: Date,
  type: RepeatType,
  interval: number,
  originalDate?: string
): Date => {
  const next = new Date(currentDate);

  switch (type) {
    case 'daily':
      next.setDate(next.getDate() + interval);
      break;
    case 'weekly':
      next.setDate(next.getDate() + interval * 7);
      break;
    case 'monthly': {
      // 월 단위 반복에서는 원래 날짜를 유지하려고 시도
      const originalDay = originalDate ? new Date(originalDate).getDate() : next.getDate();
      next.setMonth(next.getMonth() + interval);
      next.setDate(originalDay); // 원래 날짜로 설정 (없으면 자동 조정됨)
      break;
    }
    case 'yearly':
      next.setFullYear(next.getFullYear() + interval);
      break;
    default:
      break;
  }

  return next;
};

/**
 * 반복 날짜가 유효한지 검증합니다 (예: 31일, 2월 29일 등)
 */
export const isValidRepeatDate = (date: Date, type: RepeatType, originalDate: string): boolean => {
  const original = new Date(originalDate);
  const originalDay = original.getDate();
  const originalMonth = original.getMonth();

  // 매월 반복인데 원래 날짜가 31일인 경우
  if (type === 'monthly' && originalDay === 31) {
    return date.getDate() === 31;
  }

  // 매월 반복인데 원래 날짜가 30일인 경우
  if (type === 'monthly' && originalDay === 30) {
    return date.getDate() === 30;
  }

  // 매월 반복인데 원래 날짜가 29일인 경우 (2월 29일 포함)
  if (type === 'monthly' && originalDay === 29) {
    return date.getDate() === 29;
  }

  // 매년 반복인데 원래 날짜가 2월 29일인 경우
  if (type === 'yearly' && originalMonth === 1 && originalDay === 29) {
    return date.getMonth() === 1 && date.getDate() === 29;
  }

  return true;
};

/**
 * 반복 설정이 유효한지 검증합니다
 */
export const validateRepeatSettings = (
  startDate: string,
  endDate?: string,
  interval?: number
): boolean => {
  // 반복 간격이 1 미만이면 무효
  if (interval !== undefined && interval < 1) {
    return false;
  }

  // 종료일이 시작일보다 이전이면 무효
  if (endDate && new Date(endDate) < new Date(startDate)) {
    return false;
  }

  return true;
};

/**
 * 고유 ID를 생성합니다
 */
export const generateEventId = (title: string, date: string): string => {
  return `${title}-${date}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 반복 시리즈 ID를 생성합니다
 */
export const generateRepeatId = (title: string): string => {
  return `repeat-${title}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 반복 일정 배열을 생성합니다
 */
export const generateRepeatedEvents = (eventForm: EventForm): Event[] => {
  const { repeat, date: startDate } = eventForm;

  // 반복 타입이 'none'이면 빈 배열 반환
  if (repeat.type === 'none') {
    return [];
  }

  // 반복 설정 유효성 검증
  if (!validateRepeatSettings(startDate, repeat.endDate, repeat.interval)) {
    return [];
  }

  const events: Event[] = [];
  const endDate = repeat.endDate ? new Date(repeat.endDate) : new Date('2025-10-30');

  let currentDate = new Date(startDate);
  const repeatId = generateRepeatId(eventForm.title);

  // 무한 루프 방지 (최대 1000개)
  let count = 0;
  const MAX_EVENTS = 1000;

  while (currentDate <= endDate && count < MAX_EVENTS) {
    // 예외 날짜 처리 (31일, 2월 29일 등)
    if (isValidRepeatDate(currentDate, repeat.type, startDate)) {
      const dateStr = currentDate.toISOString().split('T')[0];

      events.push({
        ...eventForm,
        id: generateEventId(eventForm.title, dateStr),
        date: dateStr,
        repeat: {
          ...repeat,
          id: repeatId,
        },
      });
    }

    // 다음 날짜 계산
    currentDate = getNextRepeatDate(currentDate, repeat.type, repeat.interval, startDate);
    count++;
  }

  return events;
};
