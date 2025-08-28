import { Notifications } from '@mui/icons-material';
import { Box, Stack, TableCell, Typography } from '@mui/material';

import type { Event } from '../types';
import { getEventsForDay } from '../utils/dateUtils';

interface Props {
  events: Event[];
  notifiedEvents: string[];
  day: number | null;
  holiday?: string;
}

export function CalendarCell({ events, notifiedEvents, day, holiday }: Props) {
  return (
    <TableCell
      key={day}
      sx={{
        height: '120px',
        verticalAlign: 'top',
        width: '14.28%',
        padding: 1,
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {day && (
        <>
          <Typography variant="body2" fontWeight="bold">
            {day}
          </Typography>
          {holiday && (
            <Typography variant="body2" color="error">
              {holiday}
            </Typography>
          )}
          {getEventsForDay(events, day).map((event) => {
            const isNotified = notifiedEvents.includes(event.id);
            const isRepeat = event.repeat.type !== 'none';
            const baseStyle = {
              p: 0.5,
              my: 0.5,
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              fontWeight: 'normal',
              color: 'inherit',
              minHeight: '18px',
              width: '100%',
              overflow: 'hidden',
            };
            const notifiedStyle = {
              backgroundColor: '#ffebee',
              fontWeight: 'bold',
              color: '#d32f2f',
            };
            const repeatStyle = {
              backgroundColor: '#fff3e0',
              fontWeight: 'bold',
              color: '#ff6f00',
            };
            const specialStyle = isNotified ? notifiedStyle : isRepeat ? repeatStyle : {};

            return (
              <Box
                key={event.id}
                sx={{
                  ...baseStyle,
                  ...specialStyle,
                }}
                data-testid={'box'}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  {isNotified && <Notifications fontSize="small" />}
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                  >
                    {event.title}
                  </Typography>
                </Stack>
              </Box>
            );
          })}
        </>
      )}
    </TableCell>
  );
}
