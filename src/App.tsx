import { Close } from '@mui/icons-material';
import { Alert, AlertTitle, Box, IconButton, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { overlay } from 'overlay-kit';
import { useMemo, useState } from 'react';

import { CalendarViewPanel } from './components/CalendarViewPanel';
import { BulkEditDialog } from './components/dialogs/BulkEditDialog';
import { DeleteConfirmDialog } from './components/dialogs/DeleteConfirmDialog';
import { OverlapWarningDialog } from './components/dialogs/OverlapWarningDialog';
import { EventFormPanel } from './components/EventFormPanel';
import { EventListPanel } from './components/EventListPanel';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm } from './types';
import { getWeekDates, getWeeksAtMonth } from './utils/dateUtils';
import { findOverlappingEvents } from './utils/eventOverlap';
// no-op

// 상수를 외부로 이동하여 컴포넌트 재렌더링 시 재생성 방지
const categories = ['업무', '개인', '가족', '기타'];
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

  // 선택 관련 상태를 단일 객체로 통합하여 상태 수 감소
  const [selectionState, setSelectionState] = useState<{
    mode: boolean;
    selectedIds: string[];
    updateScope: 'single' | 'all';
    deleteScope: 'single' | 'all';
  }>({
    mode: false,
    selectedIds: [],
    updateScope: 'single',
    deleteScope: 'single',
  });

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
      const proceed = await overlay.openAsync<boolean>(({ isOpen, close }) => (
        <OverlapWarningDialog
          isOpen={isOpen}
          events={overlapping}
          onCancel={() => close(false)}
          onProceed={() => close(true)}
        />
      ));
      if (!proceed) return;
      // proceed true인 경우 아래 저장 로직 계속
    }

    try {
      if (
        editingEvent &&
        selectionState.updateScope === 'all' &&
        editingEvent.repeat.type !== 'none' &&
        editingEvent.repeat.id
      ) {
        const groupId = editingEvent.repeat.id;
        const updatedGroup = events
          .filter((e) => e.repeat.id === groupId)
          .map((e) => ({
            ...e,
            title,
            date,
            startTime,
            endTime,
            description,
            location,
            category,
            notificationTime,
          }));
        await updateBulkEvents(updatedGroup);
        setEditingEvent(null);
        resetForm();
      } else {
        // 편집 + 이 일정만 수정: 단일화 처리하여 저장
        if (
          editingEvent &&
          selectionState.updateScope === 'single' &&
          editingEvent.repeat.type !== 'none'
        ) {
          (eventData as Event).repeat = { type: 'none', interval: 1 } as Event['repeat'];
        }
        await saveEvent(eventData);
        resetForm();
      }
      enqueueSnackbar('일정이 저장되었습니다.', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : '일정 저장에 실패했습니다.', {
        variant: 'error',
      });
    }
  };

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
  const weeks = useMemo(() => getWeeksAtMonth(currentDate), [currentDate]);
  const notificationLabelByValue = useMemo(
    () => new Map(notificationOptions.map(({ value, label }) => [value, label])),
    []
  );
  const eventsByDateString = useMemo(() => {
    const dateStringToEvents = new Map<string, Event[]>();
    for (const eventItem of filteredEvents) {
      const dateKey = new Date(eventItem.date).toDateString();
      const eventsOnDate = dateStringToEvents.get(dateKey) ?? [];
      eventsOnDate.push(eventItem);
      dateStringToEvents.set(dateKey, eventsOnDate);
    }
    return dateStringToEvents;
  }, [filteredEvents]);

  const eventsByDay = useMemo(() => {
    const dayToEventsMap = new Map<number, Event[]>();
    for (const eventItem of filteredEvents) {
      const dayOfMonth = new Date(eventItem.date).getDate();
      const eventsOnDay = dayToEventsMap.get(dayOfMonth) ?? [];
      eventsOnDay.push(eventItem);
      dayToEventsMap.set(dayOfMonth, eventsOnDay);
    }
    return dayToEventsMap;
  }, [filteredEvents]);

  // moved to CalendarViewPanel

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        <Stack spacing={2} sx={{ width: '20%' }}>
          <EventFormPanel
            isEditing={Boolean(editingEvent)}
            title={title}
            setTitle={setTitle}
            date={date}
            setDate={setDate}
            startTime={startTime}
            endTime={endTime}
            startTimeError={startTimeError}
            endTimeError={endTimeError}
            handleStartTimeChange={handleStartTimeChange}
            handleEndTimeChange={handleEndTimeChange}
            description={description}
            setDescription={setDescription}
            location={location}
            setLocation={setLocation}
            category={category}
            setCategory={setCategory}
            categories={categories}
            notificationTime={notificationTime}
            setNotificationTime={setNotificationTime}
            notificationOptions={notificationOptions}
            isRepeating={isRepeating}
            setIsRepeating={setIsRepeating}
            repeatType={repeatType}
            setRepeatType={setRepeatType}
            repeatInterval={repeatInterval}
            setRepeatInterval={setRepeatInterval}
            repeatEndDate={repeatEndDate}
            setRepeatEndDate={setRepeatEndDate}
            weekdays={weekdays}
            setWeekdays={setWeekdays}
            excludeDates={excludeDates}
            setExcludeDates={setExcludeDates}
            onSubmit={addOrUpdateEvent}
            updateScope={selectionState.updateScope}
            setUpdateScope={(scope) =>
              setSelectionState((prev) => ({ ...prev, updateScope: scope }))
            }
            deleteScope={selectionState.deleteScope}
            setDeleteScope={(scope) =>
              setSelectionState((prev) => ({ ...prev, deleteScope: scope }))
            }
          />
        </Stack>

        <CalendarViewPanel
          currentDate={currentDate}
          view={view}
          setView={setView}
          weekDates={weekDates}
          weeks={weeks}
          holidays={holidays}
          navigate={navigate}
          eventsByDateString={eventsByDateString}
          eventsByDay={eventsByDay}
          notifiedEvents={notifiedEvents}
        />

        <EventListPanel
          events={events}
          filteredEvents={filteredEvents}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectionMode={selectionState.mode}
          setSelectionMode={(mode) => setSelectionState((prev) => ({ ...prev, mode }))}
          selectedIds={selectionState.selectedIds}
          setSelectedIds={(ids) => setSelectionState((prev) => ({ ...prev, selectedIds: ids }))}
          notifiedEvents={notifiedEvents}
          notificationLabelByValue={notificationLabelByValue}
          editEvent={editEvent}
          deleteScope={selectionState.deleteScope}
          deleteEvent={deleteEvent}
          onConfirmDelete={async (ids) => {
            const confirmed = await overlay.openAsync<boolean>(({ isOpen, close }) => (
              <DeleteConfirmDialog
                isOpen={isOpen}
                isAll={selectionState.deleteScope === 'all'}
                onCancel={() => close(false)}
                onConfirm={() => close(true)}
              />
            ));
            if (!confirmed) return;
            await deleteBulkEvents(ids);
            setSelectionState((prev) => ({ ...prev, selectedIds: [], mode: false }));
          }}
          onOpenBulkEdit={async (ids) => {
            const result = await overlay.openAsync<string | null>(({ isOpen, close }) => (
              <BulkEditDialog
                isOpen={isOpen}
                onCancel={() => close(null)}
                onSave={(v) => close(v)}
              />
            ));
            if (!result) return;
            const updated = events
              .filter((e) => ids.includes(e.id))
              .map((e) => ({ ...e, title: result }));
            await updateBulkEvents(updated as Event[]);
            setSelectionState((prev) => ({ ...prev, selectedIds: [], mode: false }));
          }}
          onDeleteSelectedImmediate={async (ids) => {
            await deleteBulkEvents(ids);
            setSelectionState((prev) => ({ ...prev, selectedIds: [], mode: false }));
          }}
        />
      </Stack>

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
