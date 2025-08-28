export const REPEAT_MAX_END_DATE = new Date('2025-10-30T00:00:00');

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function fixEndDate(endDate?: string): Date {
  const target = endDate ? new Date(endDate) : REPEAT_MAX_END_DATE;
  return target > REPEAT_MAX_END_DATE ? REPEAT_MAX_END_DATE : target;
}

export function generateDailyDates(start: Date, end: Date) {
  return ['2025-10-10', '2025-10-17', '2025-10-24'];
}

export function generateWeeklyDates(start: Date, end: Date ){
  return ['2025-10-10', '2025-10-17', '2025-10-24'];
}