import { describe, it, expect } from 'vitest';

import { Event } from '../../types';
import { generateRepeatDates } from '../../utils/repeatEventUtils';

describe('반복 일정 생성 및 관리 기능', () => {
  describe('반복 일정 실제 생성', () => {
    it('매일 반복 일정을 생성할 수 있다', () => {
      // Given: 매일 반복하는 일정 설정
      const eventData = {
        date: '2025-01-01',
        repeatType: 'daily' as const,
        interval: 1,
        endDate: '2025-01-05',
      };

      // When: 반복 날짜 생성
      const repeatDates = generateRepeatDates(eventData);

      // Then: 5일간의 반복 날짜가 생성되어야 함
      expect(repeatDates).toHaveLength(5);
      expect(repeatDates).toEqual([
        '2025-01-01',
        '2025-01-02',
        '2025-01-03',
        '2025-01-04',
        '2025-01-05',
      ]);
    });

    it('매주 반복 일정을 생성할 수 있다', () => {
      // Given: 매주 반복하는 일정 설정
      const eventData = {
        date: '2025-01-01',
        repeatType: 'weekly' as const,
        interval: 1,
        endDate: '2025-01-29',
      };

      // When: 반복 날짜 생성
      const repeatDates = generateRepeatDates(eventData);

      // Then: 5주간의 반복 날짜가 생성되어야 함
      expect(repeatDates).toHaveLength(5);
      expect(repeatDates[0]).toBe('2025-01-01');
      expect(repeatDates[1]).toBe('2025-01-08');
      expect(repeatDates[2]).toBe('2025-01-15');
      expect(repeatDates[3]).toBe('2025-01-22');
      expect(repeatDates[4]).toBe('2025-01-29');
    });

    it('매월 반복 일정을 생성할 수 있다', () => {
      // Given: 매월 반복하는 일정 설정 (1월 31일)
      const eventData = {
        date: '2025-01-31',
        repeatType: 'monthly' as const,
        interval: 1,
        endDate: '2025-08-31',
      };

      // When: 반복 날짜 생성
      const repeatDates = generateRepeatDates(eventData);

      // Then: 31일이 있는 달에만 생성되어야 함 (2월, 4월, 6월은 건너뛰기)
      expect(repeatDates).toHaveLength(5);
      expect(repeatDates[0]).toBe('2025-01-31');
      expect(repeatDates[1]).toBe('2025-03-31'); // 2월 건너뛰기
      expect(repeatDates[2]).toBe('2025-05-31'); // 4월 건너뛰기
      expect(repeatDates[3]).toBe('2025-07-31'); // 6월 건너뛰기
      expect(repeatDates[4]).toBe('2025-08-31');
    });

    it('매년 반복 일정을 생성할 수 있다', () => {
      // Given: 매년 반복하는 일정 설정 (2월 29일)
      const eventData = {
        date: '2024-02-29', // 윤년
        repeatType: 'yearly' as const,
        interval: 1,
        endDate: '2028-02-29',
      };

      // When: 반복 날짜 생성
      const repeatDates = generateRepeatDates(eventData);

      // Then: 2월 29일이 있는 해(윤년)에만 생성되어야 함
      expect(repeatDates).toHaveLength(2);
      expect(repeatDates[0]).toBe('2024-02-29'); // 2024년 (윤년)
      expect(repeatDates[1]).toBe('2028-02-29'); // 2028년 (윤년)
      // 2025, 2026, 2027년은 2월 29일이 없으므로 건너뛰기
    });
  });

  describe('반복 일정 저장 및 관리', () => {
    it('생성된 반복 일정들을 저장할 수 있다', () => {
      // Given: 반복 일정 생성 데이터
      const baseEvent: Event = {
        id: '1',
        title: '팀 미팅',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-01-29' },
        notificationTime: 10,
      };

      // When: 반복 일정들을 생성하여 저장
      const repeatDates = generateRepeatDates({
        date: baseEvent.date,
        repeatType: baseEvent.repeat.type,
        interval: baseEvent.repeat.interval,
        endDate: baseEvent.repeat.endDate!,
      });

      const repeatEvents = repeatDates.map((date, index) => ({
        ...baseEvent,
        id: `${baseEvent.id}-${index + 1}`,
        date,
      }));

      // Then: 모든 반복 일정이 생성되어야 함
      expect(repeatEvents).toHaveLength(5);
      expect(repeatEvents[0].date).toBe('2025-01-01');
      expect(repeatEvents[1].date).toBe('2025-01-08');
      expect(repeatEvents[2].date).toBe('2025-01-15');
      expect(repeatEvents[3].date).toBe('2025-01-22');
      expect(repeatEvents[4].date).toBe('2025-01-29');
    });

    it('반복 일정 중 특정 일정만 수정할 수 있다', () => {
      // Given: 반복 일정들
      const repeatEvents: Event[] = [
        {
          id: '1-1',
          title: '팀 미팅',
          date: '2025-01-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '주간 팀 미팅',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-01-29' },
          notificationTime: 10,
        },
        {
          id: '1-2',
          title: '팀 미팅',
          date: '2025-01-08',
          startTime: '09:00',
          endTime: '10:00',
          description: '주간 팀 미팅',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-01-29' },
          notificationTime: 10,
        },
      ];

      // When: 두 번째 일정만 수정
      const editedEvent: Event = {
        ...repeatEvents[1],
        title: '팀 미팅 (수정됨)',
        startTime: '10:00',
        endTime: '11:00',
        repeat: { type: 'none', interval: 1, endDate: undefined },
      };

      // Then: 수정된 일정은 단일 일정이 되어야 함
      expect(editedEvent.repeat.type).toBe('none');
      expect(editedEvent.title).toBe('팀 미팅 (수정됨)');
      expect(editedEvent.startTime).toBe('10:00');
      expect(editedEvent.endTime).toBe('11:00');
    });

    it('반복 일정 중 특정 일정만 삭제할 수 있다', () => {
      // Given: 반복 일정들
      const repeatEvents: Event[] = [
        {
          id: '1-1',
          title: '팀 미팅',
          date: '2025-01-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '주간 팀 미팅',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-01-29' },
          notificationTime: 10,
        },
        {
          id: '1-2',
          title: '팀 미팅',
          date: '2025-01-08',
          startTime: '09:00',
          endTime: '10:00',
          description: '주간 팀 미팅',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-01-29' },
          notificationTime: 10,
        },
        {
          id: '1-3',
          title: '팀 미팅',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '주간 팀 미팅',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-01-29' },
          notificationTime: 10,
        },
      ];

      // When: 두 번째 일정만 삭제
      const remainingEvents = repeatEvents.filter((event) => event.id !== '1-2');

      // Then: 삭제된 일정을 제외한 나머지만 남아야 함
      expect(remainingEvents).toHaveLength(2);
      expect(remainingEvents[0].id).toBe('1-1');
      expect(remainingEvents[1].id).toBe('1-3');
      expect(remainingEvents.find((event) => event.id === '1-2')).toBeUndefined();
    });
  });
});
