import { Repeat } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';

import { getRepeatDisplayInfo } from '../utils/eventStateUtils';

interface RepeatEventIconProps {
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  endDate?: string;
}

export function RepeatEventIcon({ repeatType, interval = 1, endDate }: RepeatEventIconProps) {
  if (repeatType === 'none') {
    return null;
  }

  const mockEvent = {
    id: 'temp',
    title: 'temp',
    date: '2025-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: repeatType, interval, endDate },
    notificationTime: 0,
  };

  const { repeatText } = getRepeatDisplayInfo(mockEvent);

  return (
    <Tooltip title={repeatText} arrow>
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <Repeat
          fontSize="small"
          color="primary"
          data-testid="repeat-icon"
          aria-label={`반복 일정: ${repeatText}`}
        />
      </Box>
    </Tooltip>
  );
}
