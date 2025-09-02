import { renderHook } from '@testing-library/react';

import { useRepeatEvent } from '../../hooks/useRepeatEvent';
import { EventForm } from '../../types';

describe('useRepeatEvent', () => {
  const mockEventForm: EventForm = {
    title: '테스트 일정',
    date: '2024-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명',
    location: '테스트 장소',
    category: '업무',
    repeat: {
      type: 'daily',
      interval: 1,
      endDate: '2024-01-03',
    },
    notificationTime: 10,
  };

  // 기본 반복 일정 생성
  it('매일 반복 일정을 3일간 생성한다', () => {
    const { result } = renderHook(() => useRepeatEvent(mockEventForm));

    expect(result.current.repeatedEvents).toHaveLength(3);
    expect(result.current.repeatedEvents[0].date).toBe('2024-01-01');
    expect(result.current.repeatedEvents[1].date).toBe('2024-01-02');
    expect(result.current.repeatedEvents[2].date).toBe('2024-01-03');

    // 모든 이벤트가 같은 시간과 내용을 가져야 함
    result.current.repeatedEvents.forEach((event) => {
      expect(event.title).toBe('테스트 일정');
      expect(event.startTime).toBe('09:00');
      expect(event.endTime).toBe('10:00');
      expect(event.repeat.type).toBe('daily');
    });
  });
  it('매주 반복 일정을 4주간 생성한다', () => {
    const weeklyEventForm: EventForm = {
      ...mockEventForm,
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-01-22',
      },
    };

    const { result } = renderHook(() => useRepeatEvent(weeklyEventForm));

    expect(result.current.repeatedEvents).toHaveLength(4);
    expect(result.current.repeatedEvents[0].date).toBe('2024-01-01');
    expect(result.current.repeatedEvents[1].date).toBe('2024-01-08');
    expect(result.current.repeatedEvents[2].date).toBe('2024-01-15');
    expect(result.current.repeatedEvents[3].date).toBe('2024-01-22');
  });

  it('매월 반복 일정을 6개월간 생성한다', () => {
    const monthlyEventForm: EventForm = {
      ...mockEventForm,
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-06-01',
      },
    };

    const { result } = renderHook(() => useRepeatEvent(monthlyEventForm));

    expect(result.current.repeatedEvents).toHaveLength(6);
    expect(result.current.repeatedEvents[0].date).toBe('2024-01-01');
    expect(result.current.repeatedEvents[1].date).toBe('2024-02-01');
    expect(result.current.repeatedEvents[2].date).toBe('2024-03-01');
    expect(result.current.repeatedEvents[5].date).toBe('2024-06-01');
  });

  it('매년 반복 일정을 3년간 생성한다', () => {
    const yearlyEventForm: EventForm = {
      ...mockEventForm,
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2026-01-01',
      },
    };

    const { result } = renderHook(() => useRepeatEvent(yearlyEventForm));

    expect(result.current.repeatedEvents).toHaveLength(3);
    expect(result.current.repeatedEvents[0].date).toBe('2024-01-01');
    expect(result.current.repeatedEvents[1].date).toBe('2025-01-01');
    expect(result.current.repeatedEvents[2].date).toBe('2026-01-01');
  });

  // 반복 간격 처리
  it('2일마다 반복하는 일정을 생성한다', () => {
    const intervalEventForm: EventForm = {
      ...mockEventForm,
      repeat: {
        type: 'daily',
        interval: 2,
        endDate: '2024-01-07',
      },
    };

    const { result } = renderHook(() => useRepeatEvent(intervalEventForm));

    expect(result.current.repeatedEvents).toHaveLength(4);
    expect(result.current.repeatedEvents[0].date).toBe('2024-01-01');
    expect(result.current.repeatedEvents[1].date).toBe('2024-01-03');
    expect(result.current.repeatedEvents[2].date).toBe('2024-01-05');
    expect(result.current.repeatedEvents[3].date).toBe('2024-01-07');
  });

  it('3주마다 반복하는 일정을 생성한다', () => {
    const intervalEventForm: EventForm = {
      ...mockEventForm,
      repeat: {
        type: 'weekly',
        interval: 3,
        endDate: '2024-01-22',
      },
    };

    const { result } = renderHook(() => useRepeatEvent(intervalEventForm));

    expect(result.current.repeatedEvents).toHaveLength(2);
    expect(result.current.repeatedEvents[0].date).toBe('2024-01-01');
    expect(result.current.repeatedEvents[1].date).toBe('2024-01-22');
  });

  // 종료 조건 처리
  it('종료일이 지정된 경우 해당 날짜까지만 생성한다', () => {
    const endDateEventForm: EventForm = {
      ...mockEventForm,
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2024-01-05',
      },
    };

    const { result } = renderHook(() => useRepeatEvent(endDateEventForm));

    expect(result.current.repeatedEvents).toHaveLength(5);
    expect(result.current.repeatedEvents[4].date).toBe('2024-01-05');
  });

  it('종료일이 없는 경우 2025-10-30까지 생성한다', () => {
    const noEndDateEventForm: EventForm = {
      ...mockEventForm,
      date: '2025-10-28',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: undefined,
      },
    };

    const { result } = renderHook(() => useRepeatEvent(noEndDateEventForm));

    expect(result.current.repeatedEvents).toHaveLength(3);
    expect(result.current.repeatedEvents[0].date).toBe('2025-10-28');
    expect(result.current.repeatedEvents[1].date).toBe('2025-10-29');
    expect(result.current.repeatedEvents[2].date).toBe('2025-10-30');
  });

  // 예외 상황 처리
  it('31일에 매월 반복 시 31일이 없는 달은 건너뛴다', () => {
    const monthlyEventForm: EventForm = {
      ...mockEventForm,
      date: '2024-01-31',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-04-30',
      },
    };

    const { result } = renderHook(() => useRepeatEvent(monthlyEventForm));

    // 1월 31일, 3월 31일만 생성됨 (2월은 31일이 없어서 건너뜀)
    expect(result.current.repeatedEvents).toHaveLength(2);
    expect(result.current.repeatedEvents[0].date).toBe('2024-01-31');
    expect(result.current.repeatedEvents[1].date).toBe('2024-03-31');
  });

  it('윤년 2월 29일에 매년 반복 시 평년에는 건너뛴다', () => {
    const leapYearEventForm: EventForm = {
      ...mockEventForm,
      date: '2024-02-29', // 2024년은 윤년
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2026-02-28',
      },
    };

    const { result } = renderHook(() => useRepeatEvent(leapYearEventForm));

    // 2024년 2월 29일만 생성됨 (2025, 2026년은 평년이라 2월 29일이 없음)
    expect(result.current.repeatedEvents).toHaveLength(1);
    expect(result.current.repeatedEvents[0].date).toBe('2024-02-29');
  });

  // 유효성 검증
  it('반복 타입이 none인 경우 빈 배열을 반환한다', () => {
    const noneRepeatEventForm: EventForm = {
      ...mockEventForm,
      repeat: {
        type: 'none',
        interval: 1,
      },
    };

    const { result } = renderHook(() => useRepeatEvent(noneRepeatEventForm));

    expect(result.current.repeatedEvents).toHaveLength(0);
    expect(result.current.isValidRepeat).toBe(false);
  });

  it('반복 간격이 0 이하면 빈 배열을 반환한다', () => {
    const invalidIntervalEventForm: EventForm = {
      ...mockEventForm,
      repeat: {
        type: 'daily',
        interval: 0,
        endDate: '2024-01-05',
      },
    };

    const { result } = renderHook(() => useRepeatEvent(invalidIntervalEventForm));

    expect(result.current.repeatedEvents).toHaveLength(0);
  });
});
