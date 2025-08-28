import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard 여기 제공 안함
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = String(mockEvents.length + 1); // 간단한 ID 생성
      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    })
  );
};

export const setupMockHandlerUpdating = () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '기존 회의2',
      date: '2025-10-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '기존 팀 미팅 2',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
      return HttpResponse.json(mockEvents[index]);
    })
  );
};

export const setupMockHandlerDeletion = () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '삭제할 이벤트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '삭제할 이벤트입니다',
      location: '어딘가',
      category: '기타',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    })
  );
};

// 반복 일정 생성, 수정, 삭제 모두 처리
export const setupMockHandlerRepeatEventCreation = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.post('/api/events-list', async ({ request }) => {
      const body = (await request.json()) as { events: Event[] };
      const newEvents = body.events;
      const eventsWithIds = newEvents.map((event, index) => ({
        ...event,
        id: String(mockEvents.length + index + 1),
      }));

      mockEvents.push(...eventsWithIds);
      return HttpResponse.json(eventsWithIds, { status: 201 });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = mockEvents.findIndex((event) => event.id === id);

      if (index !== -1) {
        mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
        return HttpResponse.json(mockEvents[index]);
      }

      return new HttpResponse(null, { status: 404 });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = mockEvents.findIndex((event) => event.id === id);

      if (index !== -1) {
        mockEvents.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
      }

      return new HttpResponse(null, { status: 404 });
    })
  );
};

// 반복 일정 수정만 처리
export const setupMockHandlerRepeatEventUpdating = () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '매주 팀 회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-10-30' },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '매일 스크럼',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '09:15',
      description: '일일 스크럼 미팅',
      location: '온라인',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
      notificationTime: 5,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.put('/api/events-list', async ({ request }) => {
      const updatedEvents = (await request.json()) as Event[];
      let isUpdated = false;

      updatedEvents.forEach((updatedEvent) => {
        const index = mockEvents.findIndex((event) => event.id === updatedEvent.id);
        if (index !== -1) {
          mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
          isUpdated = true;
        }
      });

      if (isUpdated) {
        return HttpResponse.json(mockEvents);
      } else {
        return new HttpResponse(null, { status: 404 });
      }
    })
  );
};

// 반복 일정 삭제만 처리
export const setupMockHandlerRepeatEventDeletion = () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '매주 팀 회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-10-30' },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '매일 스크럼',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '09:15',
      description: '일일 스크럼 미팅',
      location: '온라인',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
      notificationTime: 5,
    },
    {
      id: '3',
      title: '매월 정기 회의',
      date: '2025-08-01',
      startTime: '14:00',
      endTime: '16:00',
      description: '월간 정기 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'monthly', interval: 1, endDate: '2025-10-30' },
      notificationTime: 15,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.delete('/api/events-list', async ({ request }) => {
      const { eventIds } = (await request.json()) as { eventIds: string[] };

      const initialLength = mockEvents.length;
      eventIds.forEach((id) => {
        const index = mockEvents.findIndex((event) => event.id === id);
        if (index !== -1) {
          mockEvents.splice(index, 1);
        }
      });

      if (mockEvents.length < initialLength) {
        return new HttpResponse(null, { status: 204 });
      } else {
        return new HttpResponse(null, { status: 404 });
      }
    })
  );
};
