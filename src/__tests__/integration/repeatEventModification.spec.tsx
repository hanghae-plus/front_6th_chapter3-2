import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';

const theme = createTheme();

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

describe('반복 일정 단일 수정', () => {
  beforeEach(() => {
    // 반복 일정이 이미 존재하는 상태로 Mock 설정
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: 'weekly-1',
              title: '반복 회의',
              date: '2025-10-15',
              startTime: '09:00',
              endTime: '10:00',
              description: '매주 팀 미팅',
              location: '회의실 A',
              category: '업무',
              repeat: { type: 'weekly', interval: 1 },
              notificationTime: 10,
            },
            {
              id: 'weekly-2',
              title: '반복 회의',
              date: '2025-10-22',
              startTime: '09:00',
              endTime: '10:00',
              description: '매주 팀 미팅',
              location: '회의실 A',
              category: '업무',
              repeat: { type: 'weekly', interval: 1 },
              notificationTime: 10,
            },
            {
              id: 'weekly-3',
              title: '반복 회의',
              date: '2025-10-29',
              startTime: '09:00',
              endTime: '10:00',
              description: '매주 팀 미팅',
              location: '회의실 A',
              category: '업무',
              repeat: { type: 'weekly', interval: 1 },
              notificationTime: 10,
            },
          ],
        });
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const eventId = params.id as string;
        const updatedEvent = (await request.json()) as Event;

        // 수정된 이벤트는 단일 일정으로 변경 (repeat.type = 'none')
        const modifiedEvent = {
          ...updatedEvent,
          id: eventId,
          repeat: { type: 'none', interval: 1 },
        };

        // 기존 이벤트 목록에서 해당 이벤트만 업데이트
        server.use(
          http.get('/api/events', () => {
            return HttpResponse.json({
              events: [
                {
                  id: 'weekly-1',
                  title: '반복 회의',
                  date: '2025-10-15',
                  startTime: '09:00',
                  endTime: '10:00',
                  description: '매주 팀 미팅',
                  location: '회의실 A',
                  category: '업무',
                  repeat: { type: 'weekly', interval: 1 },
                  notificationTime: 10,
                },
                modifiedEvent, // 수정된 이벤트
                {
                  id: 'weekly-3',
                  title: '반복 회의',
                  date: '2025-10-29',
                  startTime: '09:00',
                  endTime: '10:00',
                  description: '매주 팀 미팅',
                  location: '회의실 A',
                  category: '업무',
                  repeat: { type: 'weekly', interval: 1 },
                  notificationTime: 10,
                },
              ],
            });
          })
        );

        return HttpResponse.json({ success: true });
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('반복 일정 중 하나를 수정하면 해당 일정만 단일 일정으로 변경되고 반복 아이콘이 사라진다', async () => {
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 1. 초기 반복 일정들 확인
    const eventList = within(screen.getByTestId('event-list'));
    const repeatEvents = await eventList.findAllByText('반복 회의');
    expect(repeatEvents).toHaveLength(3); // 3개의 반복 일정

    // 모든 반복 일정에 반복 아이콘이 있는지 확인
    const repeatIcons = eventList.getAllByTestId('repeat-icon');
    expect(repeatIcons).toHaveLength(3);

    // 2. 중간 일정(두 번째) 수정
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[1]);

    // 제목 수정
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 단일 회의');

    await user.click(screen.getByTestId('event-submit-button'));

    // 3. 수정된 일정이 단일 일정으로 변경되었는지 확인
    await screen.findByText('일정이 수정되었습니다.');

    const updatedEventList = within(screen.getByTestId('event-list'));

    // 수정된 일정 확인
    expect(updatedEventList.getByText('수정된 단일 회의')).toBeInTheDocument();

    // 수정된 일정에는 반복 아이콘이 없어야 함
    const modifiedEventContainer = updatedEventList.getByText('수정된 단일 회의').closest('div')!;
    expect(within(modifiedEventContainer).queryByTestId('repeat-icon')).not.toBeInTheDocument();

    // 4. 다른 반복 일정들은 영향받지 않았는지 확인
    const remainingRepeatEvents = updatedEventList.getAllByText('반복 회의');
    expect(remainingRepeatEvents).toHaveLength(2);

    // 나머지 반복 일정들에는 여전히 반복 아이콘이 있어야 함
    const remainingRepeatIcons = updatedEventList.getAllByTestId('repeat-icon');
    expect(remainingRepeatIcons).toHaveLength(2);
  });
});

