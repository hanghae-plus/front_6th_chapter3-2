import { Event } from '../types';

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = MS_PER_SECOND * 60;

export function getUpcomingEvents(events: Event[], now: Date, notifiedEvents: string[]) {
  return events.filter((event) => {
    const eventStart = new Date(`${event.date}T${event.startTime}`);
    const minutesUntil = (eventStart.getTime() - now.getTime()) / MS_PER_MINUTE;
    const withinWindow = minutesUntil > 0 && minutesUntil <= event.notificationTime;
    const notNotified = !notifiedEvents.includes(event.id);
    return withinWindow && notNotified;
  });
}

export function createNotificationMessage({ notificationTime, title }: Event) {
  return `${notificationTime}분 후 ${title} 일정이 시작됩니다.`;
}
