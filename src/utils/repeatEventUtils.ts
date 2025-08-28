import { EventForm } from '../types';

export const formatDateString = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export const getRepeatEndDate = (endDate?: string) => {
  return new Date(endDate || '2025-10-30');
};

export const generateRepeatEvents = (event: EventForm) => {
  const events: EventForm[] = [];
  const startDate = new Date(event.date);
  const endDate = getRepeatEndDate(event.repeat.endDate);
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    events.push({
      ...event,
      date: formatDateString(currentDate),
    });

    switch (event.repeat.type) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + event.repeat.interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + event.repeat.interval * 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + event.repeat.interval);

        if (currentDate.getDate() !== startDate.getDate()) {
          currentDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            startDate.getDate()
          );
        }
        break;

      case 'yearly':
        {
          currentDate.setFullYear(currentDate.getFullYear() + event.repeat.interval);

          while (currentDate.getDate() !== startDate.getDate()) {
            currentDate.setFullYear(currentDate.getFullYear() + event.repeat.interval);
            currentDate.setMonth(startDate.getMonth(), startDate.getDate());
          }
        }
        break;
    }
  }

  return events;
};
