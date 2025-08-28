export function generateRecurringEvents(
  startDate: string,
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
  interval: number,
  repeatEndDate?: string,
  maxOccurrences?: number
): string[] {
  // none 타입인 경우 원본 이벤트만 반환
  if (repeatType === 'none') {
    return [startDate];
  }

  // 반복 횟수가 0 이하인 경우 시작일만 반환
  if (maxOccurrences !== undefined && maxOccurrences <= 0) {
    return [startDate];
  }

  // 기본 종료일 설정 (2025-10-30)
  const DEFAULT_END_DATE = '2025-10-30';

  // 반복 종료일이 시작일보다 이전인 경우 시작일만 반환
  if (repeatEndDate && new Date(repeatEndDate) < new Date(startDate)) {
    return [startDate];
  }

  const dates: string[] = [startDate];
  const start = new Date(startDate);

  // 종료일 결정: 사용자 지정 종료일 > 기본 종료일 > 시작일
  let end: Date;
  if (repeatEndDate) {
    end = new Date(repeatEndDate);
  } else {
    end = new Date(DEFAULT_END_DATE);
    // 시작일이 기본 종료일 이후인 경우 시작일만 반환
    if (start > end) {
      return [startDate];
    }
  }

  // endDate가 startDate보다 이전이면 시작일만 반환
  if (end < start) {
    return [startDate];
  }

  let currentDate = new Date(start);

  switch (repeatType) {
    case 'daily':
      while (true) {
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + interval);
        // date를 기준으로 월을 넘어갔는지 체크
        if (nextDate > end) break;
        // 반복 횟수 제한 체크
        if (maxOccurrences !== undefined && dates.length >= maxOccurrences) break;
        dates.push(nextDate.toISOString().split('T')[0]);
        currentDate = nextDate;
      }
      break;

    case 'weekly':
      while (true) {
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 7 * interval);
        if (nextDate > end) break;
        // 반복 횟수 제한 체크
        if (maxOccurrences !== undefined && dates.length >= maxOccurrences) break;
        dates.push(nextDate.toISOString().split('T')[0]);
        currentDate = nextDate;
      }
      break;

    case 'monthly':
      while (true) {
        // 다음 달로 이동
        const nextMonth = new Date(currentDate);
        nextMonth.setMonth(nextMonth.getMonth() + interval);

        // 31일 특수 케이스 처리
        if (start.getDate() === 31) {
          // 해당 월의 마지막 날짜를 구함
          const lastDayOfMonth = new Date(
            nextMonth.getFullYear(),
            nextMonth.getMonth() + 1,
            0
          ).getDate();
          if (lastDayOfMonth < 31) {
            // 31일이 없는 달이면 건너뛰기
            currentDate = nextMonth;
            continue;
          }
          // 31일이 있는 달이면 31일로 설정
          nextMonth.setDate(31);
        }

        if (nextMonth > end) break;
        // 반복 횟수 제한 체크
        if (maxOccurrences !== undefined && dates.length >= maxOccurrences) break;
        dates.push(nextMonth.toISOString().split('T')[0]);
        currentDate = nextMonth;
      }
      break;

    case 'yearly':
      while (true) {
        const nextYear = new Date(currentDate);
        nextYear.setFullYear(nextYear.getFullYear() + interval);

        // 윤년 2월 29일 특수 케이스 처리
        if (start.getDate() === 29 && start.getMonth() === 1) {
          const isLeapYear = (year: number) =>
            (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

          if (!isLeapYear(nextYear.getFullYear())) {
            // 평년이면 건너뛰기 - 다음 해로 계속 진행
            currentDate = nextYear;
            continue;
          }
          // 윤년이면 정확한 2월 29일로 설정
          nextYear.setMonth(1);
          nextYear.setDate(29);
        }

        if (nextYear > end) break;
        // 반복 횟수 제한 체크
        if (maxOccurrences !== undefined && dates.length >= maxOccurrences) break;
        dates.push(nextYear.toISOString().split('T')[0]);
        currentDate = nextYear;
      }
      break;
  }

  return dates;
}
