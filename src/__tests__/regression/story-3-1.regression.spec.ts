import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

import type { Event } from '../../types';
import { generateEventInstances } from '../../utils/repeatingEventUtils';

beforeAll(() => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  vi.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('Regression - Story 3.1', () => {
  it('반복 인스턴스 생성 시 동일한 repeat.id가 부여된다', () => {
    const baseEvent: Event = {
      id: 'base',
      title: '반복 회의',
      date: '2024-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2024-01-03' },
      notificationTime: 10,
    };

    const instances = generateEventInstances(baseEvent.repeat, baseEvent);
    expect(instances.length).toBeGreaterThan(1);

    const groupIds = new Set(instances.map((e) => e.repeat.id));
    expect(groupIds.size).toBe(1);
    expect([...groupIds][0]).toBeTruthy();
  });

  it('이미 id가 있는 경우 해당 id를 유지한다', () => {
    const existingId = 'fixed-group-id';
    const baseEvent: Event = {
      id: 'base',
      title: '반복 회의',
      date: '2024-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2024-01-02', id: existingId },
      notificationTime: 10,
    };

    const instances = generateEventInstances(baseEvent.repeat, baseEvent);
    const groupIds = new Set(instances.map((e) => e.repeat.id));
    expect(groupIds.size).toBe(1);
    expect([...groupIds][0]).toBe(existingId);
  });
});
