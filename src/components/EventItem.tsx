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
      <Stack direction="row" spacing={1} alignItems="center">
        {isNotified && <Notifications data-testid="notification-icon" fontSize="small" />}
        {isRepeating && (
          <Typography
            data-testid="repeat-icon"
            variant="caption"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '1rem', // 아이콘 크기 조정
              opacity: 0.8, // 약간 투명하게
            }}
          >
            {repeatIcon}
          </Typography>
        )}
        <Typography
          variant="caption"
          noWrap
          sx={{
            fontSize: '0.75rem',
            lineHeight: 1.2,
            flex: 1, // 제목이 남은 공간을 채우도록
          }}
        >
          {event.title}
        </Typography>
      </Stack>
    </Box>
  );
}
