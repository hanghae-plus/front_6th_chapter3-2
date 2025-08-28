import { EventForm } from '../types.ts';

export function repeatingDates(eventForm: EventForm): EventForm[] {
  const { date: startDate, repeat, ...rest } = eventForm;
  const dates: string[] = [];
  const MAX_REPEAT_END_DATE = '2025-10-30';

  const endDateStr = repeat.endDate ?? MAX_REPEAT_END_DATE;
  const end = new Date(endDateStr);

  if (repeat.type === 'daily') {
    const start = new Date(startDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + repeat.interval)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates.map((date) => ({
      ...rest,
      date,
      repeat,
    }));
  }

  if (repeat.type === 'weekly') {
    const start = new Date(startDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + repeat.interval * 7)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates.map((date) => ({
      ...rest,
      date,
      repeat,
    }));
  }

  if (repeat.type === 'monthly') {
    const start = new Date(startDate);
    const end = new Date(endDateStr);
    let year = start.getFullYear();
    let month = start.getMonth();
    const day = start.getDate();
    let current = new Date(start);

    while (current <= end) {
      if (day === 31) {
        const temp = new Date(year, month, 31);
        if (temp.getMonth() === month && temp <= end && temp >= start) {
          dates.push(temp.toISOString().split('T')[0]);
        }
      } else {
        const temp = new Date(year, month, day);
        if (temp <= end && temp >= start) {
          dates.push(temp.toISOString().split('T')[0]);
        }
      }
      month += repeat.interval;
      year += Math.floor(month / 12);
      month = month % 12;
      current = new Date(year, month, day);
    }
    return dates.map((date) => ({
      ...rest,
      date,
      repeat,
    }));
  }

  if (repeat.type === 'yearly') {
    const start = new Date(startDate);
    const end = new Date(endDateStr);
    let year = start.getFullYear();
    const month = start.getMonth();
    const day = start.getDate();

    while (true) {
      let temp;
      if (month === 1 && day === 29) {
        temp = new Date(year, 1, 29);
        if (temp > end) break;
        if (temp.getDate() === 29 && temp.getMonth() === 1) {
          dates.push(temp.toISOString().split('T')[0]);
        }
      } else {
        temp = new Date(year, month, day);
        if (temp > end) break;
        dates.push(temp.toISOString().split('T')[0]);
      }
      year += repeat.interval;
    }
    return dates.map((date) => ({
      ...rest,
      date,
      repeat,
    }));
  }
  return dates.map((date) => ({
    ...rest,
    date,
    repeat,
  }));
}
