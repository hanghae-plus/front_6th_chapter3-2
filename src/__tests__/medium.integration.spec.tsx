import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { act, render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
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

// ! Hard 여기 제공 안함
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('새 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
    expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 진행 상황 논의')).toBeInTheDocument();
    expect(eventList.getByText('회의실 A')).toBeInTheDocument();
    expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
  });

  // 새로 추가: 반복일정 생성 테스트
  it('반복 일정을 생성하면 모든 반복 정보가 이벤트 리스트에 정확히 저장된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // 반복 일정 생성
    await user.click(screen.getAllByText('일정 추가')[0]);

    await user.type(screen.getByLabelText('제목'), '주간 팀 미팅');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '매주 진행되는 팀 미팅');
    await user.type(screen.getByLabelText('위치'), '대회의실');

    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'weekly-option' }));

    // const intervalInput = screen.getByLabelText('반복 간격');
    // await user.clear(intervalInput);
    // await user.type(intervalInput, '2');

    await user.click(screen.getByTestId('event-submit-button'));

    // 기본 일정 정보 확인
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getAllByText('주간 팀 미팅')).toHaveLength(3);
    expect(eventList.getAllByText('10:00 - 11:00')).toHaveLength(3);
    expect(eventList.getAllByText('매주 진행되는 팀 미팅')).toHaveLength(3);
    expect(eventList.getAllByText('대회의실')).toHaveLength(3);
    expect(eventList.getAllByText('카테고리: 업무')).toHaveLength(3);
    expect(eventList.getAllByText(/반복: 1주마다/)).toHaveLength(3);
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const { user } = setup(<App />);

    setupMockHandlerUpdating();

    await user.click(await screen.findByLabelText('Edit event'));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '회의 내용 변경');

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('수정된 회의')).toBeInTheDocument();
    expect(eventList.getByText('회의 내용 변경')).toBeInTheDocument();
  });

  // 새로 추가: 반복일정 수정 테스트
  it('기존 반복 일정을 수정하면 단일 일정으로 변환되고 변경사항이 반영된다', async () => {
    const { user } = setup(<App />);

    const mockEvents = [
      {
        id: '1',
        title: '주간 팀 미팅',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '매주 진행되는 팀 미팅',
        location: '대회의실',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '주간 팀 미팅',
        date: '2025-10-22',
        startTime: '10:00',
        endTime: '11:00',
        description: '매주 진행되는 팀 미팅',
        location: '대회의실',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
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

    await user.click(await screen.findByLabelText('Edit event'));

    // 기본 정보 수정
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 주간 팀 미팅');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '반복에서 단일로 변경됨');

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = within(screen.getByTestId('event-list'));

    expect(eventList.getByText('수정된 주간 팀 미팅')).toBeInTheDocument();
    expect(eventList.getByText('반복에서 단일로 변경됨')).toBeInTheDocument();
    expect(eventList.getAllByText(/반복: 1주마다/)).toHaveLength(1);
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('삭제할 이벤트')).toBeInTheDocument();

    // 삭제 버튼 클릭
    const allDeleteButton = await screen.findAllByLabelText('Delete event');
    await user.click(allDeleteButton[0]);

    expect(eventList.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // ! 현재 시스템 시간 2025-10-01
    const { user } = setup(<App />);

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번주 팀 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번주 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
    });

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = within(screen.getByTestId('week-view'));
    expect(weekView.getByText('이번주 팀 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2025-01-01'));

    setup(<App />);

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번달 팀 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번달 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
    });

    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('이번달 팀 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));
    setup(<App />);

    const monthView = screen.getByTestId('month-view');

    // 1월 1일 셀 확인
    const januaryFirstCell = within(monthView).getByText('1').closest('td')!;
    expect(within(januaryFirstCell).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: 1,
              title: '팀 회의',
              date: '2025-10-15',
              startTime: '09:00',
              endTime: '10:00',
              description: '주간 팀 미팅',
              location: '회의실 A',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
            {
              id: 2,
              title: '프로젝트 계획',
              date: '2025-10-16',
              startTime: '14:00',
              endTime: '15:00',
              description: '새 프로젝트 계획 수립',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
          ],
        });
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지 않는 일정');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');
    await user.clear(searchInput);

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 계획')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
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
    ]);

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '설명',
      location: '회의실 A',
      category: '업무',
    });

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const editButton = (await screen.findAllByLabelText('Edit event'))[1];
    await user.click(editButton);

    // 시간 수정하여 다른 일정과 충돌 발생
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '08:30');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });
});

describe('알림 기능', () => {
  it('일정 생성 후 알림 시간 10분 전에 정확히 알림이 표시되고 사용자가 닫을 수 있다', async () => {
    setupMockHandlerCreation();

    vi.setSystemTime(new Date('2025-10-15 08:45:00'));

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '팀 미팅',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 미팅')).toBeInTheDocument();

    expect(screen.queryByText('10분 후 팀 미팅 일정이 시작됩니다.')).not.toBeInTheDocument();

    act(() => {
      vi.setSystemTime(new Date('2025-10-15 08:50:00'));
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('10분 후 팀 미팅 일정이 시작됩니다.')).toBeInTheDocument();

    const closeButton = screen.getByTestId('CloseIcon');
    await user.click(closeButton);

    expect(screen.queryByText('10분 후 팀 미팅 일정이 시작됩니다.')).not.toBeInTheDocument();
  });

  it('알림이 타이틀과 알림 시간과 함께 메시지에 표시되는지 확인한다', async () => {
    setupMockHandlerCreation();

    vi.setSystemTime(new Date('2025-10-15 13:50:00'));

    const { user } = setup(<App />);

    // 14:00 시작 일정 생성
    await saveSchedule(user, {
      title: '프로젝트 리뷰',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '월간 프로젝트 검토',
      location: '대회의실',
      category: '업무',
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('10분 후 프로젝트 리뷰 일정이 시작됩니다.')).toBeInTheDocument();
  });

  it('서로 다른 시간의 여러 일정 알림이 표시되고 개별적으로 제거된다', async () => {
    setupMockHandlerCreation();

    vi.setSystemTime(new Date('2025-10-15 08:30:00'));

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '아침 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '09:30',
      description: '일일 스탠드업',
      location: '회의실 A',
      category: '업무',
    });

    await saveSchedule(user, {
      title: '기획 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '신규 기능 기획',
      location: '회의실 B',
      category: '업무',
    });

    act(() => {
      vi.setSystemTime(new Date('2025-10-15 08:50:00'));
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('10분 후 아침 회의 일정이 시작됩니다.')).toBeInTheDocument();
    expect(screen.queryByText('10분 후 기획 회의 일정이 시작됩니다.')).not.toBeInTheDocument();

    act(() => {
      vi.setSystemTime(new Date('2025-10-15 09:50:00'));
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('10분 후 아침 회의 일정이 시작됩니다.')).toBeInTheDocument();
    expect(screen.getByText('10분 후 기획 회의 일정이 시작됩니다.')).toBeInTheDocument();

    const closeButtons = screen.getAllByTestId('CloseIcon');
    await user.click(closeButtons[0]);

    expect(screen.queryByText('10분 후 아침 회의 일정이 시작됩니다.')).not.toBeInTheDocument();
    expect(screen.getByText('10분 후 기획 회의 일정이 시작됩니다.')).toBeInTheDocument();
  });
});
