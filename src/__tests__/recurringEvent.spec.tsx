import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import {
  setupMockHandlerRecurryingCreation,
  setupMockHandlerRecurryingDeletion,
  setupMockHandlerRecurryingUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

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

const saveSchedule = async (user: UserEvent, form: Omit<Event, 'id' | 'notificationTime'>) => {
  const { title, date, startTime, endTime, location, description, category, repeat } = form;

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

  await user.click(screen.getByLabelText('반복 유형'));
  await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${repeat.type}-option` }));

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 일정 기능', () => {
  describe('반복 일정 생성', () => {
    it('매일 반복 일정을 생성할 수 있다', async () => {
      vi.setSystemTime(new Date('2025-08-01')); // 테스트 기준 날짜
      setupMockHandlerRecurryingCreation(); // 반복 일정 생성용 모킹 적용
      // Given: 사용자가 매일 반복 유형을 선택하고 일정 정보를 입력한다
      // When: 반복 일정 생성 버튼을 클릭한다
      const { user } = setup(<App />);

      await saveSchedule(user, {
        title: '새 회의',
        date: '2025-08-15', // 8월 기준으로 맞춤
        startTime: '14:00',
        endTime: '15:00',
        description: '프로젝트 진행 상황 논의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
      });

      // Then: 지정된 기간 동안 매일 반복되는 일정이 생성되고 캘린더에 반복 아이콘과 함께 표시된다
      const eventList = within(screen.getByTestId('month-view'));

      // 8월 15일부터 8월 31일까지 = 17개
      expect(eventList.getAllByTestId('RepeatIcon')).toHaveLength(17);
    });

    it('매주 반복 일정을 생성할 수 있다', async () => {
      vi.setSystemTime(new Date('2025-08-01')); // 테스트 기준 날짜
      setupMockHandlerRecurryingCreation();
      // Given: 사용자가 매주 반복 유형을 선택하고 일정 정보를 입력한다
      // When: 반복 일정 생성 버튼을 클릭한다
      const { user } = setup(<App />);

      await saveSchedule(user, {
        title: '새 회의',
        date: '2025-08-15', // 8월 기준
        startTime: '14:00',
        endTime: '15:00',
        description: '프로젝트 진행 상황 논의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
      });

      // Then: 지정된 기간 동안 매주 반복되는 일정이 생성
      const eventList = within(screen.getByTestId('month-view'));
      // 8월 15, 22, 29 = 3개
      expect(eventList.getAllByTestId('RepeatIcon')).toHaveLength(3);
    });

    it('매월 반복 일정을 생성할 수 있다', async () => {
      vi.setSystemTime(new Date('2025-08-01')); // 테스트 기준 날짜
      setupMockHandlerRecurryingCreation();
      // Given: 사용자가 매월 반복 유형을 선택하고 일정 정보를 입력한다
      // When: 반복 일정 생성 버튼을 클릭한다
      const { user } = setup(<App />);

      await saveSchedule(user, {
        title: '새 회의',
        date: '2025-08-15', // 8월 기준
        startTime: '14:00',
        endTime: '15:00',
        description: '프로젝트 진행 상황 논의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'monthly', interval: 1 },
      });

      // Then: 지정된 기간 동안 매월 반복되는 일정이 생성
      const eventList = within(screen.getByTestId('month-view'));
      expect(eventList.getAllByTestId('RepeatIcon')).toHaveLength(1);
    });

    it('매년 반복 일정을 생성할 수 있다', async () => {
      vi.setSystemTime(new Date('2025-08-01')); // 테스트 기준 날짜
      setupMockHandlerRecurryingCreation();
      // Given: 사용자가 매년 반복 유형을 선택하고 일정 정보를 입력한다
      // When: 반복 일정 생성 버튼을 클릭한다
      const { user } = setup(<App />);

      await saveSchedule(user, {
        title: '매년 총회',
        date: '2024-08-15', // 윤년 고려
        startTime: '10:00',
        endTime: '11:00',
        description: '정기 총회',
        location: '대회의실',
        category: '업무',
        repeat: { type: 'yearly', interval: 1 },
      });

      // Then: 지정된 기간 동안 매년 반복되는 일정이 생성
      const eventList = within(screen.getByTestId('month-view'));
      expect(eventList.getAllByTestId('RepeatIcon')).toHaveLength(1);
    });

    it('31일에 매월 반복 일정을 선택하면 31일이 있는 달에만 생성된다', async () => {
      vi.setSystemTime(new Date('2025-08-01')); // 테스트 기준 날짜
      setupMockHandlerRecurryingCreation();

      // Given: 사용자가 31일에 매월 반복 유형을 선택하고 일정 정보를 입력한다
      // When: 반복 일정 생성 버튼을 클릭한다
      const { user } = setup(<App />);

      await saveSchedule(user, {
        title: '31일 결산',
        date: '2025-08-31',
        startTime: '18:00',
        endTime: '19:00',
        description: '결산 회의',
        location: '사무실',
        category: '업무',
        repeat: { type: 'monthly', interval: 1 },
      });

      // Then: 31일이 있는 달에만 반복 일정이 생성
      let eventList = within(screen.getByTestId('month-view'));
      expect(eventList.queryByTestId('RepeatIcon')).toBeInTheDocument();

      const nextButton = screen.getByRole('button', { name: /next/i });

      await user.click(nextButton); // 9월 → 30일까지만 있음
      eventList = within(screen.getByTestId('month-view'));
      expect(eventList.queryByTestId('RepeatIcon')).not.toBeInTheDocument();

      await user.click(nextButton); // 10월 → 31일 있음
      eventList = within(screen.getByTestId('month-view'));
      expect(eventList.queryByTestId('RepeatIcon')).toBeInTheDocument();
    });

    it('윤년 2월 29일에 매년 반복 일정을 선택하면 윤년에만 생성된다', async () => {
      setupMockHandlerRecurryingCreation();
      vi.setSystemTime(new Date('2024-02-01')); // 테스트 기준 날짜
      // Given: 사용자가 윤년 2월 29일에 매년 반복 유형을 선택하고 일정 정보를 입력한다
      // When: 반복 일정 생성 버튼을 클릭한다
      const { user } = setup(<App />);

      await saveSchedule(user, {
        title: '윤년 파티',
        date: '2024-02-29',
        startTime: '20:00',
        endTime: '22:00',
        description: '윤년을 기념하는 파티',
        location: '호텔',
        category: '업무',
        repeat: { type: 'yearly', interval: 1 },
      });

      // Then: 윤년 2월 29일에만 반복 일정이 생성되고, 평년에는 생성되지 않는다
      let eventList = within(screen.getByTestId('month-view'));
      expect(eventList.getAllByTestId('RepeatIcon')).toHaveLength(1);

      for (let i = 0; i < 12; i++) {
        await user.click(screen.getByRole('button', { name: /next/i }));
      }
      eventList = within(screen.getByTestId('month-view'));
      expect(eventList.queryByTestId('RepeatIcon')).not.toBeInTheDocument();
    });

    it('반복 종료일을 2025-08-31로 설정하면 해당 날짜까지만 반복된다', async () => {
      setupMockHandlerRecurryingCreation();
      vi.setSystemTime(new Date('2025-03-01')); // 테스트 기준 날짜

      // Given: 사용자가 반복 일정을 생성하고 종료일을 2025-08-31로 설정한다
      // When: 반복 일정 생성 버튼을 클릭한다
      const { user } = setup(<App />);

      const newEvent = {
        title: '파티',
        date: '2025-03-25',
        startTime: '20:00',
        endTime: '22:00',
        description: '파티',
        location: '호텔',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-08-31' },
      };

      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText('제목'), newEvent.title);
      await user.type(screen.getByLabelText('날짜'), newEvent.date);
      await user.type(screen.getByLabelText('시작 시간'), newEvent.startTime);
      await user.type(screen.getByLabelText('종료 시간'), newEvent.endTime);
      await user.type(screen.getByLabelText('설명'), newEvent.description);
      await user.type(screen.getByLabelText('위치'), newEvent.location);
      await user.click(screen.getByLabelText('카테고리'));
      await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: `${newEvent.category}-option` }));

      await user.click(screen.getByLabelText('반복 유형'));
      await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: `${newEvent.repeat.type}-option` }));

      await user.type(screen.getByLabelText('반복 종료일'), newEvent.repeat.endDate);
      await user.click(screen.getByTestId('event-submit-button'));

      // Then: 설정한 종료일까지만 반복 일정이 생성된다
      for (let i = 0; i < 6; i++) {
        const eventList = within(screen.getByTestId('month-view'));
        expect(eventList.queryByTestId('RepeatIcon')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /next/i }));
      }

      const eventList = within(screen.getByTestId('month-view'));
      expect(eventList.queryByTestId('RepeatIcon')).not.toBeInTheDocument();
    });

    it('반복 일정 생성 즉시 캘린더와 리스트뷰에 모든 반복 일정이 표시된다', async () => {
      vi.setSystemTime(new Date('2025-08-01')); // 테스트 기준 날짜

      setupMockHandlerRecurryingCreation();
      // Given: 사용자가 반복 일정 정보를 입력한다
      // When: 반복 일정 생성 버튼을 클릭한다
      const { user } = setup(<App />);

      await saveSchedule(user, {
        title: '파티',
        date: '2025-08-25', // 8월 기준
        startTime: '20:00',
        endTime: '22:00',
        description: '파티',
        location: '호텔',
        category: '업무',
        repeat: { type: 'monthly', interval: 1 },
      });

      // Then: 반복 일정이 캘린더뷰와 리스트뷰에 즉시 표시된다
      const calendarViewEventList = within(screen.getByTestId('month-view'));
      expect(calendarViewEventList.getByTestId('RepeatIcon')).toBeInTheDocument();

      const listViewEventList = within(screen.getByTestId('event-list'));
      expect(listViewEventList.getByTestId('RepeatIcon')).toBeInTheDocument();
    });
  });

  describe('반복 일정 표시', () => {
    it.skip('반복 일정은 캘린더에 반복 아이콘으로 구분되어 표시된다', () => {
      // Given: 반복 일정이 생성되어 있다
      // When: 캘린더를 조회한다
      // Then: 반복 일정은 일반 일정과 구분되는 반복 아이콘과 함께 표시된다
    });

    it.skip('반복 일정은 리스트뷰에서도 반복 아이콘으로 구분되어 표시된다', () => {
      // Given: 반복 일정이 생성되어 있다
      // When: 리스트뷰를 조회한다
      // Then: 반복 일정은 일반 일정과 구분되는 반복 아이콘과 함께 표시된다
    });
  });

  describe('반복 일정 단일 수정', () => {
    it('반복 일정 중 하나를 수정하면 해당 일정만 단일 일정으로 변경된다', async () => {
      vi.setSystemTime(new Date('2025-10-01')); // 테스트 기준 날짜
      // Given: 기존 반복 일정이 여러 개 생성되어 있다
      setupMockHandlerRecurryingUpdating();
      const { user } = setup(<App />);
      const eventList = within(screen.getByTestId('event-list'));
      const editButton = await eventList.findAllByTestId('EditIcon');
      await user.click(editButton[0]);
      // When: 첫 번째 이벤트 클릭 후 제목 수정

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 회의');
      await user.click(screen.getByTestId('event-submit-button'));

      // Then: 수정된 일정만 단일 일정으로 변경되고 반복 아이콘 사라짐
      expect(eventList.getAllByTestId('RepeatIcon')).toHaveLength(2);
    });

    it('반복 일정 중 하나를 수정해도 다른 반복 일정들은 영향받지 않는다', async () => {
      vi.setSystemTime(new Date('2025-10-01')); // 테스트 기준 날짜
      // Given: 기존 반복 일정이 여러 개 생성되어 있다
      setupMockHandlerRecurryingUpdating();
      // When: 첫 번째 이벤트 제목만 수정
      const { user } = setup(<App />);
      const eventList = within(screen.getByTestId('event-list'));
      const editButton = await eventList.findAllByTestId('EditIcon');
      await user.click(editButton[0]);

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 회의');
      await user.click(screen.getByTestId('event-submit-button'));

      // Then: 다른 반복 일정들은 그대로 유지되고 반복 아이콘도 유지됨
      expect(eventList.getAllByTestId('RepeatIcon')).toHaveLength(2);
    });

    it('단일 수정된 일정은 캘린더뷰와 리스트뷰에 즉시 반영된다', async () => {
      vi.setSystemTime(new Date('2025-10-01')); // 테스트 기준 날짜
      // Given: 반복 일정 중 하나를 수정한다
      setupMockHandlerRecurryingUpdating();
      const { user } = setup(<App />);
      const eventList = within(screen.getByTestId('event-list'));
      const editButton = await eventList.findAllByTestId('EditIcon');
      await user.click(editButton[0]);

      // When: 이벤트 제목 수정 후 제출
      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '즉시 반영 회의');
      await user.click(screen.getByTestId('event-submit-button'));

      // Then: 수정된 일정이 캘린더뷰와 리스트뷰에 즉시 반영됨
      const calendarView = within(screen.getByTestId('month-view'));
      expect(await calendarView.findByText('즉시 반영 회의')).toBeInTheDocument();

      const listView = within(screen.getByTestId('event-list'));
      expect(await listView.findByText('즉시 반영 회의')).toBeInTheDocument();
    });
  });

  describe('반복 일정 단일 삭제', () => {
    it('반복 일정 중 하나를 삭제하면 해당 일정만 삭제된다', async () => {
      vi.setSystemTime(new Date('2025-10-01')); // 테스트 기준 날짜

      // Given: 서로 다른 날짜의 반복 일정 2개가 존재
      setupMockHandlerRecurryingDeletion();
      const { user } = setup(<App />);

      // 초기 상태: 두 날짜의 이벤트가 모두 존재함을 확인
      expect(await screen.findByText('2025-10-15')).toBeInTheDocument(); // 첫 번째 일정
      expect(await screen.findByText('2025-10-22')).toBeInTheDocument(); // 두 번째 일정

      // When: 첫 번째 이벤트 삭제
      const eventList = within(screen.getByTestId('event-list'));
      const deleteButtons = await eventList.findAllByTestId('DeleteIcon');
      await user.click(deleteButtons[0]);

      // Then: 첫 번째 일정(2025-10-15)만 삭제되고, 두 번째 일정(2025-10-22)은 남아있음
      await waitFor(() => {
        expect(eventList.queryByText('2025-10-15')).not.toBeInTheDocument(); // 삭제됨
        expect(eventList.getByText('2025-10-22')).toBeInTheDocument(); // 남아있음
      });

      // 전체 이벤트 개수도 2개에서 1개로 감소
      expect(eventList.queryAllByText('삭제할 이벤트')).toHaveLength(1);
    });

    it('반복 일정 중 하나를 삭제해도 다른 반복 일정들은 영향받지 않는다', async () => {
      vi.setSystemTime(new Date('2025-10-01')); // 테스트 기준 날짜

      // Given: 기존 이벤트 2개가 존재
      setupMockHandlerRecurryingDeletion();
      const { user } = setup(<App />);

      const eventList = within(screen.getByTestId('event-list'));

      // 초기 상태: 2개의 반복 일정이 존재함을 확인
      expect(await eventList.findAllByText('삭제할 이벤트')).toHaveLength(2);
      expect(await eventList.findAllByTestId('RepeatIcon')).toHaveLength(2);

      // When: 첫 번째 이벤트 삭제
      const deleteButtons = await eventList.findAllByTestId('DeleteIcon');
      await user.click(deleteButtons[0]);

      // Then: 하나만 삭제되고 나머지 반복 일정은 그대로 존재
      await waitFor(() => {
        expect(eventList.queryAllByText('삭제할 이벤트')).toHaveLength(1);
        expect(eventList.queryAllByTestId('RepeatIcon')).toHaveLength(1);
      });
    });

    it('단일 삭제된 일정은 캘린더뷰와 리스트뷰에 즉시 반영된다', async () => {
      vi.setSystemTime(new Date('2025-10-01')); // 테스트 기준 날짜
      // Given: 삭제할 이벤트 존재
      setupMockHandlerRecurryingDeletion();
      const { user } = setup(<App />);

      // When: 삭제 버튼 클릭
      const eventList = within(screen.getByTestId('event-list'));
      const deleteButton = await eventList.findAllByTestId('DeleteIcon');
      await user.click(deleteButton[0]);

      // Then: 캘린더뷰와 리스트뷰에서 즉시 삭제 반영
      const calendarView = within(screen.getByTestId('month-view'));
      const listView = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(listView.queryAllByText('삭제할 이벤트')).toHaveLength(1);
      });

      // 캘린더뷰에서도 1개만 남아있는지 확인
      await waitFor(() => {
        expect(calendarView.queryAllByText('삭제할 이벤트')).toHaveLength(1);
      });
    });
  });
});
