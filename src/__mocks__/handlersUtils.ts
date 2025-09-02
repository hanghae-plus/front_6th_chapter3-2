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

// 반복 일정 생성 테스트용 핸들러
export const setupMockHandlerRepeatCreation = () => {
  let mockEvents: Event[] = []; // 빈 배열로 시작

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.post('/api/events-list', async ({ request }) => {
      const { events } = (await request.json()) as { events: Event[] };
      // 생성된 반복 일정들을 mockEvents에 추가
      mockEvents.push(...events);
      return HttpResponse.json(events, { status: 201 });
    })
  );
};

// 반복 일정 수정 테스트용 핸들러
export const setupMockHandlerRepeatUpdate = () => {
  let mockEvents: Event[] = [
    {
      id: 'repeat-1',
      title: '매일 운동',
      date: '2025-10-01',
      startTime: '07:00',
      endTime: '08:00',
      description: '매일 운동하기',
      location: '헬스장',
      category: '개인',
      repeat: { type: 'daily', interval: 1, id: 'repeat-series-1' },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.put('/api/events/repeat-1', async ({ request }) => {
      const updatedEvent = (await request.json()) as Event;
      // mockEvents 배열에서 해당 이벤트를 찾아서 업데이트
      const index = mockEvents.findIndex((event) => event.id === updatedEvent.id);
      if (index !== -1) {
        mockEvents[index] = updatedEvent;
      }
      return HttpResponse.json(updatedEvent);
    })
  );
};

// 반복 일정 삭제 테스트용 핸들러
export const setupMockHandlerRepeatDeletion = () => {
  let mockEvents: Event[] = [
    {
      id: 'repeat-1',
      title: '매일 운동',
      date: '2025-10-01',
      startTime: '07:00',
      endTime: '08:00',
      description: '매일 운동하기',
      location: '헬스장',
      category: '개인',
      repeat: { type: 'daily', interval: 1, id: 'repeat-series-1' },
      notificationTime: 10,
    },
    {
      id: 'repeat-2',
      title: '매일 운동',
      date: '2025-10-02',
      startTime: '07:00',
      endTime: '08:00',
      description: '매일 운동하기',
      location: '헬스장',
      category: '개인',
      repeat: { type: 'daily', interval: 1, id: 'repeat-series-1' },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.delete('/api/events/repeat-1', () => {
      mockEvents = mockEvents.filter((event) => event.id !== 'repeat-1');
      return new HttpResponse(null, { status: 204 });
    }),
    // 삭제 후 GET 요청에 대한 응답
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    })
  );
};
