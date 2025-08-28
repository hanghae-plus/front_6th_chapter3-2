import { updateEventRepeat } from '../../utils/eventUpdateUtils';
import { createEvent } from '../../utils/eventUtils';

describe('이벤트 반복 설정 업데이트 유틸리티 테스트', () => {
  describe('핵심 기능', () => {
    it('반복 일정을 단일 일정으로 변환한다', () => {
      const weeklyEvent = createEvent('repeating', 'weekly', 1);
      const updatedEvent = updateEventRepeat(weeklyEvent, { type: 'none', interval: 1 });

      expect(updatedEvent.repeat.type).toBe('none');
      expect(updatedEvent.repeat.interval).toBe(1);
      expect(updatedEvent.repeat.endDate).toBeUndefined();
    });

    it('단일 일정을 반복 일정으로 변환한다', () => {
      const singleEvent = createEvent('single', 'none', 1);
      const updatedEvent = updateEventRepeat(singleEvent, { type: 'weekly', interval: 2 });

      expect(updatedEvent.repeat.type).toBe('weekly');
      expect(updatedEvent.repeat.interval).toBe(2);
    });

    it('다양한 반복 유형으로 변환한다', () => {
      const singleEvent = createEvent('single', 'none', 1);
      const types = ['daily', 'weekly', 'monthly', 'yearly'] as const;

      types.forEach((type) => {
        const updatedEvent = updateEventRepeat(singleEvent, { type, interval: 1 });
        expect(updatedEvent.repeat.type).toBe(type);
        expect(updatedEvent.repeat.interval).toBe(1);
      });
    });
  });

  describe('데이터 무결성', () => {
    it('원본 객체를 변경하지 않는다 (불변성)', () => {
      const originalEvent = createEvent('repeating', 'weekly', 1);
      const originalRepeat = { ...originalEvent.repeat };

      updateEventRepeat(originalEvent, { type: 'none', interval: 1 });

      expect(originalEvent.repeat).toEqual(originalRepeat);
    });

    it('다른 필드들이 보존된다', () => {
      const event = createEvent('repeating', 'weekly', 2);
      const updatedEvent = updateEventRepeat(event, { type: 'none', interval: 1 });

      expect(updatedEvent.title).toBe('Repeating Event weekly 2');
      expect(updatedEvent.date).toBe('2025-01-01');
      expect(updatedEvent.startTime).toBe('09:00');
      expect(updatedEvent.endTime).toBe('10:00');
      expect(updatedEvent.description).toBe('');
      expect(updatedEvent.location).toBe('');
      expect(updatedEvent.category).toBe('업무');
      expect(updatedEvent.notificationTime).toBe(0);
    });
  });

  describe('엣지 케이스', () => {
    it('이미 단일 일정인 경우에도 안전하게 처리한다', () => {
      const singleEvent = createEvent('single', 'none', 1);
      const updatedEvent = updateEventRepeat(singleEvent, { type: 'none', interval: 1 });

      expect(updatedEvent.repeat.type).toBe('none');
      expect(updatedEvent.repeat.interval).toBe(1);
    });

    it('동일한 반복 설정으로 업데이트해도 안전하게 처리한다', () => {
      const weeklyEvent = createEvent('repeating', 'weekly', 1);
      const updatedEvent = updateEventRepeat(weeklyEvent, { type: 'weekly', interval: 1 });

      expect(updatedEvent.repeat.type).toBe('weekly');
      expect(updatedEvent.repeat.interval).toBe(1);
    });
  });
});
