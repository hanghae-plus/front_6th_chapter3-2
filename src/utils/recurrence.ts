// utils/recurrence.ts
import { Event } from '../types.ts';
import { getDaysInMonth, formatDate } from './dateUtils.ts'; // 경로는 네 구조에 맞게

type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export function generateRecurringEvents(seed: Event): Event[] {
  const { repeat } = seed;

  if (!repeat || repeat.type === 'none' || !repeat.endDate) {
    return [seed];
  }

  const type = repeat.type as RepeatType;
  const interval = Math.max(1, repeat.interval || 1);

  const start = new Date(seed.date);
  const end = new Date(repeat.endDate);

  // 월/년 증가 시 기준이 되는 시작일(일자/월) 저장
  const anchorDay = start.getDate();
  const anchorMonth = start.getMonth(); // 0-11

  const results: Event[] = [];
  let cur = new Date(start.getTime());

  // 윤년 2/29 시작 여부
  const isStartFeb29 = anchorMonth === 1 && anchorDay === 29;

  while (cur.getTime() <= end.getTime()) {
    // yearly에서 시작이 2/29인 경우, 비윤년은 건너뛰기
    if (type === 'yearly' && isStartFeb29) {
      const y = cur.getFullYear();
      if (!isLeapYear(y)) {
        // 다음 후보 연도로 점프
        cur = addYearsPreserveFeb29(cur, interval);
        continue;
      }
    }

    results.push(withDate(seed, formatDate(cur)));

    // 다음 반복으로 이동
    switch (type) {
      case 'daily':
        cur = addDays(cur, interval);
        break;
      case 'weekly':
        cur = addDays(cur, 7 * interval);
        break;
      case 'monthly':
        cur = addMonthsPreserveDay(cur, interval, anchorDay);
        break;
      case 'yearly':
        if (isStartFeb29) {
          // 위에서 leap만 푸시했으므로 다음 leap 후보로 점프
          cur = addYearsPreserveFeb29(cur, interval);
        } else {
          cur = addYearsPreserveDay(cur, interval, anchorMonth, anchorDay);
        }
        break;
      default:
        return results;
    }
  }

  return results;
}

export function hasRecurringIcon(events: Event[]): boolean {
  // 반복 아이콘 표시 기준: repeat.type !== 'none'
  return events.some((e) => e.repeat?.type && e.repeat.type !== 'none');
}

type Patch = Partial<Event>;

export function updateRecurringOccurrence(
  events: Event[],
  opts: { seriesId: string; date: string; startTime: string; patch: Patch }
): Event[] {
  const { seriesId, date, startTime, patch } = opts;

  return events.map((ev) => {
    const sameSeries = ev.id === seriesId; // 시리즈 식별(필요시 seriesId 필드 따로 둘 수도 있음)
    const sameDateTime = ev.date === date && ev.startTime === startTime;

    if (sameSeries && sameDateTime) {
      // 해당 occurrence만 패치
      return { ...ev, ...patch };
    }
    return ev;
  });
}

export function deleteRecurringOccurrence(
  events: Event[],
  opts: { seriesId: string; date: string; startTime: string }
): Event[] {
  const { seriesId, date, startTime } = opts;

  // 해당 시리즈의 특정 날짜/시간 occurrence만 제거
  return events.filter((ev) => {
    const sameSeries = ev.id === seriesId;
    const sameDateTime = ev.date === date && ev.startTime === startTime;
    // sameSeries && sameDateTime 인 그 한 건만 제외하고 나머지는 유지
    return !(sameSeries && sameDateTime);
  });
}

/* ================= helpers (유틸 사용 버전) ================= */

function withDate(seed: Event, isoDate: string): Event {
  // id 고유 필요 시 suffix 부여 (원하면 유지해도 됨)
  return { ...seed, date: isoDate };
}

function addDays(d: Date, days: number): Date {
  const nd = new Date(d.getTime());
  nd.setDate(nd.getDate() + days);
  return nd;
}

function addMonthsPreserveDay(d: Date, months: number, anchorDay: number): Date {
  const y = d.getFullYear();
  const m = d.getMonth(); // 0-11
  const targetMonthIndex = m + months;
  const targetYear = y + Math.floor(targetMonthIndex / 12);
  const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12; // 0-11

  const lastDay = getDaysInMonth(targetYear, normalizedMonth + 1); // getDaysInMonth는 1-12 기준
  const day = Math.min(anchorDay, lastDay);

  return new Date(targetYear, normalizedMonth, day);
}

function addYearsPreserveDay(d: Date, years: number, anchorMonth: number, anchorDay: number): Date {
  const y = d.getFullYear() + years;
  const lastDay = getDaysInMonth(y, anchorMonth + 1);
  const day = Math.min(anchorDay, lastDay);
  return new Date(y, anchorMonth, day);
}

function addYearsPreserveFeb29(d: Date, years: number): Date {
  // 다음 후보 연도로 점프 (leap만 유효)
  const nextYear = d.getFullYear() + years;
  // 2월 말일 검사해서 leap 아니면 2/29는 존재하지 않음 -> 루프에서 건너뜀
  return new Date(nextYear, 1, 29);
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
