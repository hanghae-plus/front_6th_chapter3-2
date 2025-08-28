import { Event } from '../types';

export const isRepeatingEvent = (event: Event): boolean => {
  return event.repeat.type !== 'none';
};

export const getEventBackgroundColor = (event: Event, isNotified: boolean): string => {
  if (isNotified) {
    return '#ffebee';
  }

  if (isRepeatingEvent(event)) {
    return '#e3f2fd';
  }

  return '#f5f5f5';
};

export const getEventBorderStyle = (event: Event): string => {
  if (isRepeatingEvent(event)) {
    return '4px solid #1976d2';
  }

  return 'none';
};

export const shouldShowRepeatingIcon = (event: Event): boolean => {
  return isRepeatingEvent(event);
};

export const getRepeatingIconStyle = () => {
  return {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#1976d2',
    display: 'inline-block',
    marginRight: '4px',
  };
};
