import { formatDate, getDaysInMonth } from './dateUtils.ts';
import { EventForm, RepeatInfo, RepeatType } from '../types.ts';

export const REPEAT_MAX_END_DATE = new Date('2025-10-30T00:00:00');

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function fixEndDate(endDate?: string): Date {
  const target = endDate ? new Date(endDate) : REPEAT_MAX_END_DATE;
  return target > REPEAT_MAX_END_DATE ? REPEAT_MAX_END_DATE : target;
}

export function generateDailyDates(start: string, end: string): string[] {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const step = 1;
  const outputDates: string[] = [];

  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + step)) {
    outputDates.push(formatDate(new Date(d)));
  }
  return outputDates;
}

export function generateWeeklyDates(start: string, end: string): string[] {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const step = 7;
  const outputDates: string[] = [];

  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + step)) {
    outputDates.push(formatDate(new Date(d)));
  }
  return outputDates;
}

export function generateMonthlyDates(start: string, end: string): string[] {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const outputDates: string[] = [];

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
    return outputDates;
  }

  const day = startDate.getDate();

  for (let y = startDate.getFullYear(), m = startDate.getMonth(); ; ) {
    const daysInThisMonth = getDaysInMonth(y, m + 1);

    if (day <= daysInThisMonth) {
      const candidateDate = new Date(y, m, day);

      if (candidateDate > endDate) break;
      if (candidateDate >= startDate) {
        outputDates.push(formatDate(candidateDate));
      }
    }
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }

    if (new Date(y, m, Math.min(day, 28)) > endDate) break;
  }
  return outputDates;
}

export function generateYearlyDates(start: string, end: string): string[] {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const outputDates: string[] = [];

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
    return outputDates;
  }

  const startMonthIndex = startDate.getMonth();
  const day = startDate.getDate();

  for (let y = startDate.getFullYear(); ; y += 1) {
    if (startMonthIndex === 1 && day === 29 && !isLeapYear(y)) {
      if (new Date(y, startMonthIndex, 28) > endDate) break;
      continue;
    }

    const candidateDate = new Date(y, startMonthIndex, day);
    if (candidateDate > endDate) break;
    if (candidateDate >= startDate) {
      outputDates.push(formatDate(candidateDate));
    }
  }
  return outputDates;
}

export function buildRecurringEvents(eventFormData: EventForm): EventForm[] {
  const recurrence = eventFormData.repeat;

  if (!recurrence || recurrence.type === 'none') return [eventFormData];

  const startDate = eventFormData.date;
  const fixedEndDate = fixEndDate(recurrence.endDate);
  const endDate = formatDate(fixedEndDate);

  if (new Date(startDate) > fixedEndDate) return [];

  let occurrenceDates: string[] = [];

  switch (recurrence.type) {
    case 'daily':
      occurrenceDates = generateDailyDates(startDate, endDate);
      break;
    case 'weekly':
      occurrenceDates = generateWeeklyDates(startDate, endDate);
      break;
    case 'monthly':
      occurrenceDates = generateMonthlyDates(startDate, endDate);
      break;
    default:
      return [eventFormData];
  }

  return occurrenceDates.map((date) => ({
    ...eventFormData,
    date,
  }));
}

export function isRecurring<T extends { repeat: { type: RepeatType } }>(target: T): boolean {
  return target.repeat.type !== 'none';
}

// 반복일정에서 단일 일정으로 전환 시에 사용
export function toSingleEventForm<T extends { repeat: RepeatInfo }>(target: T): T {
  const singleRepeat: RepeatInfo = { type: 'none', interval: 1 };
  return { ...target, repeat: singleRepeat };
}