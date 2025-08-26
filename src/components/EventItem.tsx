import { Notifications } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';

import type { Event } from '../types';
import { isRepeatingEvent, getRepeatIcon } from '../utils/eventUtils';

interface EventItemProps {
  event: Event;
  isNotified: boolean;
}

function getBgColor(isNotified: boolean, isRepeating: boolean) {
  if (isNotified) return '#ffebee';
  if (isRepeating) return '#e3f2fd';
  return '#f5f5f5';
}

function getHoverBg(isNotified: boolean, isRepeating: boolean) {
  if (isNotified) return '#ffcdd2';
  if (isRepeating) return '#bbdefb';
  return '#eeeeee';
}

function buildItemStyle(isNotified: boolean, isRepeating: boolean) {
  const bg = getBgColor(isNotified, isRepeating);
  const hover = getHoverBg(isNotified, isRepeating);
  return {
    p: 0.5,
    my: 0.5,
    backgroundColor: bg,
    borderRadius: 1,
    fontWeight: isNotified ? 'bold' : 'normal',
    color: isNotified ? '#d32f2f' : 'inherit',
    minHeight: '18px',
    width: '100%',
    overflow: 'hidden',
    transition: 'background-color 0.2s ease',
    '&:hover': { backgroundColor: hover },
  } as const;
}

function TitleLeftIcons({
  isNotified,
  isRepeating,
  repeatIcon,
}: {
  isNotified: boolean;
  isRepeating: boolean;
  repeatIcon: string;
}) {
  return (
    <>
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
    </>
  );
}

function EventTitleRow({
  title,
  isNotified,
  isRepeating,
  repeatIcon,
}: {
  title: string;
  isNotified: boolean;
  isRepeating: boolean;
  repeatIcon: string;
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <TitleLeftIcons isNotified={isNotified} isRepeating={isRepeating} repeatIcon={repeatIcon} />
      <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2, flex: 1 }}>
        {title}
      </Typography>
    </Stack>
  );
}

function getRepeatUnit(type: Event['repeat']['type']): string {
  switch (type) {
    case 'daily':
      return '일';
    case 'weekly':
      return '주';
    case 'monthly':
      return '월';
    case 'yearly':
      return '년';
    default:
      return '';
  }
}

function RepeatInfoRow({ event }: { event: Event }) {
  const isRepeating = isRepeatingEvent(event);
  if (!isRepeating) return null;
  const unit = getRepeatUnit(event.repeat.type);
  const excludeSuffix =
    Array.isArray(event.repeat.excludeDates) && event.repeat.excludeDates.length > 0
      ? `, 제외 ${event.repeat.excludeDates.length}일`
      : '';
  return (
    <Typography variant="caption" color="text.secondary">
      반복: {event.repeat.interval}
      {unit}
      마다
      {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
      {excludeSuffix}
    </Typography>
  );
}

function EventContent({
  event,
  isNotified,
  isRepeating,
  repeatIcon,
}: {
  event: Event;
  isNotified: boolean;
  isRepeating: boolean;
  repeatIcon: string;
}) {
  return (
    <Stack spacing={0.25}>
      <EventTitleRow
        title={event.title}
        isNotified={isNotified}
        isRepeating={isRepeating}
        repeatIcon={repeatIcon}
      />
      <RepeatInfoRow event={event} />
    </Stack>
  );
}

function EventItemView({
  event,
  isNotified,
  isRepeating,
  repeatIcon,
}: {
  event: Event;
  isNotified: boolean;
  isRepeating: boolean;
  repeatIcon: string;
}) {
  return (
    <Box data-testid="event-item" sx={buildItemStyle(isNotified, isRepeating)}>
      <EventContent
        event={event}
        isNotified={isNotified}
        isRepeating={isRepeating}
        repeatIcon={repeatIcon}
      />
    </Box>
  );
}

export function EventItem({ event, isNotified }: EventItemProps) {
  const isRepeating = isRepeatingEvent(event);
  const repeatIcon = isRepeating ? getRepeatIcon(event.repeat.type) : '';
  return (
    <EventItemView
      event={event}
      isNotified={isNotified}
      isRepeating={isRepeating}
      repeatIcon={repeatIcon}
    />
  );
}
