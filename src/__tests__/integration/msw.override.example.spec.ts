import { http, HttpResponse } from 'msw';
import { describe, it, expect } from 'vitest';

import { server } from '../../setupTests';

describe('MSW override example', () => {
  it('overrides GET /api/events to return 500', async () => {
    server.use(
      http.get('/api/events', () => {
        return new HttpResponse('mock error', { status: 500 });
      })
    );

    const res = await fetch('/api/events');
    expect(res.status).toBe(500);
  });
});
