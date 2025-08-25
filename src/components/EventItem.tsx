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
      data-testid="event-item"
      sx={{
        p: 0.5,
        my: 0.5,
        backgroundColor: isNotified
          ? '#ffebee'
          : isRepeating
            ? '#e3f2fd' // 반복 일정은 파란색 계열 배경
            : '#f5f5f5',
        borderRadius: 1,
        fontWeight: isNotified ? 'bold' : 'normal',
        color: isNotified ? '#d32f2f' : 'inherit',
        minHeight: '18px',
        width: '100%',
        overflow: 'hidden',
        transition: 'background-color 0.2s ease', // 부드러운 전환 효과
        '&:hover': {
          backgroundColor: isNotified ? '#ffcdd2' : isRepeating ? '#bbdefb' : '#eeeeee',
        },
      }}
    >
      <Stack spacing={0.25}>
        <Stack direction="row" spacing={1} alignItems="center">
          {isNotified && <Notifications data-testid="notification-icon" fontSize="small" />}
          {isRepeating && (
            <Typography
              data-testid="repeat-icon"
              variant="caption"
              sx={{ display: 'flex', alignItems: 'center', fontSize: '1rem', opacity: 0.8 }}
            >
              {repeatIcon}
            </Typography>
          )}
          <Typography
            variant="caption"
            noWrap
            sx={{ fontSize: '0.75rem', lineHeight: 1.2, flex: 1 }}
          >
            {event.title}
          </Typography>
        </Stack>
        {isRepeating && (
          <Typography variant="caption" color="text.secondary">
            반복: {event.repeat.interval}
            {event.repeat.type === 'daily' && '일'}
            {event.repeat.type === 'weekly' && '주'}
            {event.repeat.type === 'monthly' && '월'}
            {event.repeat.type === 'yearly' && '년'}
            마다
            {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
            {Array.isArray(event.repeat.excludeDates) &&
              event.repeat.excludeDates.length > 0 &&
              `, 제외 ${event.repeat.excludeDates.length}일`}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
