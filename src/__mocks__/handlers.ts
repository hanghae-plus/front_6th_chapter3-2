import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    newEvent.id = String(events.length + 1);
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params; // 수정할 이벤트의 아이디
    const updatedEvent = (await request.json()) as Event;
    const index = events.findIndex((event) => event.id === id);

    if (index !== -1) {
      return HttpResponse.json({ ...events[index], ...updatedEvent });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = events.findIndex((event) => event.id === id);

    if (index !== -1) {
      return new HttpResponse(null, { status: 204 });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  // ------------------------- 여러 일정 처리 -------------------------

  http.post('/api/events-list', async ({ request }) => {
    const newEvents = (await request.json()) as Event[];
    newEvents.forEach((event) => {
      event.id = String(events.length + 1);
    });
    return HttpResponse.json(newEvents, { status: 201 });
  }),

  http.put('/api/events-list', async ({ request }) => {
    const updatedEvents = (await request.json()) as Event[];
    let isUpdated = false;

    const newEvents = [...events];

    updatedEvents.forEach((event) => {
      const index = events.findIndex((target) => target.id === event.id);
      if (index > -1) isUpdated = true;
      newEvents[index] = { ...events[index], ...event };
    });

    if (isUpdated) {
      events.splice(0, events.length, ...newEvents);
      return HttpResponse.json(newEvents);
    } else {
      return new HttpResponse(null, { status: 404 });
    }
  }),

  http.delete('/api/events-list', async ({ request }) => {
    const { eventIds } = (await request.json()) as { eventIds: string[] };
    const exists = events.some((event) => eventIds.find((id) => event.id === id));

    if (!exists) {
      return new HttpResponse(null, { status: 404 });
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