describe('반복 일정 단일 삭제', () => {
  beforeEach(() => {
    // 반복 일정이 이미 존재하는 상태로 Mock 설정
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: 'daily-1',
              title: '매일 운동',
              date: '2025-10-15',
              startTime: '07:00',
              endTime: '08:00',
              description: '아침 운동',
              location: '헬스장',
              category: '개인',
              repeat: { type: 'daily', interval: 1 },
              notificationTime: 10,
            },
            {
              id: 'daily-2',
              title: '매일 운동',
              date: '2025-10-16',
              startTime: '07:00',
              endTime: '08:00',
              description: '아침 운동',
              location: '헬스장',
              category: '개인',
              repeat: { type: 'daily', interval: 1 },
              notificationTime: 10,
            },
            {
              id: 'daily-3',
              title: '매일 운동',
              date: '2025-10-17',
              startTime: '07:00',
              endTime: '08:00',
              description: '아침 운동',
              location: '헬스장',
              category: '개인',
              repeat: { type: 'daily', interval: 1 },
              notificationTime: 10,
            },
          ],
        });
      }),
      http.delete('/api/events/:id', ({ params }) => {
        const deletedId = params.id as string;

        // 삭제된 이벤트를 제외한 나머지 이벤트들 반환
        server.use(
          http.get('/api/events', () => {
            return HttpResponse.json({
              events: [
                {
                  id: 'daily-1',
                  title: '매일 운동',
                  date: '2025-10-15',
                  startTime: '07:00',
                  endTime: '08:00',
                  description: '아침 운동',
                  location: '헬스장',
                  category: '개인',
                  repeat: { type: 'daily', interval: 1 },
                  notificationTime: 10,
                },
                {
                  id: 'daily-3',
                  title: '매일 운동',
                  date: '2025-10-17',
                  startTime: '07:00',
                  endTime: '08:00',
                  description: '아침 운동',
                  location: '헬스장',
                  category: '개인',
                  repeat: { type: 'daily', interval: 1 },
                  notificationTime: 10,
                },
              ].filter((event) => event.id !== deletedId),
            });
          })
        );

        return HttpResponse.json({ success: true });
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('반복 일정 중 하나를 삭제하면 해당 일정만 삭제되고 다른 반복 일정은 유지된다', async () => {
    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 1. 초기 반복 일정들 확인
    const eventList = within(screen.getByTestId('event-list'));
    const initialRepeatEvents = await eventList.findAllByText('매일 운동');
    expect(initialRepeatEvents).toHaveLength(3);

    // 모든 반복 일정에 반복 아이콘이 있는지 확인
    const initialRepeatIcons = eventList.getAllByTestId('repeat-icon');
    expect(initialRepeatIcons).toHaveLength(3);

    // 2. 중간 일정(두 번째) 삭제
    const deleteButtons = await screen.findAllByLabelText('Delete event');
    await user.click(deleteButtons[1]);

    // 3. 삭제 완료 대기
    await screen.findByText('일정이 삭제되었습니다.');

    // 4. 삭제된 일정이 목록에서 사라졌는지 확인
    const updatedEventList = within(screen.getByTestId('event-list'));
    const remainingRepeatEvents = updatedEventList.getAllByText('매일 운동');
    expect(remainingRepeatEvents).toHaveLength(2);

    // 5. 나머지 반복 일정들의 반복 아이콘이 유지되는지 확인
    const remainingRepeatIcons = updatedEventList.getAllByTestId('repeat-icon');
    expect(remainingRepeatIcons).toHaveLength(2);

    // 6. 남은 일정들의 날짜 확인 (중간 날짜가 삭제되었는지)
    expect(updatedEventList.getByText('2025-10-15')).toBeInTheDocument();
    expect(updatedEventList.queryByText('2025-10-16')).not.toBeInTheDocument(); // 삭제됨
    expect(updatedEventList.getByText('2025-10-17')).toBeInTheDocument();
  });
});
