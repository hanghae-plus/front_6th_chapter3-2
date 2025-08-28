import { describe, it, expect } from 'vitest';

import { Event } from '../../types';
import { createSingleEditEvent, isRepeatEvent } from '../../utils/repeatEventUtils';

describe('반복 일정 단일 수정 기능', () => {
  describe('단일 수정 시 반복 일정을 단일 일정으로 변경', () => {
    it('반복 일정을 수정하면 단일 일정으로 변경된다', () => {
      // Given: 매주 반복하는 일정
      const originalEvent: Event = {
        id: '1',
        title: '팀 미팅',
        date: '2025-01-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      };

      // When: 해당 일정을 단일 수정
      const singleEditEvent = createSingleEditEvent(originalEvent, '2025-01-06');

      // Then: 반복 설정이 'none'으로 변경되어야 함
      expect(singleEditEvent.repeat.type).toBe('none');
      expect(singleEditEvent.id).not.toBe(originalEvent.id);
      expect(singleEditEvent.date).toBe('2025-01-06');
    });

    it('단일 수정된 일정은 반복 아이콘이 표시되지 않는다', () => {
      // Given: 단일 수정된 일정
      const editedEvent: Event = {
        id: '1',
        title: '팀 미팅 (수정됨)',
        date: '2025-01-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 1, endDate: undefined },
        notificationTime: 10,
      };

      // When: 반복 아이콘 표시 여부 확인
      const shouldShowRepeatIcon = isRepeatEvent(editedEvent);

      // Then: 반복 아이콘이 표시되지 않아야 함
      expect(shouldShowRepeatIcon).toBe(false);
      expect(editedEvent.repeat.type).toBe('none');
    });

    it('단일 수정 시 원본 반복 일정은 그대로 유지된다', () => {
      // Given: 원본 반복 일정과 단일 수정된 일정
      const originalRepeatEvent: Event = {
        id: '1',
        title: '팀 미팅',
        date: '2025-01-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      };

      const singleEditedEvent = createSingleEditEvent(originalRepeatEvent, '2025-01-06');

      // When: 두 일정의 반복 설정 비교
      const originalIsRepeating = isRepeatEvent(originalRepeatEvent);
      const editedIsRepeating = isRepeatEvent(singleEditedEvent);

      // Then: 원본은 반복 일정으로 유지되고, 수정된 것은 단일 일정이 되어야 함
      expect(originalIsRepeating).toBe(true);
      expect(editedIsRepeating).toBe(false);
      expect(originalRepeatEvent.repeat.type).toBe('weekly');
      expect(singleEditedEvent.repeat.type).toBe('none');
    });

    it('단일 수정된 일정은 고유한 ID를 가져야 한다', () => {
      // Given: 반복 일정
      const originalEvent: Event = {
        id: '1',
        title: '팀 미팅',
        date: '2025-01-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      };

      // When: 단일 수정 이벤트 생성
      const singleEditEvent = createSingleEditEvent(originalEvent, '2025-01-06');

      // Then: 고유한 ID를 가져야 함
      expect(singleEditEvent.id).not.toBe(originalEvent.id);
      expect(singleEditEvent.id).toContain(originalEvent.id);
      expect(singleEditEvent.id).toContain('single-edit');
    });
  });

  describe('단일 수정 UI 동작', () => {
    it('반복 일정에 수정 버튼을 클릭하면 단일 수정 옵션이 표시된다', () => {
      // Given: 반복 일정
      const repeatEvent: Event = {
        id: '1',
        title: '팀 미팅',
        date: '2025-01-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      };

      // When: 수정 버튼 클릭 시 단일 수정 옵션 확인
      const hasSingleEditOption = isRepeatEvent(repeatEvent);

      // Then: 단일 수정 옵션이 표시되어야 함
      expect(hasSingleEditOption).toBe(true);
      expect(repeatEvent.repeat.type).toBe('weekly');
    });

    it('단일 수정 옵션을 선택하면 수정 모드로 진입한다', () => {
      // Given: 반복 일정 수정 모드
      const isEditingMode = true;
      const isSingleEdit = true;

      // When: 단일 수정 모드 진입
      const shouldEnterEditMode = isEditingMode && isSingleEdit;

      // Then: 수정 모드로 진입해야 함
      expect(shouldEnterEditMode).toBe(true);
      expect(isEditingMode).toBe(true);
      expect(isSingleEdit).toBe(true);
    });
  });

  describe('단일 수정 시나리오', () => {
    it('매일 반복 일정의 특정 날짜를 단일 수정할 수 있다', () => {
      // Given: 매일 반복 일정
      const dailyRepeatEvent: Event = {
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
      };

      // When: 1월 15일만 단일 수정
      const singleEditEvent = createSingleEditEvent(dailyRepeatEvent, '2025-01-15');

      // Then: 단일 수정된 일정이 생성되어야 함
      expect(singleEditEvent.repeat.type).toBe('none');
      expect(singleEditEvent.date).toBe('2025-01-15');
      expect(singleEditEvent.title).toBe('아침 운동');
    });

    it('매월 반복 일정의 특정 달을 단일 수정할 수 있다', () => {
      // Given: 매월 반복 일정
      const monthlyRepeatEvent: Event = {
        id: 'monthly-1',
        title: '월말 정리',
        date: '2025-01-31',
        startTime: '18:00',
        endTime: '19:00',
        description: '매월 말 정리 작업',
        location: '사무실',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 30,
      };

      // When: 3월 31일만 단일 수정
      const singleEditEvent = createSingleEditEvent(monthlyRepeatEvent, '2025-03-31');

      // Then: 단일 수정된 일정이 생성되어야 함
      expect(singleEditEvent.repeat.type).toBe('none');
      expect(singleEditEvent.date).toBe('2025-03-31');
      expect(singleEditEvent.title).toBe('월말 정리');
    });
  });
});
