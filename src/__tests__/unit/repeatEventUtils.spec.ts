import { Event } from '../../types';
import { generateRepeatEvents, removeRepeatEventOnDate } from '../../utils/repeatEventUtils';

describe('repeatEventUtils', () => {
  const event: Event = {
    id: '1',
    title: '테스트 이벤트',
    date: '2025-08-25',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명',
    location: '테스트 장소',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 10,
  };

  describe('generateRepeatEvents', () => {
    it('매일 반복 일정을 생성한다', () => {
      const repeatEvent: Event = {
        ...event,
        repeat: { type: 'daily', interval: 1, endDate: '2025-08-31' },
      };

      const repeatEvents = generateRepeatEvents(repeatEvent, new Date('2025-08-31'));

      expect(repeatEvents).toHaveLength(7);
      expect(repeatEvents[0].date).toBe('2025-08-25');
      expect(repeatEvents[6].date).toBe('2025-08-31');
    });

    it('매주 반복 일정을 생성한다', () => {
      const repeatEvent: Event = {
        ...event,
        date: '2025-08-25',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-09-15' },
      };

      const repeatEvents = generateRepeatEvents(repeatEvent, new Date('2025-09-15'));

      expect(repeatEvents).toHaveLength(4);
      expect(repeatEvents[0].date).toBe('2025-08-25');
      expect(repeatEvents[1].date).toBe('2025-09-01');
      expect(repeatEvents[2].date).toBe('2025-09-08');
      expect(repeatEvents[3].date).toBe('2025-09-15');
    });

    it('매월 반복 일정을 생성한다', () => {
      const repeatEvent: Event = {
        ...event,
        date: '2025-08-25',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-11-25' },
      };

      const repeatEvents = generateRepeatEvents(repeatEvent, new Date('2025-11-25'));

      expect(repeatEvents).toHaveLength(4);
      expect(repeatEvents[0].date).toBe('2025-08-25');
      expect(repeatEvents[1].date).toBe('2025-09-25');
      expect(repeatEvents[2].date).toBe('2025-10-25');
      expect(repeatEvents[3].date).toBe('2025-11-25');
    });

    it('매년 반복 일정을 생성한다', () => {
      const repeatEvent: Event = {
        ...event,
        date: '2025-08-25',
        repeat: { type: 'yearly', interval: 1, endDate: '2028-11-25' },
      };

      const repeatEvents = generateRepeatEvents(repeatEvent, new Date('2028-11-25'));

      expect(repeatEvents).toHaveLength(4);
      expect(repeatEvents[0].date).toBe('2025-08-25');
      expect(repeatEvents[1].date).toBe('2026-08-25');
      expect(repeatEvents[2].date).toBe('2027-08-25');
      expect(repeatEvents[3].date).toBe('2028-08-25');
    });

    it('31일에 매월 반복을 선택하면 31일에만 생성한다', () => {
      const repeatEvent: Event = {
        ...event,
        date: '2025-01-31',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-06-30' },
      };

      const repeatEvents = generateRepeatEvents(repeatEvent, new Date('2025-06-30'));

      expect(repeatEvents).toHaveLength(3);
      expect(repeatEvents[0].date).toBe('2025-01-31');
      expect(repeatEvents[1].date).toBe('2025-03-31');
      expect(repeatEvents[2].date).toBe('2025-05-31');
    });

    it('윤년 29일에 매년 반복을 선택하면 29일에만 생성한다', () => {
      const repeatEvent: Event = {
        ...event,
        date: '2024-02-29',
        repeat: { type: 'yearly', interval: 1, endDate: '2030-02-28' },
      };

      const repeatEvents = generateRepeatEvents(repeatEvent, new Date('2030-02-28'));

      expect(repeatEvents).toHaveLength(2);
      expect(repeatEvents[0].date).toBe('2024-02-29');
      expect(repeatEvents[1].date).toBe('2028-02-29');
    });
  });

  describe('반복 종료 조건', () => {
    it('특정 날짜까지 반복한다', () => {
      const repeatEvent: Event = {
        ...event,
        date: '2025-08-25',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-08-30',
        },
      };

      const repeatEvents = generateRepeatEvents(repeatEvent, new Date('2025-10-30'));

      expect(repeatEvents).toHaveLength(6);
      expect(repeatEvents[0].date).toBe('2025-08-25');
      expect(repeatEvents[5].date).toBe('2025-08-30');
    });

    it('종료 날짜가 없으면 지정된 기간까지 반복한다', () => {
      const repeatEvent: Event = {
        ...event,
        date: '2025-10-15',
        repeat: {
          type: 'daily',
          interval: 1,
        },
      };
      const repeatEvents = generateRepeatEvents(repeatEvent, new Date('2025-10-30'));

      expect(repeatEvents.length).toBeGreaterThan(15);
      expect(repeatEvents[0].date).toBe('2025-10-15');
      expect(repeatEvents[repeatEvents.length - 1].date).toBe('2025-10-30');
    });
  });

  describe('반복 일정 단일 삭제', () => {
    it('반복 일정의 특정 날짜만 삭제한다', () => {
      const repeatEvent: Event = {
        ...event,
        date: '2025-10-15',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-20' },
      };

      const repeatEvents = generateRepeatEvents(repeatEvent, new Date('2025-10-20'));
      expect(repeatEvents).toHaveLength(6);

      const filteredEvents = removeRepeatEventOnDate(repeatEvents, '2025-10-17');

      expect(filteredEvents).toHaveLength(5);
      const dates = filteredEvents.map((e) => e.date);
      expect(dates).toEqual(['2025-10-15', '2025-10-16', '2025-10-18', '2025-10-19', '2025-10-20']);
      expect(dates).not.toContain('2025-10-17');
    });
  });
});
