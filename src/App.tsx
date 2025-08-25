import { Notifications, ChevronLeft, ChevronRight, Delete, Edit, Close } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { EventItem } from './components/EventItem';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm, RepeatType } from './types';
import {
  formatDate,
  formatMonth,
  formatWeek,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
} from './utils/dateUtils';
import { findOverlappingEvents } from './utils/eventOverlap';
import { formatRepeatPreview, mergeExcludeDateRange } from './utils/repeatingEventUtils';
import { getTimeErrorMessage } from './utils/timeValidation';

const categories = ['업무', '개인', '가족', '기타'];

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

function App() {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
    // 2.2 제외 날짜 관련 상태 (훅에서 제공)
    excludeDates,
    setExcludeDates,
    weekdays,
    setWeekdays,
  } = useEventForm();

  const { events, saveEvent, deleteEvent, updateBulkEvents, deleteBulkEvents } = useEventOperations(
    Boolean(editingEvent),
    () => setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditTitle, setBulkEditTitle] = useState('');

  const { enqueueSnackbar } = useSnackbar();

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
        ...(excludeDates.length ? { excludeDates } : {}),
        ...(repeatType === 'weekly' && weekdays.length ? { weekdays } : {}),
      },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    return (
      <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatWeek(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {weekDates.map((date) => (
                  <TableCell
                    key={date.toISOString()}
                    sx={{
                      height: '120px',
                      verticalAlign: 'top',
                      width: '14.28%',
                      padding: 1,
                      border: '1px solid #e0e0e0',
                      overflow: 'hidden',
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {date.getDate()}
                    </Typography>
                    {filteredEvents
                      .filter(
                        (event) => new Date(event.date).toDateString() === date.toDateString()
                      )
                      .map((event) => {
                        const isNotified = notifiedEvents.includes(event.id);
                        return <EventItem key={event.id} event={event} isNotified={isNotified} />;
                      })}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  const renderMonthView = () => {
    const weeks = getWeeksAtMonth(currentDate);

    return (
      <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatMonth(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {weeks.map((week, weekIndex) => (
                <TableRow key={weekIndex}>
                  {week.map((day, dayIndex) => {
                    const dateString = day ? formatDate(currentDate, day) : '';
                    const holiday = holidays[dateString];

                    return (
                      <TableCell
                        key={dayIndex}
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
                            {getEventsForDay(filteredEvents, day).map((event) => {
                              const isNotified = notifiedEvents.includes(event.id);
                              return (
                                <EventItem key={event.id} event={event} isNotified={isNotified} />
                              );
                            })}
                          </>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        <Stack spacing={2} sx={{ width: '20%' }}>
          <Typography variant="h4">{editingEvent ? '일정 수정' : '일정 추가'}</Typography>

          <FormControl fullWidth>
            <FormLabel htmlFor="title">제목</FormLabel>
            <TextField
              id="title"
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel htmlFor="date">날짜</FormLabel>
            <TextField
              id="date"
              size="small"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormControl>

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <FormLabel htmlFor="start-time">시작 시간</FormLabel>
              <Tooltip title={startTimeError || ''} open={!!startTimeError} placement="top">
                <TextField
                  id="start-time"
                  size="small"
                  type="time"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  onBlur={() => getTimeErrorMessage(startTime, endTime)}
                  error={!!startTimeError}
                />
              </Tooltip>
            </FormControl>
            <FormControl fullWidth>
              <FormLabel htmlFor="end-time">종료 시간</FormLabel>
              <Tooltip title={endTimeError || ''} open={!!endTimeError} placement="top">
                <TextField
                  id="end-time"
                  size="small"
                  type="time"
                  value={endTime}
                  onChange={handleEndTimeChange}
                  onBlur={() => getTimeErrorMessage(startTime, endTime)}
                  error={!!endTimeError}
                />
              </Tooltip>
            </FormControl>
          </Stack>

          <FormControl fullWidth>
            <FormLabel htmlFor="description">설명</FormLabel>
            <TextField
              id="description"
              size="small"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel htmlFor="location">위치</FormLabel>
            <TextField
              id="location"
              size="small"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel id="category-label">카테고리</FormLabel>
            <Select
              id="category"
              size="small"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-labelledby="category-label"
              aria-label="카테고리"
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat} aria-label={`${cat}-option`}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isRepeating}
                  onChange={(e) => setIsRepeating(e.target.checked)}
                />
              }
              label="반복 일정"
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel htmlFor="notification">알림 설정</FormLabel>
            <Select
              id="notification"
              size="small"
              value={notificationTime}
              onChange={(e) => setNotificationTime(Number(e.target.value))}
            >
              {notificationOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {isRepeating && (
            <Stack spacing={2}>
              <FormControl fullWidth>
                <FormLabel>반복 유형</FormLabel>
                <Select
                  size="small"
                  value={repeatType}
                  onChange={(e) => setRepeatType(e.target.value as RepeatType)}
                >
                  <MenuItem value="daily">매일</MenuItem>
                  <MenuItem value="weekly">매주</MenuItem>
                  <MenuItem value="monthly">매월</MenuItem>
                  <MenuItem value="yearly">매년</MenuItem>
                </Select>
              </FormControl>
              {repeatType === 'weekly' && (
                <Stack>
                  <FormLabel>요일 선택</FormLabel>
                  <ToggleButtonGroup
                    value={weekdays}
                    onChange={(_, next: number[]) => setWeekdays(next.sort())}
                    size="small"
                  >
                    {['일', '월', '화', '수', '목', '금', '토'].map((label, idx) => (
                      <ToggleButton key={label} value={idx} aria-label={`weekday-${idx}`}>
                        {label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button size="small" onClick={() => setWeekdays([1, 2, 3, 4, 5])}>
                      평일
                    </Button>
                    <Button size="small" onClick={() => setWeekdays([0, 6])}>
                      주말
                    </Button>
                    <Button size="small" onClick={() => setWeekdays([])}>
                      초기화
                    </Button>
                  </Stack>
                </Stack>
              )}
              <Stack direction="row" spacing={2}>
                <FormControl fullWidth>
                  <FormLabel>반복 간격</FormLabel>
                  <TextField
                    size="small"
                    type="number"
                    value={repeatInterval}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      if (Number.isNaN(next)) {
                        setRepeatInterval(1);
                        return;
                      }
                      if (next < 1) {
                        setRepeatInterval(1);
                      } else if (next > 99) {
                        setRepeatInterval(99);
                      } else {
                        setRepeatInterval(next);
                      }
                    }}
                    slotProps={{ htmlInput: { min: 1, max: 99 } }}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <FormLabel>반복 종료일</FormLabel>
                  <TextField
                    size="small"
                    type="date"
                    value={repeatEndDate}
                    onChange={(e) => setRepeatEndDate(e.target.value)}
                  />
                </FormControl>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {formatRepeatPreview({
                  type: repeatType,
                  interval: repeatInterval,
                  endDate: repeatEndDate || undefined,
                })}
                {repeatType === 'weekly' &&
                  weekdays.length > 0 &&
                  ` · 요일: ${weekdays.map((d) => ['일', '월', '화', '수', '목', '금', '토'][d]).join(', ')}`}
              </Typography>

              {/* 제외 날짜 간이 UI (DatePicker 없이 기본 date 입력으로 최소 구현) */}
              <Stack spacing={1}>
                <FormLabel>제외 날짜</FormLabel>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    type="date"
                    value={''}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) return;
                      if (excludeDates.includes(v)) return;
                      setExcludeDates([...excludeDates, v]);
                    }}
                  />
                  <TextField size="small" type="date" id="range-start" />
                  <TextField
                    size="small"
                    type="date"
                    id="range-end"
                    onChange={(e) => {
                      const startEl = document.getElementById(
                        'range-start'
                      ) as HTMLInputElement | null;
                      const start = startEl?.value;
                      const end = e.target.value;
                      if (!start || !end) return;
                      const merged = mergeExcludeDateRange(
                        excludeDates,
                        start,
                        end,
                        repeatEndDate || undefined
                      );
                      setExcludeDates(merged);
                    }}
                  />
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {excludeDates.map((d) => (
                    <Button
                      key={d}
                      size="small"
                      variant="outlined"
                      onClick={() => setExcludeDates(excludeDates.filter((x) => x !== d))}
                    >
                      {d} ×
                    </Button>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          )}

          <Button
            data-testid="event-submit-button"
            onClick={addOrUpdateEvent}
            variant="contained"
            color="primary"
          >
            {editingEvent ? '일정 수정' : '일정 추가'}
          </Button>
        </Stack>

        <Stack flex={1} spacing={5}>
          <Typography variant="h4">일정 보기</Typography>

          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <IconButton aria-label="Previous" onClick={() => navigate('prev')}>
              <ChevronLeft />
            </IconButton>
            <Select
              size="small"
              aria-label="뷰 타입 선택"
              value={view}
              onChange={(e) => setView(e.target.value as 'week' | 'month')}
            >
              <MenuItem value="week" aria-label="week-option">
                Week
              </MenuItem>
              <MenuItem value="month" aria-label="month-option">
                Month
              </MenuItem>
            </Select>
            <IconButton aria-label="Next" onClick={() => navigate('next')}>
              <ChevronRight />
            </IconButton>
          </Stack>

          {view === 'week' && renderWeekView()}
          {view === 'month' && renderMonthView()}
        </Stack>

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
                    onClick={() => setBulkEditOpen(true)}
                  >
                    그룹 수정
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="contained"
                    disabled={selectedIds.length === 0}
                    onClick={async () => {
                      await deleteBulkEvents(selectedIds);
                      setSelectedIds([]);
                      setSelectionMode(false);
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
                            // 같은 repeat.id를 가진 이벤트를 한 번에 토글
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
                      알림:{' '}
                      {
                        notificationOptions.find(
                          (option) => option.value === event.notificationTime
                        )?.label
                      }
                    </Typography>
                  </Stack>
                  {!selectionMode && (
                    <Stack>
                      <IconButton aria-label="Edit event" onClick={() => editEvent(event)}>
                        <Edit />
                      </IconButton>
                      <IconButton aria-label="Delete event" onClick={() => deleteEvent(event.id)}>
                        <Delete />
                      </IconButton>
                    </Stack>
                  )}
                </Stack>
              </Box>
            ))
          )}
        </Stack>
      </Stack>

      <Dialog open={isOverlapDialogOpen} onClose={() => setIsOverlapDialogOpen(false)}>
        <DialogTitle>일정 겹침 경고</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            다음 일정과 겹칩니다:
            {overlappingEvents.map((event) => (
              <Typography key={event.id}>
                {event.title} ({event.date} {event.startTime}-{event.endTime})
              </Typography>
            ))}
            계속 진행하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOverlapDialogOpen(false)}>취소</Button>
          <Button
            color="error"
            onClick={() => {
              setIsOverlapDialogOpen(false);
              saveEvent({
                id: editingEvent ? editingEvent.id : undefined,
                title,
                date,
                startTime,
                endTime,
                description,
                location,
                category,
                repeat: {
                  type: isRepeating ? repeatType : 'none',
                  interval: repeatInterval,
                  endDate: repeatEndDate || undefined,
                  ...(excludeDates.length ? { excludeDates } : {}),
                  ...(repeatType === 'weekly' && weekdays.length ? { weekdays } : {}),
                },
                notificationTime,
              });
            }}
          >
            계속 진행
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bulkEditOpen} onClose={() => setBulkEditOpen(false)}>
        <DialogTitle>그룹 수정</DialogTitle>
        <DialogContent>
          <DialogContentText>선택된 이벤트들의 제목을 일괄 변경합니다.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="새 제목"
            fullWidth
            variant="standard"
            value={bulkEditTitle}
            onChange={(e) => setBulkEditTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkEditOpen(false)}>취소</Button>
          <Button
            onClick={async () => {
              const updated = events
                .filter((e) => selectedIds.includes(e.id))
                .map((e) => ({ ...e, title: bulkEditTitle }));
              await updateBulkEvents(updated as Event[]);
              setBulkEditOpen(false);
              setSelectedIds([]);
              setSelectionMode(false);
              setBulkEditTitle('');
            }}
            disabled={!bulkEditTitle}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {notifications.length > 0 && (
        <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
          {notifications.map((notification, index) => (
            <Alert
              key={index}
              severity="info"
              sx={{ width: 'auto' }}
              action={
                <IconButton
                  size="small"
                  onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Close />
                </IconButton>
              }
            >
              <AlertTitle>{notification.message}</AlertTitle>
            </Alert>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default App;
