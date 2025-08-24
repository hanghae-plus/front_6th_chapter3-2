import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

import { useEventForm } from '../../hooks/useEventForm';
import { Event } from '../../types';

beforeAll(() => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  vi.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('useEventForm', () => {
  it('should create a single event when repeat type is none', async () => {
    const { result } = renderHook(() => useEventForm());

    await act(async () => {
      result.current.setTitle('Test Event');
      result.current.setDate('2024-01-01');
      result.current.setStartTime('09:00');
      result.current.setEndTime('10:00');
      result.current.setDescription('Test Description');
      result.current.setLocation('Test Location');
      result.current.setCategory('업무');
      result.current.setRepeatType('none');
      result.current.setRepeatInterval(1);
      result.current.setNotificationTime(30);
    });

    const events = await result.current.createEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      title: 'Test Event',
      date: '2024-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: 'Test Description',
      location: 'Test Location',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 30,
    });
  });

  it('should create multiple events for daily repeat type', async () => {
    const { result } = renderHook(() => useEventForm());

    await act(async () => {
      result.current.setTitle('Test Event');
      result.current.setDate('2024-01-01');
      result.current.setStartTime('09:00');
      result.current.setEndTime('10:00');
      result.current.setDescription('Test Description');
      result.current.setLocation('Test Location');
      result.current.setCategory('업무');
      result.current.setIsRepeating(true);
      result.current.setRepeatType('daily');
      result.current.setRepeatInterval(1);
      result.current.setRepeatEndDate('2024-01-10');
      result.current.setNotificationTime(30);
    });

    const events = await result.current.createEvents();
    expect(events).toHaveLength(10);
    expect(events[0].date).toBe('2024-01-01');
    expect(events[1].date).toBe('2024-01-02');
    expect(events[2].date).toBe('2024-01-03');
    expect(events[3].date).toBe('2024-01-04');
    expect(events[4].date).toBe('2024-01-05');
    expect(events[5].date).toBe('2024-01-06');
    expect(events[6].date).toBe('2024-01-07');
    expect(events[7].date).toBe('2024-01-08');
    expect(events[8].date).toBe('2024-01-09');
    expect(events[9].date).toBe('2024-01-10');
  });

  it('should validate repeat settings before creating events', async () => {
    const { result } = renderHook(() => useEventForm());

    await act(async () => {
      result.current.setTitle('Test Event');
      result.current.setDate('2024-01-01');
      result.current.setStartTime('09:00');
      result.current.setEndTime('10:00');
      result.current.setIsRepeating(true);
      result.current.setRepeatType('daily');
      result.current.setRepeatInterval(1);
      result.current.setRepeatEndDate('2020-01-01'); // 과거 날짜
    });

    await expect(result.current.createEvents()).rejects.toThrow('Invalid repeat settings');
  });

  it('should handle editing an existing event', () => {
    const existingEvent: Event = {
      id: '1',
      title: 'Existing Event',
      date: '2024-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: 'Existing Description',
      location: 'Existing Location',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 30,
    };

    const { result } = renderHook(() => useEventForm(existingEvent));

    expect(result.current.title).toBe('Existing Event');
    expect(result.current.date).toBe('2024-01-01');
    expect(result.current.startTime).toBe('09:00');
    expect(result.current.endTime).toBe('10:00');
    expect(result.current.description).toBe('Existing Description');
    expect(result.current.location).toBe('Existing Location');
    expect(result.current.category).toBe('업무');
    expect(result.current.repeatType).toBe('none');
    expect(result.current.repeatInterval).toBe(1);
    expect(result.current.notificationTime).toBe(30);
  });
});
