import { Event } from '../../../types';
import { getFilteredEvents, groupRepeatingEvents } from '../../../utils/eventUtils';

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

describe('groupRepeatingEvents', () => {
  const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
    id: '1',
    title: '테스트 일정',
    date: '2025-10-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명',
    location: '테스트 장소',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
    ...overrides,
  });

  describe('반복 일정 그룹화', () => {
    it('같은 제목과 반복 설정을 가진 반복 일정들을 그룹화한다', () => {
      const events: Event[] = [
        createMockEvent({
          id: '1',
          title: '주간 스탠드업',
          date: '2025-10-02',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-10-30' },
        }),
        createMockEvent({
          id: '2',
          title: '주간 스탠드업',
          date: '2025-10-09',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-10-30' },
        }),
        createMockEvent({
          id: '3',
          title: '주간 스탠드업',
          date: '2025-10-16',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-10-30' },
        }),
      ];

      const result = groupRepeatingEvents(events);

      // 하나의 그룹이 생성되어야 함
      expect(Object.keys(result)).toHaveLength(1);

      // 해당 그룹에 3개의 이벤트가 포함되어야 함
      const groupKey = Object.keys(result)[0];
      expect(result[groupKey]).toHaveLength(3);
      expect(result[groupKey][0].title).toBe('주간 스탠드업');
      expect(result[groupKey][1].title).toBe('주간 스탠드업');
      expect(result[groupKey][2].title).toBe('주간 스탠드업');
    });

    it('다른 제목과 다른 반복 설정을 가진 반복일정들은 별도 그룹으로 분리한다', () => {
      const events: Event[] = [
        createMockEvent({
          id: '1',
          title: '월간 스탠드업',
          date: '2025-10-02',
          repeat: { type: 'monthly', interval: 1, endDate: '2025-10-30' },
        }),
        createMockEvent({
          id: '2',
          title: '주간 스탠드업',
          date: '2025-10-09',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-10-30' },
        }),
        createMockEvent({
          id: '3',
          title: '주간 스탠드업',
          date: '2025-10-02',
          repeat: { type: 'weekly', interval: 2, endDate: '2025-10-30' }, // 간격이 다름
        }),
        createMockEvent({
          id: '4',
          title: '월간 스탠드업',
          date: '2025-10-02',
          repeat: { type: 'monthly', interval: 1, endDate: '2025-10-30' },
        }),
        createMockEvent({
          id: '5',
          title: '월간 스탠드업',
          date: '2025-10-02',
          repeat: { type: 'monthly', interval: 1, endDate: '2025-10-30' },
        }),
      ];

      const result = groupRepeatingEvents(events);

      expect(Object.keys(result)).toHaveLength(3);

      const values = Object.values(result).sort((a, b) => b.length - a.length);
      expect(values[0]).toHaveLength(3);
      expect(values[1]).toHaveLength(1);
      expect(values[2]).toHaveLength(1);
    });
  });

  describe('단독 일정 처리', () => {
    it('반복이 없는 단독 일정은 개별 그룹으로 처리한다', () => {
      const events: Event[] = [
        createMockEvent({
          id: '1',
          title: '일반 일정 1',
          repeat: { type: 'none', interval: 0 },
        }),
        createMockEvent({
          id: '2',
          title: '일반 일정 2',
          repeat: { type: 'none', interval: 0 },
        }),
      ];

      const result = groupRepeatingEvents(events);

      expect(Object.keys(result)).toHaveLength(2);

      expect(result['1']).toHaveLength(1);
      expect(result['2']).toHaveLength(1);
    });
  });
});
