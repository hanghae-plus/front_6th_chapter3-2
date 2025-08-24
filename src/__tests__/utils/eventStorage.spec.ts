import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

import type { Event } from '../../types';
import { saveEvents, loadEvents } from '../../utils/eventStorage';

describe('eventStorage', () => {
  beforeAll(() => {
    const mockDate = new Date('2024-01-01T00:00:00.000Z');
    vi.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should save repeating events correctly', async () => {
    const events: Event[] = [
      {
        id: '2',
        title: '반복 회의',
        date: '2024-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2024-01-22',
        },
        notificationTime: 10,
      },
    ];

    const result = await saveEvents(events);
    expect(result).toBe(true);

    // 저장된 이벤트 확인
    const savedEvents = await loadEvents();
    expect(savedEvents).toHaveLength(4); // 4주치 이벤트

    // 각 이벤트의 날짜 확인
    expect(savedEvents[0].date).toBe('2024-01-01');
    expect(savedEvents[1].date).toBe('2024-01-08');
    expect(savedEvents[2].date).toBe('2024-01-15');
    expect(savedEvents[3].date).toBe('2024-01-22');

    // 각 이벤트가 고유한 ID를 가지는지 확인
    const ids = new Set(savedEvents.map((event) => event.id));
    expect(ids.size).toBe(savedEvents.length);
  });

  it('should maintain existing events when saving new events', async () => {
    const existingEvents = await loadEvents();
    const newEvent: Event = {
      id: '3',
      title: '단일 회의',
      date: '2024-01-05',
      startTime: '14:00',
      endTime: '15:00',
      description: '임시 미팅',
      location: '회의실 C',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    };

    const result = await saveEvents([newEvent]);
    expect(result).toBe(true);

    const allEvents = await loadEvents();
    expect(allEvents.length).toBe(existingEvents.length + 1);
    expect(allEvents).toContainEqual(newEvent);
  });
});
