import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
  setupMockHandlerRepeatCreation,
  setupMockHandlerRepeatUpdate,
  setupMockHandlerRepeatDelete,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';

const enqueueSnackbarFn = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  expect(result.current.events).toEqual([
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
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation(); // ? Med: 이걸 왜 써야하는지 물어보자

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  const newEvent: Event = {
    id: '1',
    title: '새 회의',
    date: '2025-10-16',
    startTime: '11:00',
    endTime: '12:00',
    description: '새로운 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toEqual([{ ...newEvent, id: '1' }]);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  const updatedEvent: Event = {
    id: '1',
    date: '2025-10-15',
    startTime: '09:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
    title: '수정된 회의',
    endTime: '11:00',
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  expect(result.current.events[0]).toEqual(updatedEvent);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  await act(() => Promise.resolve(null));

  expect(result.current.events).toEqual([]);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });

  server.resetHandlers();
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const { result } = renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  const nonExistentEvent: Event = {
    id: '999', // 존재하지 않는 ID
    title: '존재하지 않는 이벤트',
    date: '2025-07-20',
    startTime: '09:00',
    endTime: '10:00',
    description: '이 이벤트는 존재하지 않습니다',
    location: '어딘가',
    category: '기타',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(nonExistentEvent);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });

  expect(result.current.events).toHaveLength(1);
});

// ------------------------- 반복 기능 테스트 -------------------------

it('31일에 매월 반복을 선택하면 매월 31일에만 생성된다', async () => {
  setupMockHandlerRepeatCreation();

  const { result } = renderHook(() => useEventOperations(false));

  // 훅 내부의 비동기 로직 대기
  await act(() => Promise.resolve(null));

  const newEvent: EventForm = {
    title: '정기 회의',
    date: '2025-08-31',
    startTime: '11:00',
    endTime: '12:00',
    description: '정기 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'monthly', interval: 1, endDate: '2026-01-31' },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEventList(newEvent);
  });

  // 9월 말일(30일)에는 일정이 생성되지 않음
  expect(result.current.events).not.toContainEqual(
    expect.objectContaining({
      title: '정기 회의',
      date: '2025-09-30',
    })
  );

  // 10월 31일에는 일정이 생성됨
  expect(result.current.events).toContainEqual(
    expect.objectContaining({
      title: '정기 회의',
      date: '2025-10-31',
    })
  );
});

it('윤년 2월 29일에 매년 반복을 선택하면 2월 29일에만 생성된다', async () => {
  setupMockHandlerRepeatCreation();

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  const newEvent: EventForm = {
    title: '윤년 회의',
    date: '2024-02-29',
    startTime: '11:00',
    endTime: '12:00',
    description: '윤년 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'yearly', interval: 1, endDate: '2028-03-01' },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEventList(newEvent);
  });

  // 2025년 2월 28일에는 일정이 생성되지 않음
  expect(result.current.events).not.toContainEqual(
    expect.objectContaining({
      title: '윤년 회의',
      date: '2025-02-28',
    })
  );

  // 2028년 윤년 2월 29일에는 일정 생성됨
  expect(result.current.events).toContainEqual(
    expect.objectContaining({
      title: '윤년 회의',
      date: '2028-02-29',
    })
  );
});

it('반복 종료일이 없으면 최대 2025-10-30일까지 일정이 생성된다', async () => {
  setupMockHandlerRepeatCreation();
  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  // repeat endDate를 지정하지 않음
  const newEvent: EventForm = {
    title: '정기 회의',
    date: '2025-10-01',
    startTime: '11:00',
    endTime: '12:00',
    description: '정기 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'daily', interval: 1 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEventList(newEvent);
  });

  expect(result.current.events).toContainEqual(
    expect.objectContaining({
      title: '정기 회의',
      date: '2025-10-01',
    })
  );
  expect(result.current.events).toContainEqual(
    expect.objectContaining({
      title: '정기 회의',
      date: '2025-10-02',
    })
  );
  expect(result.current.events).toContainEqual(
    expect.objectContaining({
      title: '정기 회의',
      date: '2025-10-15',
    })
  );
  expect(result.current.events).toContainEqual(
    expect.objectContaining({
      title: '정기 회의',
      date: '2025-10-30',
    })
  );
});

