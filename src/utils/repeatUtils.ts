import { Event, EventForm } from '../types';
import { formatDate } from './dateUtils';

const ONE_DAY = 60 * 60 * 24 * 1000;
const ONE_WEEK = 60 * 60 * 24 * 7 * 1000;

function getRepeatConfig(event: Event | EventForm) {
  return {
    endDate: event.repeat.endDate || '2025-10-30',
    interval: event.repeat.interval || 1,
    endDateTime: new Date(event.repeat.endDate || '2025-10-30').getTime(),
  };
}

export function generateRecurringDates(event: Event | EventForm) {
  const repeatType = event.repeat.type;
  const startData = event.date;
  const interval = event.repeat.interval;

  if (repeatType === 'none') {
    return [startData];
  }

  if (interval <= 0 || interval === Infinity) {
    return [startData];
  }

  if (repeatType === 'daily') {
    const { endDateTime, interval } = getRepeatConfig(event);

    const startDateTime = new Date(event.date).getTime();

    const dateArr = [];
    let temp = startDateTime;
    while (temp <= endDateTime) {
      dateArr.push(formatDate(new Date(temp)));
      temp += ONE_DAY * interval;
    }
    return dateArr;
  }

  if (repeatType === 'weekly') {
    const { endDateTime, interval } = getRepeatConfig(event);
    const startDateTime = new Date(event.date).getTime();

    const dateArr = [];
    let temp = startDateTime;
    while (temp <= endDateTime) {
      dateArr.push(formatDate(new Date(temp)));
      temp += ONE_WEEK * interval;
    }
    return dateArr;
  }

  if (repeatType === 'monthly') {
    const { endDateTime, interval } = getRepeatConfig(event);

    const dateArr = [];
    let currentDate = new Date(event.date);
    const originalDate = currentDate.getDate();

    while (currentDate.getTime() <= endDateTime) {
      if (currentDate.getDate() === originalDate) {
        dateArr.push(formatDate(currentDate));
      }

      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + interval);
      nextMonth.setDate(originalDate);
      currentDate = nextMonth;
    }
    return dateArr;
  }

  if (repeatType === 'yearly') {
    const { endDateTime, interval } = getRepeatConfig(event);

    const dateArr = [];
    let currentDate = new Date(event.date);
    const originalMonth = currentDate.getMonth();
    const originalDate = currentDate.getDate();

    while (currentDate.getTime() <= endDateTime) {
      if (currentDate.getMonth() === originalMonth && currentDate.getDate() === originalDate) {
        dateArr.push(formatDate(currentDate));
      }

      const nextYear = new Date(currentDate);
      nextYear.setFullYear(nextYear.getFullYear() + interval);
      nextYear.setMonth(originalMonth);
      nextYear.setDate(originalDate);
      currentDate = nextYear;
    }
    return dateArr;
  }

  return [startData];
}
