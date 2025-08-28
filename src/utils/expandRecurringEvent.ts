import { Event } from '../types';

export const expandRecurringEvent = (mockEvent: Event) => {
  const repeatType = mockEvent.repeat?.type;

  // 반복 일정이 아니라면 원본 이벤트만 반환
  if (!repeatType || repeatType === 'none') {
    return [mockEvent];
  }

  // endDate가 없으면 원본 이벤트만 반환
  if (!mockEvent.repeat.endDate) {
    return [mockEvent];
  }

  const startDate = new Date(mockEvent.date);
  const endDate = new Date(mockEvent.repeat.endDate);

  // 종료일이 시작일 이후여야 함
  if (startDate >= endDate) {
    return [mockEvent]; // 유효하지 않은 경우 원본 이벤트만 반환
  }

  const events = [] as Event[];
  const interval = mockEvent.repeat.interval || 1;

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // 윤년 체크 -> 2/29 시작일은 비윤년을 건너뛰되, 기준 날짜를 항상 2/29로 유지
    if (repeatType === 'yearly' && startDate.getMonth() === 1 && startDate.getDate() === 29) {
      if (!isLeapYear(currentDate.getFullYear())) {
        const nextYear = currentDate.getFullYear() + interval;
        currentDate = new Date(nextYear, 1, 29);
        continue;
      }
    }

    const eventDate = currentDate.toISOString().split('T')[0]; // 2025-08-25 형태로 변환

    events.push({
      ...mockEvent,
      date: eventDate,
    });

    switch (repeatType) {
      case 'daily': {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + interval);
        currentDate = newDate;
        break;
      }

      case 'weekly': {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + interval * 7);
        currentDate = newDate;
        break;
      }

      case 'monthly': {
        // 매월 반복은 같은 일이 반복되어야 하기 때문에 day를 구함
        const originalDay = startDate.getDate(); // 처음 시작한 날짜

        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + interval); // 다음 달로
        newDate.setDate(originalDay); // 원래 일자로 설정 시도

        // 만약 해당 달에 그 날짜가 없다면(originalDay)
        if (newDate.getDate() !== originalDay) {
          // 건너뛰고 다음 달로
          currentDate = newDate;
          continue;
        }

        currentDate = newDate;
        break;
      }
      case 'yearly': {
        const originalMonth = startDate.getMonth();
        const originalDay = startDate.getDate();

        const newYear = currentDate.getFullYear() + interval;
        let newDate = new Date(newYear, originalMonth, originalDay);

        // 2/29 반복: 다음 해가 비윤년이면 2/29로 유지한 채 스킵
        if (originalMonth === 1 && originalDay === 29) {
          if (!isLeapYear(newYear)) {
            currentDate = new Date(newYear, 1, 29);
            continue;
          }
        }

        currentDate = newDate;
        break;
      }
    }
  }

  return events;
};

// 윤년 판별
const isLeapYear = (year: number) => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};
