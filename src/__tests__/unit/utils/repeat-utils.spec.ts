import { Event } from '../../../types';
import { generateRecurringDates } from '../../../utils/repeatUtils';

describe('generateRecurringDates >', () => {
  describe('정상 동작', () => {
    it('repeat.type이 "none"일 때, 날짜 배열에 원본 이벤트 날짜만 포함한다.', () => {
      const event: Event = {
        id: '1',
        date: '2025-08-01',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toEqual([event.date]);
      expect(result).toHaveLength(1);
    });

    it('repeat.type이 "daily"이면 시작일부터 종료일까지 매일 날짜를 생성한다', () => {
      const event: Event = {
        id: '1',
        date: '2025-08-01',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-08-05' },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toEqual([
        '2025-08-01',
        '2025-08-02',
        '2025-08-03',
        '2025-08-04',
        '2025-08-05',
      ]);
      expect(result).toHaveLength(5);
    });

    it('repeat.type이 "weekly"이면 시작일부터 종료일까지 매주 날짜를 생성한다', () => {
      const event: Event = {
        id: '1',
        date: '2025-08-01',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-08-22' },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toEqual(['2025-08-01', '2025-08-08', '2025-08-15', '2025-08-22']);
      expect(result).toHaveLength(4);
    });

    it('repeat.type이 "monthly"이면 시작일부터 종료일까지 매달 날짜를 생성한다.', () => {
      const event: Event = {
        id: '1',
        date: '2025-08-01',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-10-05' },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toEqual(['2025-08-01', '2025-09-01', '2025-10-01']);
      expect(result).toHaveLength(3);
    });

    it('repeat.type이 "yearly"이면 시작일부터 종료일까지 매년 날짜를 생성한다.', () => {
      const event: Event = {
        id: '1',
        date: '2025-08-01',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1, endDate: '2027-08-01' },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toEqual(['2025-08-01', '2026-08-01', '2027-08-01']);
      expect(result).toHaveLength(3);
    });

    it('repeat.type이 "daily"이고 interval이 5일 때, 시작일부터 종료일까지 5일 간격으로 날짜를 생성한다.', () => {
      const event: Event = {
        id: '1',
        date: '2025-08-01',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 5, endDate: '2025-09-01' },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toEqual([
        '2025-08-01',
        '2025-08-06',
        '2025-08-11',
        '2025-08-16',
        '2025-08-21',
        '2025-08-26',
        '2025-08-31',
      ]);
      expect(result).toHaveLength(7);
    });

    it('repeat.type이 "weekly"이고 interval이 2일 때, 시작일부터 종료일까지 2주 간격으로 날짜를 생성한다.', () => {
      const event: Event = {
        id: '1',
        date: '2025-08-01',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 2, endDate: '2025-09-10' },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toEqual(['2025-08-01', '2025-08-15', '2025-08-29']);
      expect(result).toHaveLength(3);
    });

    it('repeat.type이 "monthly"이고 interval이 2일 때, 시작일부터 종료일까지 2개월 간격으로 날짜를 생성한다.', () => {
      const event: Event = {
        id: '1',
        date: '2025-08-01',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 2, endDate: '2025-12-01' },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toEqual(['2025-08-01', '2025-10-01', '2025-12-01']);
      expect(result).toHaveLength(3);
    });

    it('repeat.type이 "yearly"이고 interval이 2일 때, 시작일부터 종료일까지 2년 간격으로 날짜를 생성한다.', () => {
      const event: Event = {
        id: '1',
        date: '2025-08-01',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 2, endDate: '2027-08-01' },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toEqual(['2025-08-01', '2027-08-01']);
      expect(result).toHaveLength(2);
    });

    it('윤년 2월 29일부터 yearly 반복 시, 윤년인 해의 2월 29일만 생성한다.', () => {
      const event: Event = {
        id: '1',
        date: '2020-02-29',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1, endDate: '2025-10-30' },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toEqual(['2020-02-29', '2024-02-29']);
      expect(result).toHaveLength(2);
    });

    it('3월 31일부터 monthly 반복 시, 31일이 있는 달만 생성한다.', () => {
      const event: Event = {
        id: '1',
        date: '2025-03-31',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-10-30' },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toEqual(['2025-03-31', '2025-05-31', '2025-07-31', '2025-08-31']);
      expect(result).toHaveLength(4);
    });
  });

  describe('경계값 테스트', () => {
    it('endDate가 시작일과 같을 때 시작일만 반환한다', () => {
      const event: Event = {
        id: '1',
        date: '2025-08-01',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-08-01' },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toEqual(['2025-08-01']);
      expect(result).toHaveLength(1);
    });

    it('endDate가 시작일보다 이전일 때 빈 배열을 반환한다', () => {
      const event: Event = {
        id: '1',
        date: '2025-08-01',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-07-31' },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('interval이 0일 때 시작일만 반환한다', () => {
      const event: Event = {
        id: '1',
        date: '2025-08-01',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 0, endDate: '2025-08-05' },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toEqual(['2025-08-01']);
      expect(result).toHaveLength(1);
    });

    it('interval이 음수일 때 시작일만 반환한다', () => {
      const event: Event = {
        id: '1',
        date: '2025-08-01',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: -1, endDate: '2025-08-05' },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toEqual(['2025-08-01']);
      expect(result).toHaveLength(1);
    });

    it('1000이상의 interval 값으로도 정상 동작한다', () => {
      const event: Event = {
        id: '1',
        date: '2025-01-01',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1000, endDate: '2025-12-31' },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toEqual(['2025-01-01']);
      expect(result).toHaveLength(1);
    });

    it('endDate가 없을 때 기본값(2025-10-30)을 사용한다', () => {
      const event: Event = {
        id: '1',
        date: '2025-08-01',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: undefined },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toContain('2025-08-01');
      expect(result).toContain('2025-10-30');
      expect(result.length).toBeGreaterThan(1);
    });

    it('interval이 Infinity일 때 기본값(1)을 사용한다', () => {
      const event: Event = {
        id: '1',
        date: '2025-08-01',
        startTime: '14:00',
        endTime: '16:00',
        title: '이벤트 1',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: Infinity, endDate: '2025-08-05' },
        notificationTime: 0,
      };

      const result = generateRecurringDates(event);
      expect(result).toEqual(['2025-08-01']);
      expect(result).toHaveLength(1);
    });
  });
});
