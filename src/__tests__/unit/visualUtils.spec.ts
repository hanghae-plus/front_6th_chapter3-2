import { Event } from '../../types';
import {
  isRepeatingEvent,
  getEventBackgroundColor,
  getEventBorderStyle,
  shouldShowRepeatingIcon,
  getRepeatingIconStyle,
} from '../../utils/visualUtils';

describe('시각적 구분 헬퍼 함수 TDD', () => {
  // 테스트용 이벤트 데이터
  const repeatingEvent: Event = {
    id: '1',
    title: '매주 팀 미팅',
    date: '2025-10-15',
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  };

  const regularEvent: Event = {
    id: '2',
    title: '일회성 미팅',
    date: '2025-10-16',
    startTime: '10:00',
    endTime: '11:00',
    description: '일회성 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  describe('isRepeatingEvent', () => {
    it('반복 일정인 경우 true를 반환한다', () => {
      expect(isRepeatingEvent(repeatingEvent)).toBe(true);
    });

    it('일반 일정인 경우 false를 반환한다', () => {
      expect(isRepeatingEvent(regularEvent)).toBe(false);
    });

    it('다양한 반복 타입에 대해 올바르게 판단한다', () => {
      const dailyEvent = { ...repeatingEvent, repeat: { type: 'daily' as const, interval: 1 } };
      const monthlyEvent = { ...repeatingEvent, repeat: { type: 'monthly' as const, interval: 1 } };
      const yearlyEvent = { ...repeatingEvent, repeat: { type: 'yearly' as const, interval: 1 } };

      expect(isRepeatingEvent(dailyEvent)).toBe(true);
      expect(isRepeatingEvent(monthlyEvent)).toBe(true);
      expect(isRepeatingEvent(yearlyEvent)).toBe(true);
    });
  });

  describe('getEventBackgroundColor', () => {
    it('알림된 이벤트는 빨간색 배경을 반환한다', () => {
      expect(getEventBackgroundColor(repeatingEvent, true)).toBe('#ffebee');
      expect(getEventBackgroundColor(regularEvent, true)).toBe('#ffebee');
    });

    it('반복 일정은 파란색 배경을 반환한다', () => {
      expect(getEventBackgroundColor(repeatingEvent, false)).toBe('#e3f2fd');
    });

    it('일반 일정은 회색 배경을 반환한다', () => {
      expect(getEventBackgroundColor(regularEvent, false)).toBe('#f5f5f5');
    });
  });

  describe('getEventBorderStyle', () => {
    it('반복 일정은 파란색 왼쪽 테두리를 반환한다', () => {
      expect(getEventBorderStyle(repeatingEvent)).toBe('4px solid #1976d2');
    });

    it('일반 일정은 테두리가 없음을 반환한다', () => {
      expect(getEventBorderStyle(regularEvent)).toBe('none');
    });
  });

  describe('shouldShowRepeatingIcon', () => {
    it('반복 일정인 경우 true를 반환한다', () => {
      expect(shouldShowRepeatingIcon(repeatingEvent)).toBe(true);
    });

    it('일반 일정인 경우 false를 반환한다', () => {
      expect(shouldShowRepeatingIcon(regularEvent)).toBe(false);
    });
  });

  describe('getRepeatingIconStyle', () => {
    it('반복 일정 아이콘의 올바른 스타일을 반환한다', () => {
      const iconStyle = getRepeatingIconStyle();

      expect(iconStyle.width).toBe('8px');
      expect(iconStyle.height).toBe('8px');
      expect(iconStyle.borderRadius).toBe('50%');
      expect(iconStyle.backgroundColor).toBe('#1976d2');
      expect(iconStyle.display).toBe('inline-block');
      expect(iconStyle.marginRight).toBe('4px');
    });
  });
});
