import { EventForm } from '../../types';
import { generateRepeatEvents } from '../../utils/repeatUtils';

describe('generateRepeatEvents', () => {
  it('반복 타입이 none인 경우 빈 배열을 반환한다', () => {
    const baseEvent: EventForm = {
      title: '매일 운동',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '매일 하는 운동',
      location: '헬스장',
      category: '개인',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: '2025-01-03',
      },
      notificationTime: 10,
    };

    const events = generateRepeatEvents(baseEvent);
    expect(events).toHaveLength(0);
  });
  it('매일 반복', () => {
    const baseEvent: EventForm = {
      title: '매일 운동',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '매일 하는 운동',
      location: '헬스장',
      category: '개인',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-01-03',
      },
      notificationTime: 10,
    };

    // When
    const events = generateRepeatEvents(baseEvent);

    // Then - 날짜만 다르고 나머지는 동일한지 확인
    expect(events).toHaveLength(3);
    expect(events[0].date).toBe('2025-01-01');
    expect(events[1].date).toBe('2025-01-02');
    expect(events[2].date).toBe('2025-01-03');

    // 다른 필드들도 복사되었는지 확인
    events.forEach((event) => {
      expect(event.title).toBe('매일 운동');
      expect(event.startTime).toBe('09:00');
    });
  });
  it('매주 반복', () => {
    /* 7일씩 증가 */
    const baseEvent: EventForm = {
      title: '매주 회의',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '매주마다 하는 회의',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2025-01-20',
      },
      notificationTime: 10,
    };

    // When
    const events = generateRepeatEvents(baseEvent);

    // Then - 날짜만 다르고 나머지는 동일한지 확인
    expect(events).toHaveLength(3);
    expect(events[0].date).toBe('2025-01-01');
    expect(events[1].date).toBe('2025-01-08');
    expect(events[2].date).toBe('2025-01-15');

    // 다른 필드들도 복사되었는지 확인
    events.forEach((event) => {
      expect(event.title).toBe('매주 회의');
      expect(event.startTime).toBe('09:00');
    });
  });
  it('매월 반복', () => {
    /* 월 증가, 일은 동일 */
    const baseEvent: EventForm = {
      title: '매월 모임',
      date: '2025-01-02',
      startTime: '17:00',
      endTime: '18:00',
      description: '매월 하는 모임',
      location: '성수',
      category: '개인',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-03-29',
      },
      notificationTime: 10,
    };

    // When
    const events = generateRepeatEvents(baseEvent);

    // Then - 날짜만 다르고 나머지는 동일한지 확인
    expect(events).toHaveLength(3);
    expect(events[0].date).toBe('2025-01-02');
    expect(events[1].date).toBe('2025-02-02');
    expect(events[2].date).toBe('2025-03-02');

    // 다른 필드들도 복사되었는지 확인
    events.forEach((event) => {
      expect(event.title).toBe('매월 모임');
      expect(event.startTime).toBe('17:00');
    });
  });
  it('매년 반복', () => {
    /* 년 증가, 월일 동일 */
    const baseEvent: EventForm = {
      title: '매년 모임',
      date: '2025-01-04',
      startTime: '17:00',
      endTime: '18:00',
      description: '매년 하는 모임',
      location: '성수',
      category: '개인',
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2028-01-01',
      },
      notificationTime: 10,
    };

    // When
    const events = generateRepeatEvents(baseEvent);

    // Then - 날짜만 다르고 나머지는 동일한지 확인
    expect(events).toHaveLength(3);
    expect(events[0].date).toBe('2025-01-04');
    expect(events[1].date).toBe('2026-01-04');
    expect(events[2].date).toBe('2027-01-04');

    // 다른 필드들도 복사되었는지 확인
    events.forEach((event) => {
      expect(event.title).toBe('매년 모임');
      expect(event.startTime).toBe('17:00');
    });
  });

  it('윤년 2월 29일 매년 반복 - 평년은 건너뛴다', () => {
    // 2024-02-29 시작 -> 2028-02-29 (2025,2026,2027 건너뛰기)
    const baseEvent: EventForm = {
      title: '매년 2월 말 모임',
      date: '2024-02-29',
      startTime: '17:00',
      endTime: '18:00',
      description: '매년 2월 말에 하는 모임',
      location: '성수',
      category: '개인',
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2028-03-01',
      },
      notificationTime: 10,
    };

    // When
    const events = generateRepeatEvents(baseEvent);

    // Then - 날짜만 다르고 나머지는 동일한지 확인
    expect(events).toHaveLength(2);
    expect(events[0].date).toBe('2024-02-29');
    expect(events[1].date).toBe('2028-02-29');

    // 다른 필드들도 복사되었는지 확인
    events.forEach((event) => {
      expect(event.title).toBe('매년 2월 말 모임');
      expect(event.startTime).toBe('17:00');
    });
  });

  it('매월 31일 반복 - 31일이 없는 달은 건너뛴다', () => {
    const baseEvent: EventForm = {
      title: '매월 식사 모임',
      date: '2025-08-31',
      startTime: '17:00',
      endTime: '18:00',
      description: '매월 식사하는 모임',
      location: '성수',
      category: '개인',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-11-29',
      },
      notificationTime: 10,
    };

    // When
    const events = generateRepeatEvents(baseEvent);

    // Then - 날짜만 다르고 나머지는 동일한지 확인
    expect(events).toHaveLength(2);
    expect(events[0].date).toBe('2025-08-31');
    expect(events[1].date).toBe('2025-10-31');

    // 다른 필드들도 복사되었는지 확인
    events.forEach((event) => {
      expect(event.title).toBe('매월 식사 모임');
      expect(event.startTime).toBe('17:00');
    });
  });
});
