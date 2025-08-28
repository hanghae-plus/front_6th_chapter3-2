import { act, renderHook } from '@testing-library/react';

import { useEventForm } from '../../hooks/useEventForm';
import { RepeatType } from '../../types';

describe('useEventForm - 반복 기능', () => {
  it('반복 체크박스를 선택하면 isRepeating이 true가 된다', () => {
    const { result } = renderHook(() => useEventForm());

    expect(result.current.isRepeating).toBe(true);

    act(() => {
      result.current.setIsRepeating((prev) => !prev);
    });

    expect(result.current.isRepeating).toBe(false);
  });

  it('반복 타입을 변경하면 repeatType이 업데이트된다', () => {
    const { result } = renderHook(() => useEventForm());

    expect(result.current.repeatType).toBe('none');

    act(() => {
      result.current.setRepeatType('weekly');
    });

    expect(result.current.repeatType).toBe('weekly');
  });

  it('반복 간격을 변경하면 repeatInterval이 업데이트된다', () => {
    const { result } = renderHook(() => useEventForm());

    expect(result.current.repeatInterval).toBe(1);

    act(() => {
      result.current.setRepeatInterval(10);
    });

    expect(result.current.repeatInterval).toBe(10);
  });

  it('반복 종료일을 변경하면 repeatEndDate가 업데이트된다', () => {
    const { result } = renderHook(() => useEventForm());

    expect(result.current.repeatEndDate).toBe('');

    act(() => {
      result.current.setRepeatEndDate('2025-08-31');
    });

    expect(result.current.repeatEndDate).toBe('2025-08-31');
  });

  it('editEvent 호출 시 반복 정보가 올바르게 설정된다', () => {
    const basicEventMock = {
      id: '1',
      title: '회의',
      date: '2024-08-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      notificationTime: 10,
      repeat: {
        type: 'none' as RepeatType,
        interval: 1,
        endDate: '',
      },
    };

    const dailyRepeatEventMock = {
      ...basicEventMock,
      repeat: {
        type: 'daily' as RepeatType,
        interval: 1,
        endDate: '2024-12-31',
      },
    };

    const { result } = renderHook(() => useEventForm(basicEventMock));

    act(() => {
      result.current.editEvent(dailyRepeatEventMock);
    });

    expect(result.current.isRepeating).toBe(true);
    expect(result.current.repeatType).toBe('daily');
    expect(result.current.repeatInterval).toBe(1);
    expect(result.current.repeatEndDate).toBe('2024-12-31');
  });
});
