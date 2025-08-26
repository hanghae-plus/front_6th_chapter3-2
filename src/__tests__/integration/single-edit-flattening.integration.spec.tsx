import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';

import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';

const theme = createTheme();

const setup = () => {
  const user = userEvent.setup();
  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

it('단일 수정 저장 후 반복 아이콘이 사라진다', async () => {
  // Given: 반복 이벤트 1건 존재 + PUT 업데이트 지원
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

  const { user } = setup();

  // Then: 로딩 완료 및 초기 반복 아이콘 표시 확인
  await screen.findByText('일정 로딩 완료!');
  const list = within(screen.getByTestId('event-list'));
  await list.findByText('반복 회의');
  // 리스트에 반복 표시 텍스트가 존재해야 함 (반복 이벤트)
  expect(list.getByText(/반복:\s*1\s*일\s*마다/)).toBeInTheDocument();

  // When: 편집 진입 후 "이 일정만 수정" 선택하여 저장
  const editButtons = await screen.findAllByLabelText('Edit event');
  await user.click(editButtons[0]);

  // 수정 범위: single 선택
  await user.click(screen.getByLabelText('이 일정만 수정'));

  // 타이틀 약간 수정 후 저장
  await user.clear(screen.getByLabelText('제목'));
  await user.type(screen.getByLabelText('제목'), '반복 회의(단일화)');
  await user.click(screen.getByTestId('event-submit-button'));

  // Then: 리스트에서 해당 항목이 단일 일정으로 바뀌어 반복 아이콘/표시가 사라짐
  const updatedList = within(screen.getByTestId('event-list'));
  await updatedList.findByText('반복 회의(단일화)');

  // 리스트 영역에 반복 표시 텍스트가 없어야 함
  expect(updatedList.queryByText(/반복:\s*/)).toBeNull();
});
