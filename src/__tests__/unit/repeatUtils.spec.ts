import { EventForm } from '../../types';
import {
  generateEventId,
  generateRepeatId,
  generateRepeatedEvents,
  getNextRepeatDate,
  isValidRepeatDate,
  validateRepeatSettings,
} from '../../utils/repeatUtils';

describe('repeatUtils', () => {
  describe('getNextRepeatDate', () => {
    it('매일 반복 시 다음 날짜를 올바르게 계산한다', () => {
      const currentDate = new Date('2024-01-01');
      const nextDate = getNextRepeatDate(currentDate, 'daily', 1);

      expect(nextDate.toISOString().split('T')[0]).toBe('2024-01-02');
    });

    it('매주 반복 시 다음 날짜를 올바르게 계산한다', () => {
      const currentDate = new Date('2024-01-01');
      const nextDate = getNextRepeatDate(currentDate, 'weekly', 1);

      expect(nextDate.toISOString().split('T')[0]).toBe('2024-01-08');
    });

    it('매월 반복 시 다음 날짜를 올바르게 계산한다', () => {
      const currentDate = new Date('2024-01-01');
      const nextDate = getNextRepeatDate(currentDate, 'monthly', 1);

      expect(nextDate.toISOString().split('T')[0]).toBe('2024-02-01');
    });

    it('매년 반복 시 다음 날짜를 올바르게 계산한다', () => {
      const currentDate = new Date('2024-01-01');
      const nextDate = getNextRepeatDate(currentDate, 'yearly', 1);

      expect(nextDate.toISOString().split('T')[0]).toBe('2025-01-01');
    });

    it('반복 간격을 올바르게 적용한다', () => {
      const currentDate = new Date('2024-01-01');
      const nextDate = getNextRepeatDate(currentDate, 'daily', 3);

      expect(nextDate.toISOString().split('T')[0]).toBe('2024-01-04');
    });

    it('매월 반복 시 원래 날짜를 유지하려고 시도한다', () => {
      const currentDate = new Date('2024-01-31');
      const nextDate = getNextRepeatDate(currentDate, 'monthly', 1, '2024-01-31');

      // 2월 31일은 존재하지 않으므로 3월 3일로 조정됨 (JavaScript의 기본 동작)
      expect(nextDate.getMonth()).toBe(2); // 3월 (0-based)
      expect(nextDate.getDate()).toBe(31); // 31일
    });
  });

  describe('isValidRepeatDate', () => {
    it('매월 31일 반복 시 31일이 있는 달만 유효하다고 판단한다', () => {
      const originalDate = '2024-01-31';

      // 3월 31일 (유효)
      const marchDate = new Date('2024-03-31');
      expect(isValidRepeatDate(marchDate, 'monthly', originalDate)).toBe(true);

      // 2월 29일 (무효 - 31일이 아님)
      const febDate = new Date('2024-02-29');
      expect(isValidRepeatDate(febDate, 'monthly', originalDate)).toBe(false);
    });

    it('매년 2월 29일 반복 시 윤년만 유효하다고 판단한다', () => {
      const originalDate = '2024-02-29';

      // 2024년 2월 29일 (윤년, 유효)
      const leapYearDate = new Date('2024-02-29');
      expect(isValidRepeatDate(leapYearDate, 'yearly', originalDate)).toBe(true);

      // 2025년 2월 28일 (평년, 무효)
      const nonLeapYearDate = new Date('2025-02-28');
      expect(isValidRepeatDate(nonLeapYearDate, 'yearly', originalDate)).toBe(false);
    });

    it('일반적인 날짜는 항상 유효하다고 판단한다', () => {
      const originalDate = '2024-01-15';
      const testDate = new Date('2024-02-15');

      expect(isValidRepeatDate(testDate, 'monthly', originalDate)).toBe(true);
    });
  });

  describe('validateRepeatSettings', () => {
    it('유효한 반복 설정을 올바르게 검증한다', () => {
      expect(validateRepeatSettings('2024-01-01', '2024-01-31', 1)).toBe(true);
    });

    it('반복 간격이 0 이하면 무효하다고 판단한다', () => {
      expect(validateRepeatSettings('2024-01-01', '2024-01-31', 0)).toBe(false);
      expect(validateRepeatSettings('2024-01-01', '2024-01-31', -1)).toBe(false);
    });

    it('종료일이 시작일보다 이전이면 무효하다고 판단한다', () => {
      expect(validateRepeatSettings('2024-01-31', '2024-01-01', 1)).toBe(false);
    });

    it('종료일이 없으면 유효하다고 판단한다', () => {
      expect(validateRepeatSettings('2024-01-01', undefined, 1)).toBe(true);
    });

    it('반복 간격이 undefined면 유효하다고 판단한다', () => {
      expect(validateRepeatSettings('2024-01-01', '2024-01-31', undefined)).toBe(true);
    });
  });

  describe('generateEventId', () => {
    it('고유한 이벤트 ID를 생성한다', () => {
      const id1 = generateEventId('테스트', '2024-01-01');
      const id2 = generateEventId('테스트', '2024-01-01');

      expect(id1).toContain('테스트-2024-01-01');
      expect(id2).toContain('테스트-2024-01-01');
      expect(id1).not.toBe(id2); // 서로 다른 ID
    });
  });

  describe('generateRepeatId', () => {
    it('고유한 반복 시리즈 ID를 생성한다', () => {
      const id1 = generateRepeatId('테스트');
      const id2 = generateRepeatId('테스트');

      expect(id1).toContain('repeat-테스트');
      expect(id2).toContain('repeat-테스트');
      expect(id1).not.toBe(id2); // 서로 다른 ID
    });
  });

  describe('generateRepeatedEvents', () => {
    const mockEventForm: EventForm = {
      title: '테스트 일정',
      date: '2024-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2024-01-03',
      },
      notificationTime: 10,
    };

    it('매일 반복 일정을 올바르게 생성한다', () => {
      const events = generateRepeatedEvents(mockEventForm);

      expect(events).toHaveLength(3);
      expect(events[0].date).toBe('2024-01-01');
      expect(events[1].date).toBe('2024-01-02');
      expect(events[2].date).toBe('2024-01-03');

      // 모든 이벤트가 같은 반복 시리즈 ID를 가져야 함
      const repeatId = events[0].repeat.id;
      events.forEach((event) => {
        expect(event.repeat.id).toBe(repeatId);
        expect(event.repeat.type).toBe('daily');
      });
    });

    it('반복 타입이 none이면 빈 배열을 반환한다', () => {
      const noneRepeatForm = {
        ...mockEventForm,
        repeat: { type: 'none' as const, interval: 1 },
      };

      const events = generateRepeatedEvents(noneRepeatForm);
      expect(events).toHaveLength(0);
    });

    it('무효한 반복 설정이면 빈 배열을 반환한다', () => {
      const invalidForm = {
        ...mockEventForm,
        repeat: { type: 'daily' as const, interval: 0, endDate: '2024-01-03' },
      };

      const events = generateRepeatedEvents(invalidForm);
      expect(events).toHaveLength(0);
    });

    it('31일 매월 반복 시 31일이 없는 달은 건너뛴다', () => {
      const monthlyForm: EventForm = {
        ...mockEventForm,
        date: '2024-01-31',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2024-04-30',
        },
      };

      const events = generateRepeatedEvents(monthlyForm);

      // 1월 31일, 3월 31일만 생성 (2월은 31일이 없음)
      expect(events).toHaveLength(2);
      expect(events[0].date).toBe('2024-01-31');
      expect(events[1].date).toBe('2024-03-31');
    });

    it('윤년 2월 29일 매년 반복 시 평년은 건너뛴다', () => {
      const yearlyForm: EventForm = {
        ...mockEventForm,
        date: '2024-02-29',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2026-02-28',
        },
      };

      const events = generateRepeatedEvents(yearlyForm);

      // 2024년 2월 29일만 생성 (2025, 2026년은 평년)
      expect(events).toHaveLength(1);
      expect(events[0].date).toBe('2024-02-29');
    });

    it('종료일이 없으면 2025-10-30까지 생성한다', () => {
      const noEndDateForm: EventForm = {
        ...mockEventForm,
        date: '2025-10-28',
        repeat: {
          type: 'daily',
          interval: 1,
        },
      };

      const events = generateRepeatedEvents(noEndDateForm);

      expect(events).toHaveLength(3);
      expect(events[0].date).toBe('2025-10-28');
      expect(events[1].date).toBe('2025-10-29');
      expect(events[2].date).toBe('2025-10-30');
    });

    it('매주 반복 일정을 올바르게 생성한다', () => {
      const weeklyForm: EventForm = {
        ...mockEventForm,
        date: '2024-01-01', // 월요일
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2024-01-15',
        },
      };

      const events = generateRepeatedEvents(weeklyForm);

      expect(events).toHaveLength(3);
      expect(events[0].date).toBe('2024-01-01'); // 1월 1일 (월)
      expect(events[1].date).toBe('2024-01-08'); // 1월 8일 (월)
      expect(events[2].date).toBe('2024-01-15'); // 1월 15일 (월)

      // 모든 이벤트가 같은 반복 시리즈 ID를 가져야 함
      const repeatId = events[0].repeat.id;
      events.forEach((event) => {
        expect(event.repeat.id).toBe(repeatId);
        expect(event.repeat.type).toBe('weekly');
      });
    });

    it('매월 반복 일정을 올바르게 생성한다', () => {
      const monthlyForm: EventForm = {
        ...mockEventForm,
        date: '2024-01-15',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2024-04-15',
        },
      };

      const events = generateRepeatedEvents(monthlyForm);

      expect(events).toHaveLength(4);
      expect(events[0].date).toBe('2024-01-15');
      expect(events[1].date).toBe('2024-02-15');
      expect(events[2].date).toBe('2024-03-15');
      expect(events[3].date).toBe('2024-04-15');

      // 모든 이벤트가 같은 반복 시리즈 ID를 가져야 함
      const repeatId = events[0].repeat.id;
      events.forEach((event) => {
        expect(event.repeat.id).toBe(repeatId);
        expect(event.repeat.type).toBe('monthly');
      });
    });

    it('매월 반복 시 2개월 간격으로 생성한다', () => {
      const monthlyForm: EventForm = {
        ...mockEventForm,
        date: '2024-01-15',
        repeat: {
          type: 'monthly',
          interval: 2,
          endDate: '2024-07-15',
        },
      };

      const events = generateRepeatedEvents(monthlyForm);

      expect(events).toHaveLength(4);
      expect(events[0].date).toBe('2024-01-15');
      expect(events[1].date).toBe('2024-03-15');
      expect(events[2].date).toBe('2024-05-15');
      expect(events[3].date).toBe('2024-07-15');
    });

    it('매년 반복 일정을 올바르게 생성한다', () => {
      const yearlyForm: EventForm = {
        ...mockEventForm,
        date: '2024-01-15',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2027-01-15',
        },
      };

      const events = generateRepeatedEvents(yearlyForm);

      expect(events).toHaveLength(4);
      expect(events[0].date).toBe('2024-01-15');
      expect(events[1].date).toBe('2025-01-15');
      expect(events[2].date).toBe('2026-01-15');
      expect(events[3].date).toBe('2027-01-15');

      // 모든 이벤트가 같은 반복 시리즈 ID를 가져야 함
      const repeatId = events[0].repeat.id;
      events.forEach((event) => {
        expect(event.repeat.id).toBe(repeatId);
        expect(event.repeat.type).toBe('yearly');
      });
    });

    it('매년 반복 시 2년 간격으로 생성한다', () => {
      const yearlyForm: EventForm = {
        ...mockEventForm,
        date: '2024-01-15',
        repeat: {
          type: 'yearly',
          interval: 2,
          endDate: '2030-01-15',
        },
      };

      const events = generateRepeatedEvents(yearlyForm);

      expect(events).toHaveLength(4);
      expect(events[0].date).toBe('2024-01-15');
      expect(events[1].date).toBe('2026-01-15');
      expect(events[2].date).toBe('2028-01-15');
      expect(events[3].date).toBe('2030-01-15');
    });

    it('매월 반복 시 종료일이 없으면 2025-10-30까지 생성한다', () => {
      const monthlyForm: EventForm = {
        ...mockEventForm,
        date: '2025-08-15',
        repeat: {
          type: 'monthly',
          interval: 1,
        },
      };

      const events = generateRepeatedEvents(monthlyForm);

      expect(events).toHaveLength(3);
      expect(events[0].date).toBe('2025-08-15');
      expect(events[1].date).toBe('2025-09-15');
      expect(events[2].date).toBe('2025-10-15');
    });

    it('매년 반복 시 종료일이 없으면 2025-10-30까지 생성한다', () => {
      const yearlyForm: EventForm = {
        ...mockEventForm,
        date: '2024-01-15',
        repeat: {
          type: 'yearly',
          interval: 1,
        },
      };

      const events = generateRepeatedEvents(yearlyForm);

      expect(events).toHaveLength(2);
      expect(events[0].date).toBe('2024-01-15');
      expect(events[1].date).toBe('2025-01-15');
    });
  });
});
