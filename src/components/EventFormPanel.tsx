import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';

import { RepeatType } from '../types';
import { formatRepeatPreview, mergeExcludeDateRange } from '../utils/repeatingEventUtils';
import { getTimeErrorMessage } from '../utils/timeValidation';

interface NotificationOption {
  value: number;
  label: string;
}

interface EventFormPanelProps {
  isEditing: boolean;
  // Basic fields
  title: string;
  setTitle: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  startTime: string;
  endTime: string;
  startTimeError: string | null;
  endTimeError: string | null;
  handleStartTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description: string;
  setDescription: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  categories: string[];
  // Notification
  notificationTime: number;
  setNotificationTime: (value: number) => void;
  notificationOptions: NotificationOption[];
  // Repeat
  isRepeating: boolean;
  setIsRepeating: (value: boolean) => void;
  repeatType: RepeatType;
  setRepeatType: (value: RepeatType) => void;
  repeatInterval: number;
  setRepeatInterval: (value: number) => void;
  repeatEndDate: string;
  setRepeatEndDate: (value: string) => void;
  weekdays: number[];
  setWeekdays: (value: number[]) => void;
  excludeDates: string[];
  setExcludeDates: (value: string[]) => void;
  // Submit
  onSubmit: () => void | Promise<void>;
  // Scopes for edit/delete
  updateScope: 'single' | 'all';
  setUpdateScope: (value: 'single' | 'all') => void;
  deleteScope: 'single' | 'all';
  setDeleteScope: (value: 'single' | 'all') => void;
}

export function EventFormPanel(props: EventFormPanelProps) {
  const {
    isEditing,
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    startTimeError,
    endTimeError,
    handleStartTimeChange,
    handleEndTimeChange,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    categories,
    notificationTime,
    setNotificationTime,
    notificationOptions,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    weekdays,
    setWeekdays,
    excludeDates,
    setExcludeDates,
    onSubmit,
    updateScope,
    setUpdateScope,
    deleteScope,
    setDeleteScope,
  } = props;

  return (
    <>
      <Typography variant="h4">{isEditing ? '일정 수정' : '일정 추가'}</Typography>

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
            <Checkbox checked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)} />
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
                  const startEl = document.getElementById('range-start') as HTMLInputElement | null;
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
        onClick={onSubmit}
        variant="contained"
        color="primary"
      >
        {isEditing ? '일정 수정' : '일정 추가'}
      </Button>

      {isEditing && (
        <>
          <FormControl sx={{ mt: 1 }}>
            <FormLabel>수정 범위</FormLabel>
            <RadioGroup
              row
              value={updateScope}
              onChange={(e) => setUpdateScope(e.target.value as 'single' | 'all')}
            >
              <FormControlLabel
                value="single"
                control={<Radio size="small" />}
                label="이 일정만 수정"
              />
              <FormControlLabel
                value="all"
                control={<Radio size="small" />}
                label="모든 반복 일정 수정"
              />
            </RadioGroup>
          </FormControl>
          <FormControl sx={{ mt: 1 }}>
            <FormLabel>삭제 범위</FormLabel>
            <RadioGroup
              row
              value={deleteScope}
              onChange={(e) => setDeleteScope(e.target.value as 'single' | 'all')}
            >
              <FormControlLabel
                value="single"
                control={<Radio size="small" />}
                label="이 일정만 삭제"
              />
              <FormControlLabel
                value="all"
                control={<Radio size="small" />}
                label="모든 반복 일정 삭제"
              />
            </RadioGroup>
          </FormControl>
        </>
      )}
    </>
  );
}
