import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const theme = createTheme();

// ! Hard 여기 제공 안함
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

describe('반복 일정 기능', () => {
  it('반복 일정을 생성하면, 캘린더 뷰에 반복 아이콘이 표시된다.', async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-10-30' },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(events);

    setup(<App />);

    const monthView = await screen.findByTestId('month-view');
    const repeatIcons = within(monthView).getAllByTestId('repeat-icon');
    expect(repeatIcons.length).toBe(5); // 10월 1, 8, 15, 22, 29일 등 5주

    for (let day of [1, 8, 15, 22, 29]) {
      const cell = within(monthView).getByText(String(day)).closest('td')!;
      expect(within(cell).getByText('기존 회의')).toBeInTheDocument();
      expect(within(cell).getByTestId('repeat-icon')).toBeInTheDocument();
    }
  });

  it('반복 일정 중 하나를 수정하면 해당 일정이 단일 일정이 되고 반복 아이콘이 사라진다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '반복 일정',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '반복 일정 설명',
        location: '장소',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '반복 일정',
        date: '2025-10-02',
        startTime: '10:00',
        endTime: '11:00',
        description: '반복 일정 설명',
        location: '장소',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '반복 일정',
        date: '2025-10-03',
        startTime: '10:00',
        endTime: '11:00',
        description: '반복 일정 설명',
        location: '장소',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
        notificationTime: 10,
      },
      {
        id: '4',
        title: '반복 일정',
        date: '2025-10-04',
        startTime: '10:00',
        endTime: '11:00',
        description: '반복 일정 설명',
        location: '장소',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
        notificationTime: 10,
      },
      {
        id: '5',
        title: '반복 일정',
        date: '2025-10-05',
        startTime: '10:00',
        endTime: '11:00',
        description: '반복 일정 설명',
        location: '장소',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.post('/api/events', async ({ request }) => {
        const newEvent = (await request.json()) as Event;
        newEvent.id = String(mockEvents.length + 1);
        mockEvents.push(newEvent);
        return HttpResponse.json(newEvent, { status: 201 });
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params;
        const updatedEvent = (await request.json()) as Event;
        const index = mockEvents.findIndex((event) => event.id === id);

        mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
        return HttpResponse.json(mockEvents[index]);
      })
    );
    const { user } = setup(<App />);

    const monthView = await screen.findByTestId('month-view');
    let repeatIcons = within(monthView).getAllByTestId('repeat-icon');
    expect(repeatIcons.length).toBe(5);

    const editButtons = await screen.findAllByRole('button', { name: 'Edit event' });
    await user.click(editButtons[0]); // 0번째 수정

    await user.click(screen.getByLabelText('반복 일정'));

    await user.click(screen.getByTestId('event-submit-button'));

    repeatIcons = within(monthView).getAllByTestId('repeat-icon');

    const cell = within(monthView).getByText('1').closest('td')!;
    expect(within(cell).queryByTestId('repeat-icon')).toBeNull();

    for (let day of [2, 3, 4, 5]) {
      const repeatCell = within(monthView).getByText(String(day)).closest('td')!;
      expect(within(repeatCell).getByTestId('repeat-icon')).toBeInTheDocument();
    }
  });

  it('반복 일정 중 하나를 삭제하면 해당 일정만 삭제되고 나머지 반복 일정은 남아있다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '반복 일정',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '반복 일정 설명',
        location: '장소',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '반복 일정',
        date: '2025-10-02',
        startTime: '10:00',
        endTime: '11:00',
        description: '반복 일정 설명',
        location: '장소',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '반복 일정',
        date: '2025-10-03',
        startTime: '10:00',
        endTime: '11:00',
        description: '반복 일정 설명',
        location: '장소',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
        notificationTime: 10,
      },
      {
        id: '4',
        title: '반복 일정',
        date: '2025-10-04',
        startTime: '10:00',
        endTime: '11:00',
        description: '반복 일정 설명',
        location: '장소',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
        notificationTime: 10,
      },
      {
        id: '5',
        title: '반복 일정',
        date: '2025-10-05',
        startTime: '10:00',
        endTime: '11:00',
        description: '반복 일정 설명',
        location: '장소',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.post('/api/events', async ({ request }) => {
        const newEvent = (await request.json()) as Event;
        newEvent.id = String(mockEvents.length + 1);
        mockEvents.push(newEvent);
        return HttpResponse.json(newEvent, { status: 201 });
      }),
      http.delete('/api/events/:id', ({ params }) => {
        const { id } = params;
        const index = mockEvents.findIndex((event) => event.id === id);

        mockEvents.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
      })
    );
    const { user } = setup(<App />);

    const monthView = await screen.findByTestId('month-view');

    const deleteButtons = await screen.findAllByRole('button', { name: 'Delete event' });
    await user.click(deleteButtons[1]);

    const cell = within(monthView).getByText('2').closest('td')!;
    expect(within(cell).queryByTestId('repeat-icon')).toBeNull();

    for (let day of [1, 3, 4, 5]) {
      const repeatCell = within(monthView).getByText(String(day)).closest('td')!;
      expect(within(repeatCell).getByTestId('repeat-icon')).toBeInTheDocument();
    }
  });

  it('첫 로드 시 반복 일정 체크박스가 체크되어 있어야 한다, 반복 일정 체크 해제 시 UI가 변경되어야 한다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);
    const repeatCheckbox = await screen.findByLabelText('반복 일정');

    expect(repeatCheckbox).toBeInTheDocument();

    expect(repeatCheckbox).toBeChecked();
    expect(screen.getByText('반복 유형')).toBeInTheDocument();
    expect(screen.getByText('반복 종료일')).toBeInTheDocument();

    await user.click(repeatCheckbox);
    expect(repeatCheckbox).not.toBeChecked();
    expect(screen.queryByText('반복 유형')).toBeNull();
    expect(screen.queryByText('반복 종료일')).toBeNull();
  });
  it('반복 종료일 설정 안되어 있을 시, 최대 일자를 10월 30일로 지정한다.', async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-25',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(events);

    setup(<App />);

    const monthView = await screen.findByTestId('month-view');
    let repeatIcons = within(monthView).getAllByTestId('repeat-icon');
    expect(repeatIcons.length).toBe(6);

    for (let day of [25, 26, 27, 28, 29, 30]) {
      const cell = within(monthView).getByText(String(day)).closest('td')!;
      expect(within(cell).getByText('기존 회의')).toBeInTheDocument();
      expect(within(cell).getByTestId('repeat-icon')).toBeInTheDocument();
    }
  });
});