it('반복 시작일이 2025-10-30 이후이고 반복 종료일이 없으면 일정이 하나만 생성된다', async () => {
  setupMockHandlerRepeatCreation();
  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  // repeat endDate를 지정하지 않음
  // endDate 미지정 시 최대 날짜는 2025-10-30
  const newEvent: EventForm = {
    title: '정기 회의',
    date: '2025-11-01',
    startTime: '11:00',
    endTime: '12:00',
    description: '정기 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'daily', interval: 1 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEventList(newEvent);
  });

  expect(result.current.events.length).toBe(1);
  expect(result.current.events).toContainEqual(
    expect.objectContaining({
      title: '정기 회의',
      date: '2025-11-01',
    })
  );
});

it('반복 종료 조건으로 특정 날짜를 지정할 수 있다', async () => {
  setupMockHandlerRepeatCreation();

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  const newEvent: EventForm = {
    title: '정기 회의',
    date: '2025-08-31',
    startTime: '11:00',
    endTime: '12:00',
    description: '정기 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-09-30' },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEventList(newEvent);
  });

  expect(result.current.events).toContainEqual(
    expect.objectContaining({
      title: '정기 회의',
      repeat: expect.objectContaining({
        endDate: '2025-09-30',
      }),
    })
  );

  // 반복되는 주 일정이어도 endDate 이후는 생성되지 않음
  expect(result.current.events).not.toContainEqual(
    expect.objectContaining({
      title: '정기 회의',
      date: '2025-10-05',
    })
  );
});

it('반복 종료일이 2025-10-30이면, 그 이후 일정은 생성되지 않는다', async () => {
  setupMockHandlerRepeatCreation();

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  const newEvent: EventForm = {
    title: '정기 회의',
    date: '2025-09-31',
    startTime: '11:00',
    endTime: '12:00',
    description: '정기 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'daily', interval: 1, endDate: '2025-10-30' },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEventList(newEvent);
  });

  // 10월 30일까지 매일 반복 일정이 생성됨
  expect(result.current.events).toContainEqual(
    expect.objectContaining({
      title: '정기 회의',
      date: '2025-10-30',
    })
  );

  // 10월 31일에는 매일 반복 일정이 생성되지 않음
  expect(result.current.events).not.toContainEqual(
    expect.objectContaining({
      title: '정기 회의',
      date: '2025-10-31',
    })
  );
});

it('반복 일정을 수정하면 해당 일정은 단일 일정으로 변경된다', async () => {
  setupMockHandlerRepeatUpdate();

  const { result } = renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  // 사용자가 반복 관련 값을 수정하지 않아도 단일 일정으로 변경 - 훅 내에서 처리 필요
  const updatedEvent: Event = {
    id: '2',
    title: '정기 회의',
    date: '2025-10-16',
    startTime: '11:00',
    endTime: '12:00',
    description: '정기 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  // 훅 내에서 repeat 값 초기화
  expect(result.current.events[1]).toEqual({
    id: '2',
    title: '정기 회의',
    date: '2025-10-16',
    startTime: '11:00',
    endTime: '12:00',
    description: '정기 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  });
});

it('반복 일정을 삭제하면 해당 일정만 삭제된다', async () => {
  setupMockHandlerRepeatDelete();

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  await act(() => Promise.resolve(null));

  expect(result.current.events).toEqual([
    {
      id: '2',
      title: '정기 회의',
      date: '2025-10-16',
      startTime: '11:00',
      endTime: '12:00',
      description: '정기 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
      notificationTime: 10,
    },
  ]);
});
