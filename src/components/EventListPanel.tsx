import { Delete, Edit, Notifications } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { Event } from '../types';

interface EventListPanelProps {
  events: Event[];
  filteredEvents: Event[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectionMode: boolean;
  setSelectionMode: (value: boolean) => void;
  selectedIds: string[];
  setSelectedIds: (value: string[]) => void;
  notifiedEvents: string[];
  notificationLabelByValue: Map<number, string>;
  editEvent: (event: Event) => void;
  deleteScope: 'single' | 'all';
  deleteEvent: (id: string) => Promise<void> | void;
  onConfirmDelete: (ids: string[]) => Promise<void> | void;
  onOpenBulkEdit: (selectedIds: string[]) => void;
  onDeleteSelectedImmediate: (ids: string[]) => Promise<void> | void;
}

export function EventListPanel(props: EventListPanelProps) {
  const {
    events,
    filteredEvents,
    searchTerm,
    setSearchTerm,
    selectionMode,
    setSelectionMode,
    selectedIds,
    setSelectedIds,
    notifiedEvents,
    notificationLabelByValue,
    editEvent,
    deleteScope,
    deleteEvent,
    onConfirmDelete,
    onOpenBulkEdit,
    onDeleteSelectedImmediate,
  } = props;

  return (
    <Stack
      data-testid="event-list"
      spacing={2}
      sx={{ width: '30%', height: '100%', overflowY: 'auto' }}
    >
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Typography variant="h6">일정 목록</Typography>
        <Stack direction="row" spacing={1}>
          {!selectionMode ? (
            <Button size="small" variant="outlined" onClick={() => setSelectionMode(true)}>
              선택 모드
            </Button>
          ) : (
            <>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setSelectedIds([]);
                  setSelectionMode(false);
                }}
              >
                선택 해제
              </Button>
              <Button
                size="small"
                color="primary"
                variant="contained"
                disabled={selectedIds.length === 0}
                onClick={() => onOpenBulkEdit(selectedIds)}
              >
                그룹 수정
              </Button>
              <Button
                size="small"
                color="error"
                variant="contained"
                disabled={selectedIds.length === 0}
                onClick={async () => {
                  await onDeleteSelectedImmediate(selectedIds);
                }}
              >
                그룹 삭제
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      <FormControl fullWidth>
        <FormLabel htmlFor="search">일정 검색</FormLabel>
        <TextField
          id="search"
          size="small"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </FormControl>

      {filteredEvents.length === 0 ? (
        <Typography>검색 결과가 없습니다.</Typography>
      ) : (
        filteredEvents.map((event) => (
          <Box key={event.id} sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack>
                {selectionMode && (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Checkbox
                      size="small"
                      checked={selectedIds.includes(event.id)}
                      onChange={() => {
                        const groupId = event.repeat.id;
                        const groupIds = groupId
                          ? events.filter((e) => e.repeat.id === groupId).map((e) => e.id)
                          : [event.id];
                        const isAllSelected = groupIds.every((id) => selectedIds.includes(id));
                        if (isAllSelected) {
                          setSelectedIds(selectedIds.filter((id) => !groupIds.includes(id)));
                        } else {
                          setSelectedIds(Array.from(new Set([...selectedIds, ...groupIds])));
                        }
                      }}
                    />
                    <Typography variant="caption">
                      {event.repeat.id ? '그룹 선택' : '선택'}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" spacing={1} alignItems="center">
                  {notifiedEvents.includes(event.id) && <Notifications color="error" />}
                  <Typography
                    fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
                    color={notifiedEvents.includes(event.id) ? 'error' : 'inherit'}
                  >
                    {event.title}
                  </Typography>
                </Stack>
                <Typography>{event.date}</Typography>
                <Typography>
                  {event.startTime} - {event.endTime}
                </Typography>
                <Typography>{event.description}</Typography>
                <Typography>{event.location}</Typography>
                <Typography>카테고리: {event.category}</Typography>
                {event.repeat.type !== 'none' && (
                  <Typography>
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
                <Typography>
                  알림: {notificationLabelByValue.get(event.notificationTime)}
                </Typography>
              </Stack>
              {!selectionMode && (
                <Stack>
                  <IconButton aria-label="Edit event" onClick={() => editEvent(event)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    aria-label="Delete event"
                    onClick={() => {
                      if (event.repeat.type !== 'none' && event.repeat.id) {
                        const groupIds = events
                          .filter((e) => e.repeat.id === event.repeat.id)
                          .map((e) => e.id);
                        void onConfirmDelete(deleteScope === 'all' ? groupIds : [event.id]);
                      } else {
                        void deleteEvent(event.id);
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Stack>
              )}
            </Stack>
          </Box>
        ))
      )}
    </Stack>
  );
}
