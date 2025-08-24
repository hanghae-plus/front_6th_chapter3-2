import { Notifications } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';

import type { Event } from '../types';
import { isRepeatingEvent, getRepeatIcon } from '../utils/eventUtils';

interface EventItemProps {
  event: Event;
  isNotified: boolean;
}

export function EventItem({ event, isNotified }: EventItemProps) {
  const isRepeating = isRepeatingEvent(event);
  const repeatIcon = isRepeating ? getRepeatIcon(event.repeat.type) : '';

  return (
    <Box
      sx={{
        p: 0.5,
        my: 0.5,
        backgroundColor: isNotified ? '#ffebee' : '#f5f5f5',
        borderRadius: 1,
        fontWeight: isNotified ? 'bold' : 'normal',
        color: isNotified ? '#d32f2f' : 'inherit',
        minHeight: '18px',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {isNotified && <Notifications data-testid="notification-icon" fontSize="small" />}
        {isRepeating && (
          <Typography data-testid="repeat-icon" variant="caption">
            {repeatIcon}
          </Typography>
        )}
        <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
          {event.title}
        </Typography>
      </Stack>
    </Box>
  );
}
