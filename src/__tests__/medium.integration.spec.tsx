import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
  setupMockHandlerRepeatCreation,
  setupMockHandlerRepeatUpdate,
  setupMockHandlerRepeatDeletion,
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

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-10-15 08:49:59'));

  setup(<App />);

  // ! 일정 로딩 완료 후 테스트
  await screen.findByText('일정 로딩 완료!');

  expect(screen.queryByText('10분 후 기존 회의 일정이 시작됩니다.')).not.toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(screen.getByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
});

// 반복 일정 관련 통합 테스트
describe('반복 일정 기능', () => {
  it('매일 반복 일정을 생성하고 캘린더에 표시한다', async () => {
    setupMockHandlerRepeatCreation();

    const { user } = setup(<App />);

    // 일정 추가 버튼 클릭
    await user.click(screen.getAllByText('일정 추가')[0]);

    // 일정 정보 입력
    await user.type(screen.getByLabelText('제목'), '매일 운동');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '07:00');
    await user.type(screen.getByLabelText('종료 시간'), '08:00');
    await user.type(screen.getByLabelText('설명'), '매일 운동하기');
    await user.type(screen.getByLabelText('위치'), '헬스장');

    // 카테고리 선택
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '개인-option' }));

    // 반복 설정 활성화 - 체크박스 상태를 먼저 확인
    const repeatCheckbox = screen.getByLabelText('반복 일정');

    // 체크박스가 이미 체크되어 있는지 확인
    if (!(repeatCheckbox as HTMLInputElement).checked) {
      await user.click(repeatCheckbox);
    }

    // 반복 유형 선택 (매일)
    await user.click(screen.getByLabelText('반복 유형'));
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'daily-option' }));

    // 종료일 설정
    await user.type(screen.getByLabelText('반복 종료일'), '2025-10-03');

    // 일정 3개 생성 확인
    expect(screen.getByText('3개의 반복 일정이 생성됩니다.')).toBeInTheDocument();

    // 미리보기에서 3개 날짜가 표시되는지 확인 (동적 텍스트)
    expect(screen.getByText(/날짜: 2025-10-01, 2025-10-02, 2025-10-03/)).toBeInTheDocument();

    // 일정 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 성공 메시지 확인
    expect(await screen.findByText('3개의 반복 일정이 추가되었습니다.')).toBeInTheDocument();

    // 캘린더에 반복 일정이 표시되는지 확인 (이벤트 리스트에서)
    const eventList = screen.getByTestId('event-list');
    const repeatEvents = within(eventList).getAllByText('매일 운동하기');
    expect(repeatEvents).toHaveLength(3);

    const repeatInfos = within(eventList).getAllByText('반복: 1일마다 (종료: 2025-10-03)');
    expect(repeatInfos).toHaveLength(3);

    // 반복 아이콘이 표시되는지 확인
    const repeatIcons = screen.getAllByTestId('RepeatIcon');
    expect(repeatIcons.length).toBeGreaterThan(0);
  });

  it('매주 반복 일정을 생성하고 캘린더에 표시한다', async () => {
    setupMockHandlerRepeatCreation();

    const { user } = setup(<App />);

    // 일정 추가 버튼 클릭
    await user.click(screen.getAllByText('일정 추가')[0]);

    // 일정 정보 입력
    await user.type(screen.getByLabelText('제목'), '주간 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');
    await user.type(screen.getByLabelText('설명'), '매주 팀 회의');
    await user.type(screen.getByLabelText('위치'), '회의실 A');

    // 카테고리 선택
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 설정 활성화
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    if (!(repeatCheckbox as HTMLInputElement).checked) {
      await user.click(repeatCheckbox);
    }

    // 반복 유형 선택 (매주)
    await user.click(screen.getByLabelText('반복 유형'));
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'weekly-option' }));

    // 종료일 설정 (3주간)
    await user.type(screen.getByLabelText('반복 종료일'), '2025-10-15');

    // 일정 3개 생성 확인
    expect(screen.getByText('3개의 반복 일정이 생성됩니다.')).toBeInTheDocument();

    // 미리보기에서 3개 날짜가 표시되는지 확인
    expect(screen.getByText(/날짜: 2025-10-01, 2025-10-08, 2025-10-15/)).toBeInTheDocument();

    // 일정 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 성공 메시지 확인
    expect(await screen.findByText('3개의 반복 일정이 추가되었습니다.')).toBeInTheDocument();

    // 캘린더에 반복 일정이 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    const repeatEvents = within(eventList).getAllByText('매주 팀 회의');
    expect(repeatEvents).toHaveLength(3);

    const repeatInfos = within(eventList).getAllByText('반복: 1주마다 (종료: 2025-10-15)');
    expect(repeatInfos).toHaveLength(3);

    // 반복 아이콘이 표시되는지 확인
    const repeatIcons = screen.getAllByTestId('RepeatIcon');
    expect(repeatIcons.length).toBeGreaterThan(0);
  });

  it('31일 매월 반복 일정 생성 시 31일이 없는 달은 건너뛴다', async () => {
    // 시스템 시간을 2025-01-31로 설정
    vi.setSystemTime(new Date('2025-01-31'));

    setupMockHandlerRepeatCreation();

    const { user } = setup(<App />);

    // 일정 추가 버튼 클릭
    await user.click(screen.getAllByText('일정 추가')[0]);

    // 일정 정보 입력 (31일)
    await user.type(screen.getByLabelText('제목'), '월말 정산');
    await user.type(screen.getByLabelText('날짜'), '2025-01-31');
    await user.type(screen.getByLabelText('시작 시간'), '16:00');
    await user.type(screen.getByLabelText('종료 시간'), '17:00');
    await user.type(screen.getByLabelText('설명'), '매월 말일 정산 작업');
    await user.type(screen.getByLabelText('위치'), '회계팀');

    // 카테고리 선택
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 설정 활성화
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    if (!(repeatCheckbox as HTMLInputElement).checked) {
      await user.click(repeatCheckbox);
    }

    // 반복 유형 선택 (매월)
    await user.click(screen.getByLabelText('반복 유형'));
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'monthly-option' }));

    // 종료일 설정 (4개월 후까지 - 2월은 31일이 없으므로 건너뛰어짐)
    await user.type(screen.getByLabelText('반복 종료일'), '2025-05-31');

    // 일정 생성 확인 (실제 생성되는 개수 확인)
    const generatedCountText = screen.getByText(/\d+개의 반복 일정이 생성됩니다./);
    expect(generatedCountText).toBeInTheDocument();

    // 일정 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 성공 메시지 확인 (실제 생성된 개수에 맞춤)
    const successMessage = await screen.findByText(/\d+개의 반복 일정이 추가되었습니다./);
    expect(successMessage).toBeInTheDocument();

    // 현재 달(1월 31일)에 첫 번째 일정 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('매월 말일 정산 작업')).toBeInTheDocument();

    // 3월로 이동 (2월은 31일이 없어서 건너뛰어짐)
    const nextButton = screen.getByLabelText('Next');
    await user.click(nextButton); // 2월로 이동
    await user.click(nextButton); // 3월로 이동

    // 3월 31일에도 일정이 있는지 확인
    expect(within(eventList).getByText('매월 말일 정산 작업')).toBeInTheDocument();

    // 반복 아이콘이 표시되는지 확인
    const repeatIcons = screen.getAllByTestId('RepeatIcon');
    expect(repeatIcons.length).toBeGreaterThan(0);
  });

  it('반복 간격을 2로 설정하여 격일 반복 일정을 생성한다', async () => {
    setupMockHandlerRepeatCreation();

    const { user } = setup(<App />);

    // 일정 추가 버튼 클릭
    await user.click(screen.getAllByText('일정 추가')[0]);

    // 일정 정보 입력
    await user.type(screen.getByLabelText('제목'), '격일 운동');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '06:00');
    await user.type(screen.getByLabelText('종료 시간'), '07:00');
    await user.type(screen.getByLabelText('설명'), '2일마다 운동하기');
    await user.type(screen.getByLabelText('위치'), '헬스장');

    // 카테고리 선택
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '개인-option' }));

    // 반복 설정 활성화
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    if (!(repeatCheckbox as HTMLInputElement).checked) {
      await user.click(repeatCheckbox);
    }

    // 반복 유형 선택 (매일)
    await user.click(screen.getByLabelText('반복 유형'));
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'daily-option' }));

    // 반복 간격을 2로 설정 (라벨이 아닌 type="number" 입력 필드로 찾기)
    const intervalInput = screen.getByRole('spinbutton');
    await user.clear(intervalInput);
    await user.type(intervalInput, '2');

    // 종료일 설정
    await user.type(screen.getByLabelText('반복 종료일'), '2025-10-07');

    // 일정 4개 생성 확인 (10/1, 10/3, 10/5, 10/7)
    expect(screen.getByText('4개의 반복 일정이 생성됩니다.')).toBeInTheDocument();

    // 미리보기에서 격일로 생성되는지 확인
    expect(
      screen.getByText(/날짜: 2025-10-01, 2025-10-03, 2025-10-05, 2025-10-07/)
    ).toBeInTheDocument();

    // 일정 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 성공 메시지 확인
    expect(await screen.findByText('4개의 반복 일정이 추가되었습니다.')).toBeInTheDocument();

    // 캘린더에 반복 일정이 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    const repeatEvents = within(eventList).getAllByText('2일마다 운동하기');
    expect(repeatEvents).toHaveLength(4);

    const repeatInfos = within(eventList).getAllByText('반복: 2일마다 (종료: 2025-10-07)');
    expect(repeatInfos).toHaveLength(4);

    // 반복 아이콘이 표시되는지 확인
    const repeatIcons = screen.getAllByTestId('RepeatIcon');
    expect(repeatIcons.length).toBeGreaterThan(0);
  });

  it('반복 일정을 수정하면 단일 일정으로 변경된다', async () => {
    setupMockHandlerRepeatUpdate();

    const { user } = setup(<App />);

    // 일정 로딩 대기
    await screen.findByText('일정 로딩 완료!');

    // 반복 일정 수정 버튼 클릭
    const editButton = screen.getByLabelText('Edit event');
    await user.click(editButton);

    // 반복 설정 비활성화 (반복 일정을 단일 일정으로 변경)
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    if ((repeatCheckbox as HTMLInputElement).checked) {
      await user.click(repeatCheckbox);
    }

    // 제목 수정
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 운동');

    // 일정 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 성공 메시지 확인
    expect(await screen.findByText('일정이 수정되었습니다.')).toBeInTheDocument();

    // 수정된 일정이 단일 일정으로 변경되었는지 확인
    const eventList = screen.getByTestId('event-list');
    // 수정 후 화면에 표시되는걸 확인
    await screen.findAllByText(/수정된/);
    expect(within(eventList).getByText('수정된 운동')).toBeInTheDocument();

    // 반복 정보가 사라졌는지 확인
    expect(within(eventList).queryByText(/반복:/)).not.toBeInTheDocument();
  });

  it('반복 일정을 삭제하면 해당 일정만 삭제된다', async () => {
    setupMockHandlerRepeatDeletion();

    const { user } = setup(<App />);

    // 일정 로딩 대기
    await screen.findByText('일정 로딩 완료!');

    // 처음에는 2개의 일정이 있음을 확인
    const eventList = screen.getByTestId('event-list');
    const events = within(eventList).getAllByText('매일 운동');
    expect(events).toHaveLength(2);

    // 첫 번째 일정 삭제 버튼 클릭
    const deleteButtons = screen.getAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);

    // 삭제 성공 메시지 확인
    expect(await screen.findByText('일정이 삭제되었습니다.')).toBeInTheDocument();

    // 한 개의 일정만 남았는지 확인 (해당 일정만 삭제됨)
    const remainingEvents = within(eventList).getAllByText('매일 운동');
    expect(remainingEvents).toHaveLength(1);
  });

  it('반복 종료일을 입력하지 않으면 기본값 2025-10-30까지 반복 일정이 생성된다', async () => {
    // 시스템 시간을 2025-10-25로 설정 (기본 종료일 5일 전)
    vi.setSystemTime(new Date('2025-10-25'));

    setupMockHandlerRepeatCreation();

    const { user } = setup(<App />);

    // 일정 추가 버튼 클릭
    await user.click(screen.getAllByText('일정 추가')[0]);

    // 일정 정보 입력
    await user.type(screen.getByLabelText('제목'), '기본 종료일 테스트');
    await user.type(screen.getByLabelText('날짜'), '2025-10-25');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');
    await user.type(screen.getByLabelText('설명'), '기본 종료일까지 반복');
    await user.type(screen.getByLabelText('위치'), '테스트 장소');

    // 카테고리 선택
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '개인-option' }));

    // 반복 설정 활성화
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    if (!(repeatCheckbox as HTMLInputElement).checked) {
      await user.click(repeatCheckbox);
    }

    // 반복 유형 선택 (매일)
    await user.click(screen.getByLabelText('반복 유형'));
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'daily-option' }));

    // 종료일을 입력하지 않음 (기본값 2025-10-30 사용)

    // 일정 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 성공 메시지 확인
    expect(await screen.findByText(/일정이 추가되었습니다./)).toBeInTheDocument();
    // 일정 생성 확인
    const eventList = screen.getByTestId('event-list');

    const events = within(eventList).getAllByText('기본 종료일 테스트');
    // 25~30일까지 6개 일정이 생성되는지 확인
    expect(events).toHaveLength(6);
  });

  it('매월 반복 일정을 생성할 수 있다', async () => {
    setupMockHandlerRepeatCreation();

    // 시스템 시간을 2024-01-15로 설정
    vi.setSystemTime(new Date('2024-01-15'));

    const { user } = setup(<App />);

    // 일정 추가 버튼 클릭
    await user.click(screen.getAllByText('일정 추가')[0]);

    // 일정 정보 입력
    await user.type(screen.getByLabelText('제목'), '매월 회의');
    await user.type(screen.getByLabelText('날짜'), '2024-01-15');
    await user.type(screen.getByLabelText('시작 시간'), '14:00');
    await user.type(screen.getByLabelText('종료 시간'), '15:00');
    await user.type(screen.getByLabelText('설명'), '매월 정기 회의');
    await user.type(screen.getByLabelText('위치'), '회의실 A');

    // 카테고리 선택
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 설정 활성화
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    if (!(repeatCheckbox as HTMLInputElement).checked) {
      await user.click(repeatCheckbox);
    }

    // 반복 유형 선택 (매월)
    await user.click(screen.getByLabelText('반복 유형'));
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'monthly-option' }));

    // 종료일 설정 (3개월간)
    await user.type(screen.getByLabelText('반복 종료일'), '2024-03-15');

    // 일정 3개 생성 확인
    expect(screen.getByText('3개의 반복 일정이 생성됩니다.')).toBeInTheDocument();

    // 미리보기에서 3개 날짜가 표시되는지 확인
    expect(screen.getByText(/날짜: 2024-01-15, 2024-02-15, 2024-03-15/)).toBeInTheDocument();

    // 일정 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 성공 메시지 확인
    expect(await screen.findByText('3개의 반복 일정이 추가되었습니다.')).toBeInTheDocument();

    // 캘린더에 반복 일정이 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    const monthlyEvents = within(eventList).getAllByText('매월 회의');
    expect(monthlyEvents).toHaveLength(1);

    // 반복 아이콘이 표시되는지 확인
    const repeatIcons = screen.getAllByTestId('RepeatIcon');
    expect(repeatIcons.length).toBeGreaterThan(0);
  });

  it('매년 반복 일정을 생성할 수 있다', async () => {
    setupMockHandlerRepeatCreation();

    // 시스템 시간을 2024-01-15로 설정
    vi.setSystemTime(new Date('2024-01-15'));

    const { user } = setup(<App />);

    // 일정 추가 버튼 클릭
    await user.click(screen.getAllByText('일정 추가')[0]);

    // 일정 정보 입력
    await user.type(screen.getByLabelText('제목'), '생일 기념일');
    await user.type(screen.getByLabelText('날짜'), '2024-01-15');
    await user.type(screen.getByLabelText('시작 시간'), '12:00');
    await user.type(screen.getByLabelText('종료 시간'), '13:00');
    await user.type(screen.getByLabelText('설명'), '매년 생일 축하');
    await user.type(screen.getByLabelText('위치'), '집');

    // 카테고리 선택
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '개인-option' }));

    // 반복 설정 활성화
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    if (!(repeatCheckbox as HTMLInputElement).checked) {
      await user.click(repeatCheckbox);
    }

    // 반복 유형 선택 (매년)
    await user.click(screen.getByLabelText('반복 유형'));
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'yearly-option' }));

    // 종료일 설정 (2년간)
    await user.type(screen.getByLabelText('반복 종료일'), '2026-01-15');

    // 일정 3개 생성 확인
    expect(screen.getByText('3개의 반복 일정이 생성됩니다.')).toBeInTheDocument();

    // 미리보기에서 3개 날짜가 표시되는지 확인
    expect(screen.getByText(/날짜: 2024-01-15, 2025-01-15, 2026-01-15/)).toBeInTheDocument();

    // 일정 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 성공 메시지 확인
    expect(await screen.findByText('3개의 반복 일정이 추가되었습니다.')).toBeInTheDocument();

    // 캘린더에 반복 일정이 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    const yearlyEvents = within(eventList).getAllByText('생일 기념일');
    expect(yearlyEvents).toHaveLength(1);

    // 반복 아이콘이 표시되는지 확인
    const repeatIcons = screen.getAllByTestId('RepeatIcon');
    expect(repeatIcons.length).toBeGreaterThan(0);
  });

  it('매월 반복 시 종료일을 설정하지 않으면 기본값까지 반복된다', async () => {
    setupMockHandlerRepeatCreation();

    // 시스템 시간을 2025-08-15로 설정 (기본 종료일 전)
    vi.setSystemTime(new Date('2025-08-15'));

    const { user } = setup(<App />);

    // 일정 추가 버튼 클릭
    await user.click(screen.getAllByText('일정 추가')[0]);

    // 일정 정보 입력
    await user.type(screen.getByLabelText('제목'), '매월 기본 종료일 테스트');
    await user.type(screen.getByLabelText('날짜'), '2025-08-15');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');

    // 카테고리 선택
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 설정 활성화
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    if (!(repeatCheckbox as HTMLInputElement).checked) {
      await user.click(repeatCheckbox);
    }

    // 반복 유형 선택 (매월)
    await user.click(screen.getByLabelText('반복 유형'));
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'monthly-option' }));

    // 종료일을 입력하지 않음 (기본값 2025-10-30 사용)

    // 일정 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 성공 메시지 확인
    expect(await screen.findByText(/일정이 추가되었습니다./)).toBeInTheDocument();

    // 일정 생성 확인 (8월, 9월, 10월 총 3개)
    const eventList = screen.getByTestId('event-list');
    const events = within(eventList).getAllByText('매월 기본 종료일 테스트');
    expect(events).toHaveLength(1);
  });
});
