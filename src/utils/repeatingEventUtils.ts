import { RepeatInfo, Event } from '../types';

/**
 * 반복 패턴에 따른 날짜 배열을 생성하는 함수
 * @param repeatInfo 반복 설정 정보
 * @param startDate 시작 날짜
 * @returns 반복되는 날짜들의 배열
 */
/**
 * 날짜에 일수를 더하는 헬퍼 함수
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 날짜에 주수를 더하는 헬퍼 함수
 */
function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * 날짜에 월수를 더하는 헬퍼 함수
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * 날짜에 연수를 더하는 헬퍼 함수
 */
function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * 날짜를 YYYY-MM-DD 형식의 문자열로 변환하는 헬퍼 함수
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 반복 패턴에 따른 날짜 배열을 생성하는 함수
 */
export function calculateRepeatingDates(repeatInfo: RepeatInfo, startDate: string): string[] {
  // 반복하지 않는 일정인 경우 시작 날짜만 반환
  if (repeatInfo.type === 'none') {
    return [startDate];
  }

  const dates: string[] = [];
  const start = new Date(startDate);
  const end = repeatInfo.endDate ? new Date(repeatInfo.endDate) : null;

  let currentDate = new Date(start);

  // 첫 번째 날짜 추가
  dates.push(formatDate(currentDate));

  // 종료 날짜가 없는 경우 최대 10회까지만 반복
  const maxIterations = 10;
  let iteration = 0;

  while (iteration < maxIterations) {
    let nextDate: Date;

    switch (repeatInfo.type) {
      case 'daily':
        nextDate = addDays(currentDate, repeatInfo.interval);
        break;
      case 'weekly':
        // 요일 지정이 있는 경우, 하루씩 전진하며 주차 간격과 요일을 필터링
        if (Array.isArray(repeatInfo.weekdays) && repeatInfo.weekdays.length > 0) {
          nextDate = addDays(currentDate, 1);
          // 주차 간격 필터 (시작일 기준)
          const weeksBetween = Math.floor(
            (nextDate.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)
          );
          const day = nextDate.getDay();
          const isAlignedWeek = weeksBetween % repeatInfo.interval === 0;
          const isSelectedWeekday = repeatInfo.weekdays.includes(day);
          if (!isAlignedWeek || !isSelectedWeekday) {
            // 다음 루프에서 다시 검사
            currentDate = nextDate;
            iteration++;
            continue;
          }
          break;
        }
        nextDate = addWeeks(currentDate, repeatInfo.interval);
        break;
      case 'monthly':
        nextDate = addMonths(currentDate, repeatInfo.interval);
        break;
      case 'yearly':
        nextDate = addYears(currentDate, repeatInfo.interval);
        break;
      default:
        return dates;
    }

    // 종료 날짜를 넘어가면 중단
    if (end && nextDate > end) {
      break;
    }

    const nextStr = formatDate(nextDate);
    // 제외 날짜가 설정된 경우 필터링
    if (repeatInfo.excludeDates && repeatInfo.excludeDates.includes(nextStr)) {
      currentDate = nextDate;
      iteration++;
      continue;
    }
    dates.push(nextStr);
    currentDate = nextDate;
    iteration++;
  }

  return dates;
}

/**
 * 간격/유형/종료일 정보를 사람이 읽을 수 있는 문구로 변환
 */
export function formatRepeatPreview(repeatInfo: RepeatInfo): string {
  if (repeatInfo.type === 'none') return '반복 안 함';
  const unit =
    repeatInfo.type === 'daily'
      ? '일'
      : repeatInfo.type === 'weekly'
        ? '주'
        : repeatInfo.type === 'monthly'
          ? '개월'
          : '년';
  const base = `${repeatInfo.interval}${unit}마다`;
  return repeatInfo.endDate ? `${base} (종료: ${repeatInfo.endDate})` : base;
}

/**
 * 반복 설정의 유효성을 검사하는 함수
 * @param repeatInfo 반복 설정 정보
 * @returns 유효성 검사 결과
 */
/**
 * 날짜 문자열이 유효한 형식인지 검사하는 헬퍼 함수
 */
function isValidDateString(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * 반복 설정의 유효성을 검사하는 함수
 */
export function validateRepeatSettings(repeatInfo: RepeatInfo): boolean {
  // 반복 타입이 유효한지 검사
  const validTypes: RepeatInfo['type'][] = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
  if (!validTypes.includes(repeatInfo.type)) {
    return false;
  }

  // 반복 간격이 유효한지 검사 (1-99 범위의 정수)
  if (
    !Number.isInteger(repeatInfo.interval) ||
    repeatInfo.interval < 1 ||
    repeatInfo.interval > 99
  ) {
    return false;
  }

  // 반복하지 않는 일정인 경우 추가 검증 불필요
  if (repeatInfo.type === 'none') {
    return true;
  }

  // 종료 날짜가 있는 경우 검증
  if (repeatInfo.endDate) {
    // 날짜 형식이 유효한지 검사
    if (!isValidDateString(repeatInfo.endDate)) {
      return false;
    }

    // 종료 날짜가 현재 날짜보다 이후인지 검사
    const endDate = new Date(repeatInfo.endDate);
    const today = new Date(Date.now());

    // 날짜만 비교하기 위해 시간을 00:00:00으로 설정
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (endDate < today) {
      return false;
    }
  }

  // 제외 날짜 유효성 (옵션): 형식/중복/범위
  if (Array.isArray(repeatInfo.excludeDates)) {
    const seen = new Set<string>();
    for (const d of repeatInfo.excludeDates) {
      if (!isValidDateString(d)) return false;
      if (seen.has(d)) return false;
      seen.add(d);
      if (repeatInfo.endDate) {
        const target = new Date(d);
        const end = new Date(repeatInfo.endDate);
        if (target > end) return false;
      }
    }
  }

  return true;
}

/**
 * 제외 날짜 범위를 기존 목록과 병합하여 정렬/중복 제거된 배열을 반환
 */
export function mergeExcludeDateRange(
  existing: string[],
  rangeStart: string,
  rangeEnd: string,
  limitEnd?: string
): string[] {
  if (!isValidDateString(rangeStart) || !isValidDateString(rangeEnd)) return existing;
  const start = new Date(rangeStart);
  const end = new Date(rangeEnd);
  if (start > end) return existing;
  const last = limitEnd && isValidDateString(limitEnd) ? new Date(limitEnd) : null;

  const set = new Set(existing);
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    const iso = formatDate(d);
    if (last && d > last) break;
    set.add(iso);
  }
  return Array.from(set).sort();
}

/**
 * 반복 일정 인스턴스들을 생성하는 함수
 * @param repeatInfo 반복 설정 정보
 * @param baseEvent 기본 이벤트
 * @returns 생성된 이벤트 인스턴스들의 배열
 */
/**
 * UUID를 생성하는 헬퍼 함수
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 반복 일정 인스턴스들을 생성하는 함수
 */
export function generateEventInstances(repeatInfo: RepeatInfo, baseEvent: Event): Event[] {
  // 반복하지 않는 일정인 경우 기본 이벤트만 반환
  if (repeatInfo.type === 'none') {
    return [baseEvent];
  }

  // 반복 날짜 계산
  const dates = calculateRepeatingDates(repeatInfo, baseEvent.date);

  // 각 날짜에 대해 이벤트 인스턴스 생성
  return dates.map((date) => ({
    ...baseEvent,
    id: generateUUID(), // 각 인스턴스에 고유 ID 부여
    date,
    repeat: repeatInfo,
  }));
}
