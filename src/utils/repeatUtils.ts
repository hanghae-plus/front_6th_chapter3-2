import { EventForm, Event, RepeatType } from '../types';
import { formatDate, getDaysInMonth } from './dateUtils';

export function generateRepeatEvents(baseEvent: Event | EventForm, endDate?: string): Event[] {
  // 1단계: 반복이 없으면 빈 배열
  if (baseEvent.repeat.type === 'none') {
    return [];
  }

  // 2단계: 시작일과 종료일 설정
  const startDate = new Date(baseEvent.date);
  const finalEndDate = endDate || baseEvent.repeat.endDate;

  if (!finalEndDate) {
    return []; // 종료일이 없으면 무한 반복 방지
  }

  // 3단계: 반복 생성 루프
  const events: Event[] = [];
  const currentDate = new Date(startDate);
  const type = baseEvent.repeat.type;
  const targetDay = startDate.getDate();
  const targetMonth = startDate.getMonth();
  const isLeapDayEvent = targetMonth === 1 && targetDay === 29; // 2월 29일 이벤트인지 확인

  while (currentDate <= new Date(finalEndDate)) {
    // 4단계: 이벤트 생성 조건 확인
    let shouldCreateEvent = true;

    if (type === 'yearly' && isLeapDayEvent) {
      // 2월 29일 이벤트는 윤년에만 생성
      shouldCreateEvent = isLeapYear(currentDate.getFullYear());
    } else if (type === 'monthly') {
      // monthly의 경우 해당 달에 목표 날짜가 존재하는지 확인
      const daysInCurrentMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).getDate();
      const targetDayExists = targetDay <= daysInCurrentMonth;
      const dateMatches = currentDate.getDate() === targetDay;

      shouldCreateEvent = targetDayExists && dateMatches;
    }

    if (shouldCreateEvent) {
      const newEvent: Event = {
        ...baseEvent,
        id: crypto.randomUUID(),
        date: formatDate(currentDate),
      };
      events.push(newEvent);
    }

    // 5단계: 다음 날짜로 이동
    moveToNextDate(currentDate, type, baseEvent.repeat.interval, targetDay, targetMonth);
  }
  return events;
}

function moveToNextDate(
  date: Date,
  type: RepeatType,
  interval: number,
  targetDay: number,
  targetMonth?: number
) {
  switch (type) {
    case 'daily':
      date.setDate(date.getDate() + interval);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7 * interval);
      break;
    case 'monthly': {
      // 현재 년도와 월 저장
      let nextYear = date.getFullYear();
      let nextMonth = date.getMonth() + interval;

      // 12월을 넘어가는 경우 처리
      while (nextMonth > 11) {
        nextYear++;
        nextMonth -= 12;
      }

      // 해당 월의 일수 직접 계산
      const daysInTargetMonth = getDaysInMonth(nextYear, nextMonth + 1);
      // 목표 날짜 계산
      const finalDay = targetDay <= daysInTargetMonth ? targetDay : daysInTargetMonth;

      // 새로운 날짜를 한 번에 설정 (월, 일 동시 설정으로 자동 조정 방지)
      date.setFullYear(nextYear, nextMonth, finalDay);

      break;
    }
    case 'yearly': {
      // 연도 추가
      date.setFullYear(date.getFullYear() + interval);

      // 원래 월과 일로 정확히 설정
      if (targetMonth !== undefined) {
        date.setMonth(targetMonth, 1); // 월과 함께 1일로 설정

        // 2월 29일의 경우 윤년이 아니면 건너뛰기 위해 일단 설정
        if (targetMonth === 1 && targetDay === 29) {
          // 2월 29일: 윤년에만 존재
          if (isLeapYear(date.getFullYear())) {
            date.setDate(29);
          } else {
            // 평년이면 일부러 2월 28일로 설정해서 상위에서 걸러지도록
            date.setDate(28);
          }
        } else {
          date.setDate(targetDay);
        }
      }
      break;
    }
  }
}
// 윤년 판별 함수
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
