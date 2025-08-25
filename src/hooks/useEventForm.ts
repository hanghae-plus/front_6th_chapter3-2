import { ChangeEvent, useState } from 'react';

import { Event, RepeatType } from '../types';
import { saveEvents, showSuccessMessage } from '../utils/eventStorage';
import { validateRepeatSettings, generateEventInstances } from '../utils/repeatingEventUtils';
import { getTimeErrorMessage } from '../utils/timeValidation';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

export const useEventForm = (initialEvent?: Event) => {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [date, setDate] = useState(initialEvent?.date || '');
  const [startTime, setStartTime] = useState(initialEvent?.startTime || '');
  const [endTime, setEndTime] = useState(initialEvent?.endTime || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [category, setCategory] = useState(initialEvent?.category || '업무');
  const [isRepeating, setIsRepeating] = useState(initialEvent?.repeat.type !== 'none');
  const [repeatType, setRepeatType] = useState<RepeatType>(initialEvent?.repeat.type || 'none');
  const [repeatInterval, setRepeatInterval] = useState(initialEvent?.repeat.interval || 1);
  const [repeatEndDate, setRepeatEndDate] = useState(initialEvent?.repeat.endDate || '');
  const [excludeDates, setExcludeDates] = useState<string[]>(
    initialEvent?.repeat.excludeDates || []
  );
  const [notificationTime, setNotificationTime] = useState(initialEvent?.notificationTime || 10);

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    setTimeError(getTimeErrorMessage(newStartTime, endTime));
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    setTimeError(getTimeErrorMessage(startTime, newEndTime));
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setLocation('');
    setCategory('업무');
    setIsRepeating(false);
    setRepeatType('none');
    setRepeatInterval(1);
    setRepeatEndDate('');
    setExcludeDates([]);
    setNotificationTime(10);
  };

  const editEvent = (event: Event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDate(event.date);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setDescription(event.description);
    setLocation(event.location);
    setCategory(event.category);
    setIsRepeating(event.repeat.type !== 'none');
    setRepeatType(event.repeat.type);
    setRepeatInterval(event.repeat.interval);
    setRepeatEndDate(event.repeat.endDate || '');
    setExcludeDates(event.repeat.excludeDates || []);
    setNotificationTime(event.notificationTime);
  };

  const createEvents = async (): Promise<Event[]> => {
    // 기본 이벤트 객체 생성
    const baseEvent: Event = {
      id: editingEvent?.id || crypto.randomUUID(),
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: repeatType,
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
        excludeDates: excludeDates.length ? excludeDates : undefined,
      },
      notificationTime,
    };

    // 반복 설정이 있는 경우 유효성 검사
    if (isRepeating) {
      const repeatInfo = {
        type: repeatType,
        interval: repeatInterval,
        endDate: repeatEndDate,
        excludeDates,
      };

      if (!validateRepeatSettings(repeatInfo)) {
        throw new Error('Invalid repeat settings');
      }

      // 반복 일정 생성
      const events = generateEventInstances(repeatInfo, baseEvent);
      const success = await saveEvents(events);

      if (success) {
        showSuccessMessage('반복 일정이 성공적으로 생성되었습니다.');
        return events;
      }

      throw new Error('Failed to save repeating events');
    }

    // 이벤트 저장
    const events = [baseEvent];
    const success = await saveEvents(events);

    if (success) {
      showSuccessMessage('일정이 성공적으로 생성되었습니다.');
      return events;
    }

    throw new Error('Failed to save events');
  };

  return {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
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
    createEvents,
    excludeDates,
    setExcludeDates,
  };
};
