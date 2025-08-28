import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  findDetailedOverlappingEvents,
  findOverlappingEventsInDateRange,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');
    expect(result).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025/07/01', '14:30');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '25:00');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      title: '테스트 이벤트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const result = convertEventToDateRange(event);
    expect(result.start).toEqual(new Date('2025-07-01T14:30:00'));
    expect(result.end).toEqual(new Date('2025-07-01T15:30:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '5',
      date: '2025/07/01', // 잘못된 형식
      startTime: '14:30',
      endTime: '15:30',
      title: '잘못된 날짜 이벤트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '6',
      date: '2025-07-01',
      startTime: '25:00', // 잘못된 형식
      endTime: '26:00', // 잘못된 형식
      title: '잘못된 시간 이벤트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '16:00',
      title: '이벤트 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const event2: Event = {
      id: '2',
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '17:00',
      title: '이벤트 2',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '16:00',
      title: '이벤트 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const event2: Event = {
      id: '2',
      date: '2025-07-01',
      startTime: '16:00',
      endTime: '18:00',
      title: '이벤트 2',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const baseEvents: Event[] = [
    {
      id: '1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '12:00',
      title: '이벤트 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      date: '2025-07-02',
      startTime: '11:00',
      endTime: '13:00',
      title: '이벤트 2',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '3',
      date: '2025-07-03',
      startTime: '15:00',
      endTime: '16:00',
      title: '이벤트 3',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '4',
      date: '2025-07-01',
      startTime: '11:30',
      endTime: '14:30',
      title: '새 이벤트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const result = findOverlappingEvents(newEvent, baseEvents);
    expect(result).toEqual([baseEvents[0]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '4',
      date: '2025-07-01',
      startTime: '13:00',
      endTime: '15:00',
      title: '새 이벤트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const result = findOverlappingEvents(newEvent, baseEvents);
    expect(result).toHaveLength(0);
  });

  describe('반복 이벤트', () => {
    it('daily 반복 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
      const newEvent: Event = {
        id: '4',
        date: '2025-07-01',
        startTime: '11:30',
        endTime: '12:30',
        title: '반복 이벤트',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-07-03' },
        notificationTime: 0,
      };
      const result = findOverlappingEvents(newEvent, baseEvents);
      expect(result).toHaveLength(2);
    });

    it('weekly 반복 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
      const newEvent: Event = {
        id: '4',
        date: '2025-07-01',
        startTime: '11:30',
        endTime: '12:30',
        title: '주간 반복 이벤트',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-07-15' },
        notificationTime: 0,
      };
      const result = findOverlappingEvents(newEvent, baseEvents);
      expect(result).toEqual([baseEvents[0]]);
    });

    it('monthly 반복 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
      const newEvent: Event = {
        id: '4',
        date: '2025-07-01',
        startTime: '11:30',
        endTime: '12:30',
        title: '월간 반복 이벤트',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-09-01' },
        notificationTime: 0,
      };
      const result = findOverlappingEvents(newEvent, baseEvents);
      expect(result).toEqual([baseEvents[0]]);
    });

    it('yearly 반복 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
      const newEvent: Event = {
        id: '4',
        date: '2025-07-01',
        startTime: '11:30',
        endTime: '12:30',
        title: '연간 반복 이벤트',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1, endDate: '2027-07-01' },
        notificationTime: 0,
      };
      const result = findOverlappingEvents(newEvent, baseEvents);
      expect(result).toEqual([baseEvents[0]]);
    });

    it('반복 이벤트의 중복된 겹침을 제거하여 반환한다', () => {
      const newEvent: Event = {
        id: '4',
        date: '2025-07-01',
        startTime: '11:30',
        endTime: '12:30',
        title: '중복 겹침 테스트',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-07-05' },
        notificationTime: 0,
      };
      const result = findOverlappingEvents(newEvent, baseEvents);
      // 중복 제거되어 baseEvents[0]과 baseEvents[1]만 반환되어야 함
      expect(result).toHaveLength(2);
      expect(result).toContain(baseEvents[0]);
      expect(result).toContain(baseEvents[1]);
    });
  });
});

describe('findDetailedOverlappingEvents', () => {
  const baseEvents: Event[] = [
    {
      id: '1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '12:00',
      title: '이벤트 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      date: '2025-07-01',
      startTime: '11:00',
      endTime: '13:00',
      title: '이벤트 2',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];

  it('반복 이벤트의 상세한 겹침 정보를 반환한다', () => {
    const newEvent: Event = {
      id: '3',
      date: '2025-07-01',
      startTime: '11:30',
      endTime: '12:30',
      title: '상세 겹침 테스트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1, endDate: '2025-07-03' },
      notificationTime: 0,
    };
    const result = findDetailedOverlappingEvents(newEvent, baseEvents);

    expect(result).toHaveLength(1);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '3',
      date: '2025-07-01',
      startTime: '13:00',
      endTime: '14:00',
      title: '겹치지 않는 이벤트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1, endDate: '2025-07-03' },
      notificationTime: 0,
    };
    const result = findDetailedOverlappingEvents(newEvent, baseEvents);
    expect(result).toHaveLength(0);
  });
});

describe('findOverlappingEventsInDateRange', () => {
  const baseEvents: Event[] = [
    {
      id: '1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '12:00',
      title: '이벤트 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      date: '2025-07-15',
      startTime: '11:00',
      endTime: '13:00',
      title: '이벤트 2',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];

  it('지정된 날짜 범위에서 겹치는 이벤트만 반환한다', () => {
    const newEvent: Event = {
      id: '3',
      date: '2025-07-01',
      startTime: '11:30',
      endTime: '12:30',
      title: '범위 테스트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1, endDate: '2025-07-20' },
      notificationTime: 0,
    };
    const startDate = new Date('2025-07-01');
    const endDate = new Date('2025-07-10');

    const result = findOverlappingEventsInDateRange(newEvent, baseEvents, startDate, endDate);
    expect(result).toEqual([baseEvents[0]]); // 7월 1일 이벤트만 범위에 포함
  });

  it('범위 밖의 이벤트는 제외한다', () => {
    const newEvent: Event = {
      id: '3',
      date: '2025-07-01',
      startTime: '11:30',
      endTime: '12:30',
      title: '범위 밖 테스트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1, endDate: '2025-07-20' },
      notificationTime: 0,
    };
    const startDate = new Date('2025-07-10');
    const endDate = new Date('2025-07-20');

    const result = findOverlappingEventsInDateRange(newEvent, baseEvents, startDate, endDate);
    expect(result).toEqual([baseEvents[1]]); // 7월 15일 이벤트만 범위에 포함
  });

  it('범위가 비어있으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '3',
      date: '2025-07-01',
      startTime: '11:30',
      endTime: '12:30',
      title: '빈 범위 테스트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1, endDate: '2025-07-20' },
      notificationTime: 0,
    };
    const startDate = new Date('2025-08-01');
    const endDate = new Date('2025-08-10');

    const result = findOverlappingEventsInDateRange(newEvent, baseEvents, startDate, endDate);
    expect(result).toHaveLength(0);
  });
});
