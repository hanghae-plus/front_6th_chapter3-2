import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';
import {
  isRepeatingEvent,
  shouldShowRepeatingIcon,
  getEventBackgroundColor,
  getEventBorderStyle,
} from '../../utils/visualUtils.ts';

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

describe('반복 일정 단일 수정', () => {
  it('반복 일정을 수정하면 단일 일정으로 변경됩니다', async () => {
    // 반복 일정 이벤트 데이터 준비
    const repeatingEvent: Event = {
      id: '1',
      title: '매주 팀 미팅',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '주간 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 }, // 반복 일정
      notificationTime: 10,
    };

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [repeatingEvent],
        });
      })
    );

    // 수정 모드로 훅 초기화
    const { result } = renderHook(() => useEventOperations(true));

    await act(() => Promise.resolve(null));

    // 초기 상태: 반복 일정인지 확인
    expect(result.current.events[0]).toEqual(repeatingEvent);
    expect(isRepeatingEvent(result.current.events[0])).toBe(true);

    // 단일 일정으로 수정 (repeat.type을 'none'으로 변경)
    const modifiedEvent: Event = {
      ...repeatingEvent,
      repeat: { type: 'none', interval: 0 },
    };

    // Mock 서버가 수정된 이벤트를 반환하도록 설정
    server.use(
      http.put('/api/events/1', () => {
        return HttpResponse.json({ event: modifiedEvent });
      }),
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [modifiedEvent],
        });
      })
    );

    await act(async () => {
      await result.current.saveEvent(modifiedEvent);
    });

    // 검증: 수정 후 단일 일정으로 변경되었는지 확인
    expect(result.current.events[0].repeat.type).toBe('none');
    expect(isRepeatingEvent(result.current.events[0])).toBe(false);
  });

  it('반복 일정 아이콘도 사라집니다', async () => {
    // 반복 일정에서 단일 일정으로 변경된 이벤트 준비
    const originalRepeatingEvent: Event = {
      id: '1',
      title: '매주 팀 미팅',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '주간 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 10,
    };

    const modifiedToSingleEvent: Event = {
      ...originalRepeatingEvent,
      repeat: { type: 'none', interval: 0 },
    };

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [originalRepeatingEvent],
        });
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    await act(() => Promise.resolve(null));

    // 수정 전: 반복 일정 시각적 요소들 확인
    const beforeEvent = result.current.events[0];
    expect(shouldShowRepeatingIcon(beforeEvent)).toBe(true);
    expect(getEventBackgroundColor(beforeEvent, false)).toBe('#e3f2fd');
    expect(getEventBorderStyle(beforeEvent)).toBe('4px solid #1976d2');

    // 단일 일정으로 수정
    server.use(
      http.put('/api/events/1', () => {
        return HttpResponse.json({ event: modifiedToSingleEvent });
      }),
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [modifiedToSingleEvent],
        });
      })
    );

    await act(async () => {
      await result.current.saveEvent(modifiedToSingleEvent);
    });

    // 수정 후: 일반 일정 시각적 요소들로 변경 확인
    const afterEvent = result.current.events[0];
    expect(shouldShowRepeatingIcon(afterEvent)).toBe(false); // 아이콘 사라짐
    expect(getEventBackgroundColor(afterEvent, false)).toBe('#f5f5f5'); // 회색 배경
    expect(getEventBorderStyle(afterEvent)).toBe('none'); // 테두리 없음
  });
});

describe('반복 일정 단일 삭제', () => {
  it('반복 일정을 삭제하면 완전히 제거됩니다', async () => {
    // 반복 일정 이벤트 데이터 준비
    const repeatingEvent: Event = {
      id: '1',
      title: '매주 스크럼 미팅',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '매주 진행되는 스크럼 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 10,
    };

    const regularEvent: Event = {
      id: '2',
      title: '일반 미팅',
      date: '2025-10-16',
      startTime: '14:00',
      endTime: '15:00',
      description: '일회성 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [repeatingEvent, regularEvent],
        });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    // 초기 상태: 2개의 이벤트가 있고, 첫 번째가 반복 일정인지 확인
    expect(result.current.events).toHaveLength(2);
    expect(result.current.events[0]).toEqual(repeatingEvent);
    expect(isRepeatingEvent(result.current.events[0])).toBe(true);

    // 반복 일정 삭제를 위한 Mock 서버 설정
    server.use(
      http.delete('/api/events/1', () => {
        return new HttpResponse(null, { status: 200 });
      }),
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [regularEvent], // 반복 일정이 삭제되고 일반 일정만 남음
        });
      })
    );

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    // 검증: 반복 일정이 삭제되고 일반 일정만 남아있는지 확인
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0]).toEqual(regularEvent);
    expect(isRepeatingEvent(result.current.events[0])).toBe(false);
  });

  it('반복 일정 삭제 후 성공 메시지가 표시됩니다', async () => {
    const repeatingEvent: Event = {
      id: '1',
      title: '매일 스탠드업',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:00',
      description: '매일 진행되는 스탠드업 미팅',
      location: '온라인',
      category: '업무',
      repeat: { type: 'daily', interval: 1 },
      notificationTime: 5,
    };

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [repeatingEvent],
        });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    // 초기 상태 확인
    expect(result.current.events).toHaveLength(1);
    expect(shouldShowRepeatingIcon(result.current.events[0])).toBe(true);

    server.use(
      http.delete('/api/events/1', () => {
        return new HttpResponse(null, { status: 200 });
      }),
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [], // 모든 이벤트 삭제
        });
      })
    );

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    // 검증: 삭제 완료 및 성공 메시지 확인
    expect(result.current.events).toHaveLength(0);
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', { variant: 'info' });
  });

  it('반복 일정 삭제 실패 시 에러 메시지가 표시됩니다', async () => {
    const repeatingEvent: Event = {
      id: '1',
      title: '매월 회의',
      date: '2025-10-15',
      startTime: '15:00',
      endTime: '16:00',
      description: '매월 진행되는 정기 회의',
      location: '대회의실',
      category: '업무',
      repeat: { type: 'monthly', interval: 1 },
      notificationTime: 60,
    };

    // Mock 서버 설정
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [repeatingEvent],
        });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    // 초기 상태 확인
    expect(result.current.events).toHaveLength(1);
    expect(getEventBackgroundColor(result.current.events[0], false)).toBe('#e3f2fd');

    // 삭제 실패 Mock 설정 (서버 오류)
    server.use(
      http.delete('/api/events/1', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    // 검증: 삭제 실패 시 이벤트는 그대로 남아있고 에러 메시지 표시
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0]).toEqual(repeatingEvent);
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
  });
});
