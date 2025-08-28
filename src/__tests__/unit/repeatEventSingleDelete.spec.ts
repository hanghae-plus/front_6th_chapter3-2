import { describe, it, expect } from 'vitest';

import { Event } from '../../types';
import { deleteSingleRepeatEvent, isRepeatEvent } from '../../utils/repeatEventUtils';

describe('반복 일정 단일 삭제 기능', () => {
  describe('단일 삭제 시 특정 일정만 삭제', () => {
    it('반복 일정 중 특정 일정만 삭제할 수 있다', () => {
      // Given: 매주 반복하는 일정들
      const repeatEvents: Event[] = [
        {
          id: '1-1',
          title: '팀 미팅',
          date: '2025-01-06',
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
          date: '2025-01-13',
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
          date: '2025-01-20',
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
      const remainingEvents = deleteSingleRepeatEvent(repeatEvents, '1-2');

      // Then: 삭제된 일정을 제외한 나머지만 남아야 함
      expect(remainingEvents).toHaveLength(2);
      expect(remainingEvents[0].id).toBe('1-1');
      expect(remainingEvents[1].id).toBe('1-3');
      expect(remainingEvents.find((event) => event.id === '1-2')).toBeUndefined();
    });

    it('삭제된 일정은 반복 일정 목록에서 완전히 제거된다', () => {
      // Given: 반복 일정들
      const repeatEvents: Event[] = [
        {
          id: 'daily-1',
          title: '아침 운동',
          date: '2025-01-01',
          startTime: '06:00',
          endTime: '07:00',
          description: '매일 아침 운동',
          location: '집',
          category: '개인',
          repeat: { type: 'daily', interval: 1, endDate: '2025-01-31' },
          notificationTime: 5,
        },
        {
          id: 'daily-2',
          title: '아침 운동',
          date: '2025-01-02',
          startTime: '06:00',
          endTime: '07:00',
          description: '매일 아침 운동',
          location: '집',
          category: '개인',
          repeat: { type: 'daily', interval: 1, endDate: '2025-01-31' },
          notificationTime: 5,
        },
      ];

      // When: 첫 번째 일정 삭제
      const remainingEvents = deleteSingleRepeatEvent(repeatEvents, 'daily-1');

      // Then: 첫 번째 일정이 완전히 제거되어야 함
      expect(remainingEvents).toHaveLength(1);
      expect(remainingEvents[0].id).toBe('daily-2');
      expect(remainingEvents.find((event) => event.id === 'daily-1')).toBeUndefined();
    });

    it('존재하지 않는 ID로 삭제 시도하면 원본 목록이 그대로 반환된다', () => {
      // Given: 반복 일정들
      const repeatEvents: Event[] = [
        {
          id: '1-1',
          title: '팀 미팅',
          date: '2025-01-06',
          startTime: '09:00',
          endTime: '10:00',
          description: '주간 팀 미팅',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-01-29' },
          notificationTime: 10,
        },
      ];

      // When: 존재하지 않는 ID로 삭제 시도
      const remainingEvents = deleteSingleRepeatEvent(repeatEvents, 'non-existent-id');

      // Then: 원본 목록이 그대로 반환되어야 함
      expect(remainingEvents).toHaveLength(1);
      expect(remainingEvents[0].id).toBe('1-1');
      expect(remainingEvents).toEqual(repeatEvents);
    });
  });

  describe('단일 삭제 후 반복 일정 상태', () => {
    it('삭제 후 남은 일정들은 여전히 반복 일정으로 유지된다', () => {
      // Given: 매주 반복하는 일정들
      const repeatEvents: Event[] = [
        {
          id: 'weekly-1',
          title: '팀 미팅',
          date: '2025-01-06',
          startTime: '09:00',
          endTime: '10:00',
          description: '주간 팀 미팅',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-01-29' },
          notificationTime: 10,
        },
        {
          id: 'weekly-2',
          title: '팀 미팅',
          date: '2025-01-13',
          startTime: '09:00',
          endTime: '10:00',
          description: '주간 팀 미팅',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-01-29' },
          notificationTime: 10,
        },
      ];

      // When: 첫 번째 일정 삭제
      const remainingEvents = deleteSingleRepeatEvent(repeatEvents, 'weekly-1');

      // Then: 남은 일정은 여전히 반복 일정이어야 함
      expect(remainingEvents).toHaveLength(1);
      expect(isRepeatEvent(remainingEvents[0])).toBe(true);
      expect(remainingEvents[0].repeat.type).toBe('weekly');
    });

    it('모든 반복 일정을 삭제하면 빈 배열이 반환된다', () => {
      // Given: 반복 일정들
      const repeatEvents: Event[] = [
        {
          id: 'single-1',
          title: '일회성 미팅',
          date: '2025-01-06',
          startTime: '09:00',
          endTime: '10:00',
          description: '일회성 미팅',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'none', interval: 1, endDate: undefined },
          notificationTime: 10,
        },
      ];

      // When: 유일한 일정 삭제
      const remainingEvents = deleteSingleRepeatEvent(repeatEvents, 'single-1');

      // Then: 빈 배열이 반환되어야 함
      expect(remainingEvents).toHaveLength(0);
      expect(remainingEvents).toEqual([]);
    });
  });

  describe('단일 삭제 시나리오', () => {
    it('매일 반복 일정의 특정 날짜를 삭제할 수 있다', () => {
      // Given: 매일 반복 일정들
      const dailyRepeatEvents: Event[] = [
        {
          id: 'daily-1',
          title: '아침 운동',
          date: '2025-01-01',
          startTime: '06:00',
          endTime: '07:00',
          description: '매일 아침 운동',
          location: '집',
          category: '개인',
          repeat: { type: 'daily', interval: 1, endDate: '2025-01-05' },
          notificationTime: 5,
        },
        {
          id: 'daily-2',
          title: '아침 운동',
          date: '2025-01-02',
          startTime: '06:00',
          endTime: '07:00',
          description: '매일 아침 운동',
          location: '집',
          category: '개인',
          repeat: { type: 'daily', interval: 1, endDate: '2025-01-05' },
          notificationTime: 5,
        },
        {
          id: 'daily-3',
          title: '아침 운동',
          date: '2025-01-03',
          startTime: '06:00',
          endTime: '07:00',
          description: '매일 아침 운동',
          location: '집',
          category: '개인',
          repeat: { type: 'daily', interval: 1, endDate: '2025-01-05' },
          notificationTime: 5,
        },
      ];

      // When: 1월 2일 일정 삭제
      const remainingEvents = deleteSingleRepeatEvent(dailyRepeatEvents, 'daily-2');

      // Then: 1월 2일을 제외한 나머지 일정들이 남아야 함
      expect(remainingEvents).toHaveLength(2);
      expect(remainingEvents[0].date).toBe('2025-01-01');
      expect(remainingEvents[1].date).toBe('2025-01-03');
      expect(remainingEvents.find((event) => event.date === '2025-01-02')).toBeUndefined();
    });

    it('매월 반복 일정의 특정 달을 삭제할 수 있다', () => {
      // Given: 매월 반복 일정들
      const monthlyRepeatEvents: Event[] = [
        {
          id: 'monthly-1',
          title: '월말 정리',
          date: '2025-01-31',
          startTime: '18:00',
          endTime: '19:00',
          description: '매월 말 정리 작업',
          location: '사무실',
          category: '업무',
          repeat: { type: 'monthly', interval: 1, endDate: '2025-03-31' },
          notificationTime: 30,
        },
        {
          id: 'monthly-2',
          title: '월말 정리',
          date: '2025-02-28',
          startTime: '18:00',
          endTime: '19:00',
          description: '매월 말 정리 작업',
          location: '사무실',
          category: '업무',
          repeat: { type: 'monthly', interval: 1, endDate: '2025-03-31' },
          notificationTime: 30,
        },
        {
          id: 'monthly-3',
          title: '월말 정리',
          date: '2025-03-31',
          startTime: '18:00',
          endTime: '19:00',
          description: '매월 말 정리 작업',
          location: '사무실',
          category: '업무',
          repeat: { type: 'monthly', interval: 1, endDate: '2025-03-31' },
          notificationTime: 30,
        },
      ];

      // When: 2월 28일 일정 삭제
      const remainingEvents = deleteSingleRepeatEvent(monthlyRepeatEvents, 'monthly-2');

      // Then: 2월 28일을 제외한 나머지 일정들이 남아야 함
      expect(remainingEvents).toHaveLength(2);
      expect(remainingEvents[0].date).toBe('2025-01-31');
      expect(remainingEvents[1].date).toBe('2025-03-31');
      expect(remainingEvents.find((event) => event.date === '2025-02-28')).toBeUndefined();
    });
  });
});
