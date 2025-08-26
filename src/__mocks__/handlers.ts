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
    const { id } = params;
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

  http.post('/api/events-list', async ({ request }) => {
    const { events: newEventsList } = (await request.json()) as { events: Event[] };
    const repeatId = 'mock-repeat-id';

    const createdEvents = newEventsList.map((event) => {
      const isRepeatEvent = event.repeat.type !== 'none';
      return {
        ...event,
        id: String(events.length + Math.random()),
        repeat: {
          ...event.repeat,
          id: isRepeatEvent ? repeatId : undefined,
        },
      };
    });

    return HttpResponse.json(createdEvents, { status: 201 });
  }),

  http.put('/api/events-list', async ({ request }) => {
    const { events: updatedEventsList } = (await request.json()) as { events: Event[] };
    let isUpdated = false;

    const updatedEvents = events.map((event) => {
      const updateEvent = updatedEventsList.find((e) => e.id === event.id);
      if (updateEvent) {
        isUpdated = true;
        return { ...event, ...updateEvent };
      }
      return event;
    });

    if (isUpdated) {
      return HttpResponse.json(updatedEvents);
    }

    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('/api/events-list', async ({ request }) => {
    const { eventIds } = (await request.json()) as { eventIds: string[] };
    const remainingEvents = events.filter((event) => !eventIds.includes(event.id));

    if (remainingEvents.length < events.length) {
      return new HttpResponse(null, { status: 204 });
    }

    return new HttpResponse(null, { status: 404 });
  }),
];
