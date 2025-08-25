import { describe, it, expect, beforeEach } from 'vitest';

import { setupMockHandlerBulkOperations } from '../../__mocks__/handlersUtils';
import type { Event } from '../../types';

describe('Integration - Bulk Events API', () => {
  beforeEach(() => {
    setupMockHandlerBulkOperations([]);
  });

  it('POST /api/events-list: 동일한 repeat.id로 여러 이벤트를 생성한다', async () => {
    const payload: Partial<Event>[] = [
      {
        title: 'A',
        date: '2024-01-01',
        repeat: { type: 'daily', interval: 1 },
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        notificationTime: 10,
      },
      {
        title: 'B',
        date: '2024-01-02',
        repeat: { type: 'daily', interval: 1 },
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        notificationTime: 10,
      },
    ] as unknown as Event[];

    const res = await fetch('/api/events-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: payload }),
    });
    expect(res.status).toBe(201);
    const created: Event[] = await res.json();
    const ids = new Set(created.map((e) => e.repeat.id));
    expect(ids.size).toBe(1);
  });

  it('PUT /api/events-list: 여러 이벤트를 일괄 수정한다', async () => {
    // 먼저 생성
    const createRes = await fetch('/api/events-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: [
          {
            title: 'A',
            date: '2024-01-01',
            repeat: { type: 'daily', interval: 1 },
            startTime: '09:00',
            endTime: '10:00',
            description: '',
            location: '',
            category: '업무',
            notificationTime: 10,
          },
          {
            title: 'B',
            date: '2024-01-02',
            repeat: { type: 'daily', interval: 1 },
            startTime: '09:00',
            endTime: '10:00',
            description: '',
            location: '',
            category: '업무',
            notificationTime: 10,
          },
        ],
      }),
    });
    const created: Event[] = await createRes.json();

    const updated = created.map((e) => ({ ...e, title: `${e.title}-updated` }));
    const res = await fetch('/api/events-list', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: updated }),
    });
    expect(res.status === 200 || res.status === 201).toBeTruthy();
    const list: Event[] = await res.json();
    const updatedSubset = list.filter((e) => created.some((c) => c.id === e.id));
    updatedSubset.forEach((e) => expect(e.title.endsWith('-updated')).toBe(true));
  });

  it('DELETE /api/events-list: 여러 이벤트를 일괄 삭제한다', async () => {
    const createRes = await fetch('/api/events-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: [
          {
            title: 'A',
            date: '2024-01-01',
            repeat: { type: 'daily', interval: 1 },
            startTime: '09:00',
            endTime: '10:00',
            description: '',
            location: '',
            category: '업무',
            notificationTime: 10,
          },
          {
            title: 'B',
            date: '2024-01-02',
            repeat: { type: 'daily', interval: 1 },
            startTime: '09:00',
            endTime: '10:00',
            description: '',
            location: '',
            category: '업무',
            notificationTime: 10,
          },
        ],
      }),
    });
    const created: Event[] = await createRes.json();

    const res = await fetch('/api/events-list', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventIds: created.map((e) => e.id) }),
    });
    expect(res.status).toBe(204);
  });
});
