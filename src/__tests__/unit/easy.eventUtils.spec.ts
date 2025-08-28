import { Event } from '../../types';
import { createRecurringEvents, getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-05',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-07-10',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2']);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2', '이벤트 3']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(3);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const borderEvents: Event[] = [
      {
        id: '4',
        title: '6월 마지막 날 이벤트',
        date: '2025-06-30',
        startTime: '23:00',
        endTime: '23:59',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      ...events,
      {
        id: '5',
        title: '8월 첫 날 이벤트',
        date: '2025-08-01',
        startTime: '00:00',
        endTime: '01:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const result = getFilteredEvents(borderEvents, '', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2', '이벤트 3']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(0);
  });
});

describe('createRecurringEvents', () => {
  const baseEvent = {
    id: '1',
    category: '업무',
    title: '제목',
    date: '2025-10-01',
    startTime: '02:09',
    endTime: '02:10',
    description: '설명',
    location: '위치',
    notificationTime: 10,
  };

  describe('none 타입', () => {
    it('none 타입인 경우 원본 이벤트만 반환한다', () => {
      const event: Event = {
        ...baseEvent,
        repeat: { type: 'none', interval: 0 },
      };
      const result = createRecurringEvents(event);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(event);
    });
  });

  describe('daily 타입', () => {
    it('daily 타입으로 매일 반복되는 이벤트를 생성한다', () => {
      const event: Event = {
        ...baseEvent,
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
      };
      const result = createRecurringEvents(event);
      expect(result).toHaveLength(5);
      expect(result[0].date).toBe('2025-10-01');
      expect(result[1].date).toBe('2025-10-02');
      expect(result[2].date).toBe('2025-10-03');
      expect(result[3].date).toBe('2025-10-04');
      expect(result[4].date).toBe('2025-10-05');
    });

    it('interval이 2인 경우 2일마다 반복되는 이벤트를 생성한다', () => {
      const event: Event = {
        ...baseEvent,
        repeat: { type: 'daily', interval: 2, endDate: '2025-10-10' },
      };
      const result = createRecurringEvents(event);
      expect(result).toHaveLength(5);
      expect(result[0].date).toBe('2025-10-01');
      expect(result[1].date).toBe('2025-10-03');
      expect(result[2].date).toBe('2025-10-05');
      expect(result[3].date).toBe('2025-10-07');
      expect(result[4].date).toBe('2025-10-09');
    });

    it('endDate가 없는 경우 2025-10-30까지 이벤트를 생성한다', () => {
      const event: Event = {
        ...baseEvent,
        repeat: { type: 'daily', interval: 1 },
      };
      const result = createRecurringEvents(event);
      expect(result).toHaveLength(30);
      expect(result.at(-1)!.date).toBe('2025-10-30');
    });
  });

  describe('weekly 타입', () => {
    it('weekly 타입으로 매주 반복되는 이벤트를 생성한다', () => {
      const event: Event = {
        ...baseEvent,
        repeat: { type: 'weekly', interval: 1, endDate: '2025-10-22' },
      };
      const result = createRecurringEvents(event);
      expect(result).toHaveLength(4);
      expect(result[0].date).toBe('2025-10-01');
      expect(result[1].date).toBe('2025-10-08');
      expect(result[2].date).toBe('2025-10-15');
      expect(result[3].date).toBe('2025-10-22');
    });

    it('interval이 2인 경우 2주마다 반복되는 이벤트를 생성한다', () => {
      const event: Event = {
        ...baseEvent,
        repeat: { type: 'weekly', interval: 2, endDate: '2025-10-29' },
      };
      const result = createRecurringEvents(event);
      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2025-10-01');
      expect(result[1].date).toBe('2025-10-15');
      expect(result[2].date).toBe('2025-10-29');
    });
  });

  describe('monthly 타입', () => {
    it('monthly 타입으로 매월 반복되는 이벤트를 생성한다', () => {
      const event: Event = {
        ...baseEvent,
        repeat: { type: 'monthly', interval: 1, endDate: '2025-12-01' },
      };
      const result = createRecurringEvents(event);
      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2025-10-01');
      expect(result[1].date).toBe('2025-11-01');
      expect(result[2].date).toBe('2025-12-01');
    });

    it('31일로 설정된 경우 31일이 존재하는 달에만 이벤트를 생성한다', () => {
      const event: Event = {
        ...baseEvent,
        date: '2025-01-31',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-06-30' },
      };
      const result = createRecurringEvents(event);
      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2025-01-31');
      expect(result[1].date).toBe('2025-03-31');
      expect(result[2].date).toBe('2025-05-31');
    });
  });

  describe('yearly 타입', () => {
    it('yearly 타입으로 매년 반복되는 이벤트를 생성한다', () => {
      const event: Event = {
        ...baseEvent,
        repeat: { type: 'yearly', interval: 1, endDate: '2027-10-01' },
      };
      const result = createRecurringEvents(event);
      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2025-10-01');
      expect(result[1].date).toBe('2026-10-01');
      expect(result[2].date).toBe('2027-10-01');
    });

    it('2월 29일로 설정된 경우 윤년에만 이벤트를 생성한다', () => {
      const event: Event = {
        ...baseEvent,
        date: '2024-02-29', // 윤년
        repeat: { type: 'yearly', interval: 1, endDate: '2030-02-28' },
      };
      const result = createRecurringEvents(event);
      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-02-29');
      expect(result[1].date).toBe('2028-02-29');
    });

    it('interval이 2인 경우 2년마다 반복되는 이벤트를 생성한다', () => {
      const event: Event = {
        ...baseEvent,
        repeat: { type: 'yearly', interval: 2, endDate: '2029-10-01' },
      };
      const result = createRecurringEvents(event);
      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2025-10-01');
      expect(result[1].date).toBe('2027-10-01');
      expect(result[2].date).toBe('2029-10-01');
    });
  });

  describe('edge cases', () => {
    it('endDate가 시작일보다 이전인 경우 원본 이벤트만 반환한다', () => {
      const event: Event = {
        ...baseEvent,
        repeat: { type: 'daily', interval: 1, endDate: '2025-09-30' },
      };
      const result = createRecurringEvents(event);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(event);
    });

    it('interval이 0인 경우 기본값 1을 사용한다', () => {
      const event: Event = {
        ...baseEvent,
        repeat: { type: 'daily', interval: 0, endDate: '2025-10-03' },
      };
      const result = createRecurringEvents(event);
      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2025-10-01');
      expect(result[1].date).toBe('2025-10-02');
      expect(result[2].date).toBe('2025-10-03');
    });
  });
});
