import { Event } from '../types';

export const isRepeatingEvent = (event: Event) => {
  return event.repeat.type !== 'none';
};

export function getRepeatDisplayInfo(event: Event): {
  isRepeating: boolean;
  repeatText: string;
  shouldShowIcon: boolean;
} {
  const isRepeating = event.repeat.type !== 'none';

  if (!isRepeating) {
    return { isRepeating: false, repeatText: '', shouldShowIcon: false };
  }

  const typeText = {
    daily: '일',
    weekly: '주',
    monthly: '월',
    yearly: '년',
    none: '',
  }[event.repeat.type];

  const repeatText = `${event.repeat.interval}${typeText}마다`;

  return {
    isRepeating: true,
    repeatText,
    shouldShowIcon: true,
  };
}

export function getRepeatingEvents(events: Event[]): Event[] {
  return events.filter(isRepeatingEvent);
}

export function groupEventsByRepeatType(events: Event[]): {
  daily: Event[];
  weekly: Event[];
  monthly: Event[];
  yearly: Event[];
  none: Event[];
} {
  const initialGroups = {
    daily: [] as Event[],
    weekly: [] as Event[],
    monthly: [] as Event[],
    yearly: [] as Event[],
    none: [] as Event[],
  };

  return events.reduce((groups, event) => {
    const type = event.repeat.type;
    groups[type].push(event);
    return groups;
  }, initialGroups);
}
