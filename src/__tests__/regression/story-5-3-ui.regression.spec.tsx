import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';
import { setup } from '../utils/setup-render';

describe('Regression - Story 5.3 UI (단일 수정 단일화)', () => {
  it('이 일정만 수정 후 리스트에서 반복 표시가 제거된다', async () => {
    const mockEvents: Event[] = [
      {
        id: 'r1',
        title: '반복 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '설명',
        location: 'A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, id: 'gid-1' },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => HttpResponse.json({ events: mockEvents })),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params as { id: string };
        const payload = (await request.json()) as Event;
        const idx = mockEvents.findIndex((e) => e.id === id);
        if (idx !== -1) {
          mockEvents[idx] = { ...mockEvents[idx], ...payload };
          return HttpResponse.json(mockEvents[idx]);
        }
        return new HttpResponse(null, { status: 404 });
      })
    );

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');
    const list = within(screen.getByTestId('event-list'));
    await list.findByText('반복 회의');
    expect(list.getByText(/반복:\s*1\s*일\s*마다/)).toBeInTheDocument();

    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    await user.click(screen.getByLabelText('이 일정만 수정'));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '반복 회의(단일화)');
    await user.click(screen.getByTestId('event-submit-button'));

    const updatedList = within(screen.getByTestId('event-list'));
    await updatedList.findByText('반복 회의(단일화)');
    expect(updatedList.queryByText(/반복:\s*/)).toBeNull();
  });
});
