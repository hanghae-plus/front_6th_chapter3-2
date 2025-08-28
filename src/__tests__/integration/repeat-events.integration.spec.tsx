import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent, UserEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { debug } from 'vitest-preview';

import { setupMockHandlerRepeatEventCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';

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

const saveRepeatingSchedule = async (
  user: UserEvent,
  form: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    location: string;
    category: string;
    notificationTime?: number;
    repeat: { type: 'daily' | 'weekly' | 'monthly' | 'yearly'; interval: number; endDate?: string };
  }
) => {
  const { repeat, notificationTime, ...base } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);
  await user.type(screen.getByLabelText('제목'), base.title);
  await user.type(screen.getByLabelText('날짜'), base.date);
  await user.type(screen.getByLabelText('시작 시간'), base.startTime);
  await user.type(screen.getByLabelText('종료 시간'), base.endTime);
  await user.type(screen.getByLabelText('설명'), base.description);
  await user.type(screen.getByLabelText('위치'), base.location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${base.category}-option` }));

  expect(screen.getByLabelText('반복 일정')).toBeChecked();

  const repeatTypeSelect = within(screen.getByLabelText('반복 유형')).getByRole('combobox');
  await user.click(repeatTypeSelect);

  await user.click(
    screen.getByRole('option', {
      name: `${repeat.type}-option`,
    })
  );

  await user.clear(screen.getByText('반복 간격').parentElement!.querySelector('input')!);
  await user.type(
    screen.getByText('반복 간격').parentElement!.querySelector('input')!,
    String(repeat.interval)
  );

  if (repeat.endDate) {
    await user.type(
      screen.getByText('반복 종료일').parentElement!.querySelector('input')!,
      repeat.endDate
    );
  }

  if (notificationTime !== undefined) {
    await user.click(screen.getByLabelText('알림 설정'));
    await user.click(within(screen.getByLabelText('알림 설정')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: `${notificationTime}` }));
  }

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 일정', () => {
  it('반복 일정을 등록한다', async () => {
    setupMockHandlerRepeatEventCreation();
    const { user } = setup();

    await saveRepeatingSchedule(user, {
      title: '주간 스탠드업',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '09:15',
      description: '팀 스탠드업',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-10-30' },
    });
    expect(await screen.findByText('일정이 추가되었습니다.')).toBeInTheDocument();
  });

  it('등록된 반복 일정이 리스트에서는 한 번만 표시되고 뷰에서는 여러 번 표시된다', async () => {
    setupMockHandlerRepeatEventCreation();
    const { user } = setup();

    await saveRepeatingSchedule(user, {
      title: '주간 스탠드업',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '09:15',
      description: '팀 스탠드업',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-10-30' },
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('주간 스탠드업')).toBeInTheDocument();

    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getAllByText('주간 스탠드업')).toHaveLength(5);
  });

  it('캘린더 뷰에서 반복 일정을 아이콘을 넣어 구분하여 표시한다.', async () => {
    setupMockHandlerRepeatEventCreation();
    const { user } = setup();

    await saveRepeatingSchedule(user, {
      title: '주간 스탠드업',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '09:15',
      description: '팀 스탠드업',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-10-30' },
    });

    const repeatIcon = screen.getAllByLabelText('repeat-icon');
    expect(repeatIcon).toHaveLength(5);

    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getAllByText('주간 스탠드업')).toHaveLength(5);
  });

  it('반복 종료일까지 반복 일정이 정확히 생성된다', async () => {
    setupMockHandlerRepeatEventCreation();
    const { user } = setup();

    await saveRepeatingSchedule(user, {
      title: '주간 스탠드업',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '09:15',
      description: '팀 스탠드업',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-10-30' },
    });

    const monthView = within(screen.getByTestId('month-view'));

    expect(monthView.getAllByText('주간 스탠드업')).toHaveLength(5);

    const repeatEvents = monthView.getAllByText('주간 스탠드업');
    expect(repeatEvents.length).toBeGreaterThan(0);

    repeatEvents.forEach((event) => {
      expect(event).toHaveTextContent('주간 스탠드업');
    });
  });

  it('반복 일정을 수정하면 단일 일정으로 변경된다', async () => {
    setupMockHandlerRepeatEventCreation();
    const { user } = setup();

    await saveRepeatingSchedule(user, {
      title: '주간 스탠드업',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '09:15',
      description: '팀 스탠드업',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-10-30' },
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getAllByText('주간 스탠드업')).toHaveLength(1);
    expect(screen.getAllByLabelText('repeat-icon')).toHaveLength(5);

    await user.click(screen.getByLabelText('Edit event'));

    // 수정 폼에서 반복 설정 해제
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    await user.click(repeatCheckbox);
    expect(repeatCheckbox).not.toBeChecked();

    await user.click(screen.getByTestId('event-submit-button'));
    debug();

    expect(await screen.findByText('일정이 수정되었습니다.')).toBeInTheDocument();

    // 반복 일정이 단일 일정으로 변경되었는지 확인
    // 수정된 일정(단일) + 나머지 반복 그룹으로 2개가 리스트에 표시됨
    expect(eventList.getAllByText('주간 스탠드업')).toHaveLength(2);
    expect(screen.getAllByLabelText('repeat-icon')).toHaveLength(4);
  });

  it('반복 일정을 삭제하면 해당 일정만 삭제된다', async () => {
    setupMockHandlerRepeatEventCreation();
    const { user } = setup();

    // 반복 일정 생성 (매주 목요일, 5주간)
    await saveRepeatingSchedule(user, {
      title: '주간 리뷰',
      date: '2025-10-02',
      startTime: '15:00',
      endTime: '16:00',
      description: '주간 업무 리뷰',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-10-30' },
    });

    expect(await screen.findByText('일정이 추가되었습니다.')).toBeInTheDocument();

    expect(screen.getAllByLabelText('repeat-icon')).toHaveLength(5);

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('주간 리뷰')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Delete event'));

    expect(screen.getAllByLabelText('repeat-icon')).toHaveLength(4);

    // 이벤트 리스트에서 반복 일정 그룹은 여전히 표시되어야 함
    expect(eventList.getByText('주간 리뷰')).toBeInTheDocument();
  });
});
