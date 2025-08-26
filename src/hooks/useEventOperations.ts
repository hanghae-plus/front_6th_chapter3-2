import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';

import { Event } from '../types';
import { createEventOperations } from './useEventOperations.helpers';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const ops = useMemo(
    () => createEventOperations({ editing, onSave, setEvents, enqueueSnackbar }),
    [editing, onSave, setEvents, enqueueSnackbar]
  );

  useEffect(() => {
    void ops.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, ...ops.handlers };
};
