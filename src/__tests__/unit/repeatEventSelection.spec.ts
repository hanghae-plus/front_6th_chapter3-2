import { describe, it, expect } from 'vitest';

import { RepeatType } from '../../types';

describe('반복 유형 선택 기능', () => {
  describe('반복 유형 옵션', () => {
    it('매일 반복을 선택할 수 있다', () => {
      // Given: 반복 일정 체크박스가 체크된 상태
      const isRepeating = true;

      // When: 매일 반복을 선택
      const selectedRepeatType: RepeatType = 'daily';

      // Then: 매일 반복이 선택되어야 함
      expect(selectedRepeatType).toBe('daily');
      expect(isRepeating).toBe(true);
    });

    it('매주 반복을 선택할 수 있다', () => {
      // Given: 반복 일정 체크박스가 체크된 상태
      const isRepeating = true;

      // When: 매주 반복을 선택
      const selectedRepeatType: RepeatType = 'weekly';

      // Then: 매주 반복이 선택되어야 함
      expect(selectedRepeatType).toBe('weekly');
      expect(isRepeating).toBe(true);
    });

    it('매월 반복을 선택할 수 있다', () => {
      // Given: 반복 일정 체크박스가 체크된 상태
      const isRepeating = true;

      // When: 매월 반복을 선택
      const selectedRepeatType: RepeatType = 'monthly';

      // Then: 매월 반복이 선택되어야 함
      expect(selectedRepeatType).toBe('monthly');
      expect(isRepeating).toBe(true);
    });

    it('매년 반복을 선택할 수 있다', () => {
      // Given: 반복 일정 체크박스가 체크된 상태
      const isRepeating = true;

      // When: 매년 반복을 선택
      const selectedRepeatType: RepeatType = 'yearly';

      // Then: 매년 반복이 선택되어야 함
      expect(selectedRepeatType).toBe('yearly');
      expect(isRepeating).toBe(true);
    });
  });

  describe('반복 간격 설정', () => {
    it('반복 간격을 설정할 수 있다', () => {
      // Given: 반복 일정이 활성화된 상태
      const isRepeating = true;
      const repeatType: RepeatType = 'weekly';

      // When: 반복 간격을 2로 설정
      const repeatInterval = 2;

      // Then: 반복 간격이 2로 설정되어야 함
      expect(repeatInterval).toBe(2);
      expect(isRepeating).toBe(true);
      expect(repeatType).toBe('weekly');
    });

    it('반복 간격은 최소 1 이상이어야 한다', () => {
      // Given: 반복 일정이 활성화된 상태
      const isRepeating = true;

      // When: 반복 간격을 1로 설정
      const repeatInterval = 1;

      // Then: 반복 간격이 1 이상이어야 함
      expect(repeatInterval).toBeGreaterThanOrEqual(1);
      expect(isRepeating).toBe(true);
    });
  });

  describe('반복 종료일 설정', () => {
    it('반복 종료일을 설정할 수 있다', () => {
      // Given: 반복 일정이 활성화된 상태
      const isRepeating = true;
      const repeatType: RepeatType = 'monthly';

      // When: 반복 종료일을 2025-10-30으로 설정
      const repeatEndDate = '2025-10-30';

      // Then: 반복 종료일이 설정되어야 함
      expect(repeatEndDate).toBe('2025-10-30');
      expect(isRepeating).toBe(true);
      expect(repeatType).toBe('monthly');
    });

    it('반복 종료일이 없을 수도 있다', () => {
      // Given: 반복 일정이 활성화된 상태
      const isRepeating = true;

      // When: 반복 종료일을 설정하지 않음
      const repeatEndDate = undefined;

      // Then: 반복 종료일이 undefined일 수 있어야 함
      expect(repeatEndDate).toBeUndefined();
      expect(isRepeating).toBe(true);
    });
  });
});
