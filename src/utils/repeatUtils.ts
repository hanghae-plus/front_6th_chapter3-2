import { formatDate } from './dateUtils.ts';

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
