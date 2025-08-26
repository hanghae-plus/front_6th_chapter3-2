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
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * 날짜에 연수를 더하는 헬퍼 함수
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * 날짜를 YYYY-MM-DD 형식의 문자열로 변환하는 헬퍼 함수
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 반복 패턴에 따른 날짜 배열을 생성하는 함수
 */
export function calculateRepeatingDates(repeatInfo: RepeatInfo, startDate: string): string[] {
  if (repeatInfo.type === 'none') return [startDate];
  return generateDates(repeatInfo, startDate);
}

function resolveEndDate(info: RepeatInfo): Date | null {
  const CAP_ISO = '2025-10-30';
  const capDate = new Date(CAP_ISO);
  if (info.endDate) return new Date(info.endDate);
  return capDate;
}

function getMaxIterations(info: RepeatInfo): number {
  return info.endDate ? Number.MAX_SAFE_INTEGER : 9;
}

function isExcluded(info: RepeatInfo, iso: string): boolean {
  return Array.isArray(info.excludeDates) && info.excludeDates.includes(iso);
}

function nextDaily(current: Date, interval: number): Date {
  return addDays(current, interval);
}

function nextWeekly(info: RepeatInfo, start: Date, current: Date): Date {
  if (!Array.isArray(info.weekdays) || info.weekdays.length === 0) {
    return addWeeks(current, info.interval);
  }

  const weekMs = 7 * 24 * 60 * 60 * 1000;
  let probe = addDays(current, 1);
  while (true) {
    const weeksBetween = Math.floor((probe.getTime() - start.getTime()) / weekMs);
    const isAlignedWeek = weeksBetween % info.interval === 0;
    const isSelected = info.weekdays.includes(probe.getDay());
    if (isAlignedWeek && isSelected) return probe;
    probe = addDays(probe, 1);
  }
}

function nextMonthly(
  iteration: number,
  start: Date,
  interval: number,
  startDay: number
): Date | null {
  const monthsToAdd = (iteration + 1) * interval;
  const tentative = new Date(start);
  tentative.setMonth(start.getMonth() + monthsToAdd);
  if (tentative.getDate() !== startDay) return null;
  return tentative;
}

function nextYearly(
  iteration: number,
  start: Date,
  interval: number,
  startDay: number
): Date | null {
  const yearsToAdd = (iteration + 1) * interval;
  const tentative = new Date(start);
  tentative.setFullYear(start.getFullYear() + yearsToAdd);
  if (start.getMonth() === 1 && startDay === 29) {
    if (!(tentative.getMonth() === 1 && tentative.getDate() === 29)) return null;
  }
  return tentative;
}

function getNextDate(
  info: RepeatInfo,
  start: Date,
  current: Date,
  iteration: number,
  startDay: number
): Date | null {
  switch (info.type) {
    case 'daily':
      return nextDaily(current, info.interval);
    case 'weekly':
      return nextWeekly(info, start, current);
    case 'monthly':
      return nextMonthly(iteration, start, info.interval, startDay);
    case 'yearly':
      return nextYearly(iteration, start, info.interval, startDay);
    default:
      return null;
  }
}

function generateDates(info: RepeatInfo, startStr: string): string[] {
  const start = new Date(startStr);
  const end = resolveEndDate(info);
  const max = getMaxIterations(info);
  const startDay = start.getDate();
  const rest = collectFollowingDates(info, start, end, startDay, max);
  return [formatDate(start), ...rest];
}

function collectFollowingDates(
  info: RepeatInfo,
  start: Date,
  end: Date | null,
  startDay: number,
  max: number
): string[] {
  const collected: string[] = [];
  let current = new Date(start);
  let i = 0;
  while (i < max) {
    const next = getNextDate(info, start, current, i, startDay);
    if (!next) {
      i++;
      continue;
    }
    if (end && next > end) break;
    const iso = formatDate(next);
    if (!isExcluded(info, iso)) collected.push(iso);
    current = next;
    i++;
  }
  return collected;
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
  if (!isValidType(repeatInfo.type)) return false;
  if (!isValidInterval(repeatInfo.interval)) return false;
  if (isNoneType(repeatInfo)) return true;

  const hasAnyInvalid =
    isEndDateInvalid(repeatInfo) ||
    hasInvalidExcludeDatesList(repeatInfo) ||
    hasInvalidWeeklySelection(repeatInfo);

  return !hasAnyInvalid;
}

function isValidType(type: RepeatInfo['type']): boolean {
  return ['none', 'daily', 'weekly', 'monthly', 'yearly'].includes(type);
}

function isValidInterval(interval: number): boolean {
  return Number.isInteger(interval) && interval >= 1 && interval <= 99;
}

function isValidFutureDate(dateStr: string): boolean {
  if (!isValidDateString(dateStr)) return false;
  const endDate = new Date(dateStr);
  const today = new Date(Date.now());
  endDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return endDate >= today;
}

function isValidExcludeDatesList(info: RepeatInfo): boolean {
  const dates = info.excludeDates ?? [];
  const seen = new Set<string>();
  const end = info.endDate ? new Date(info.endDate) : null;

  for (const dateStr of dates) {
    if (isInvalidExcludeDate(dateStr, seen, end)) return false;
    seen.add(dateStr);
  }
  return true;
}

function isValidWeekdays(weekdays?: number[]): boolean {
  if (!Array.isArray(weekdays) || weekdays.length === 0) return false;
  return weekdays.every((d) => Number.isInteger(d) && d >= 0 && d <= 6);
}

function isNoneType(info: RepeatInfo): boolean {
  return info.type === 'none';
}

function isEndDateInvalid(info: RepeatInfo): boolean {
  return Boolean(info.endDate) && !isValidFutureDate(info.endDate as string);
}

function hasInvalidExcludeDatesList(info: RepeatInfo): boolean {
  return Array.isArray(info.excludeDates) && !isValidExcludeDatesList(info);
}

function hasInvalidWeeklySelection(info: RepeatInfo): boolean {
  return info.type === 'weekly' && Boolean(info.weekdays) && !isValidWeekdays(info.weekdays);
}

function isInvalidExcludeDate(dateStr: string, seen: Set<string>, end: Date | null): boolean {
  if (!isValidDateString(dateStr)) return true;
  if (hasSeen(seen, dateStr)) return true;
  if (isAfterEnd(end, dateStr)) return true;
  return false;
}

function hasSeen(seen: Set<string>, dateStr: string): boolean {
  return seen.has(dateStr);
}

function isAfterEnd(end: Date | null, dateStr: string): boolean {
  return end !== null && new Date(dateStr) > end;
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

  const endLimit = computeEndLimit(end, limitEnd);
  const set = new Set(existing);
  for (let d = new Date(start); d <= endLimit; d = addDays(d, 1)) {
    set.add(formatDate(d));
  }
  return Array.from(set).sort();
}

function computeEndLimit(end: Date, limitEnd?: string): Date {
  if (!limitEnd || !isValidDateString(limitEnd)) return end;
  const last = new Date(limitEnd);
  return last < end ? last : end;
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
  // 그룹 ID 부여: 반복 이벤트면 동일한 repeat.id 유지/생성
  const groupId = repeatInfo.id ?? generateUUID();
  const repeatWithGroup: RepeatInfo = { ...repeatInfo, id: groupId };

  // 각 날짜에 대해 이벤트 인스턴스 생성
  return dates.map((date) => ({
    ...baseEvent,
    id: generateUUID(), // 각 인스턴스에 고유 ID 부여
    date,
    repeat: repeatWithGroup,
  }));
}
