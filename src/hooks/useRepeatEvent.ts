import { useMemo } from 'react';

import { EventForm } from '../types';
import { generateRepeatedEvents } from '../utils/repeatUtils';

export const useRepeatEvent = (eventForm: EventForm) => {
  const repeatedEvents = useMemo(() => {
    return generateRepeatedEvents(eventForm);
  }, [eventForm]);

  return {
    repeatedEvents,
    isValidRepeat: repeatedEvents.length > 0,
  };
};
