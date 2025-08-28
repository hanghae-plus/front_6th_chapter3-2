import { Event } from '../../types';
import {
  deleteRecurringOccurrence,
  generateRecurringEvents,
  hasRecurringIcon,
  updateRecurringOccurrence,
} from '../../utils/recurrence';

// 매일 반복 이벤트 (2025-08-25 ~ 2025-08-30)
const dailyEvents: Event = {
  id: '1',
  title: '매일 반복 일정',
  date: '2025-08-25',
  startTime: '09:00',
  endTime: '10:00',
  repeat: { type: 'daily', interval: 1, endDate: '2025-08-30' },
  description: '',
  location: '',
  category: '',
  notificationTime: 0,
};

// 매주 반복 이벤트 (2025-08-25 ~ 2025-09-08 매주 월요일)
const weeklyEvents: Event = {
  id: '2',
  title: '매주 반복 일정',
  date: '2025-08-25',
  startTime: '09:00',
  endTime: '10:00',
  repeat: { type: 'weekly', interval: 1, endDate: '2025-09-08' },
  description: '',
  location: '',
  category: '',
  notificationTime: 0,
};

// 매월 반복 이벤트 (2025-08-01 ~ 2025-11)
const monthlyEvents: Event = {
  id: '3',
  title: '매월 반복 일정',
  date: '2025-08-01',
  startTime: '09:00',
  endTime: '10:00',
  repeat: { type: 'monthly', interval: 1, endDate: '2025-11-30' },
  description: '',
  location: '',
  category: '',
  notificationTime: 0,
};

// 매년 반복 이벤트 (2025-08-25 ~ 2027년까지 매년)
const yearlyEvents: Event = {
  id: '4',
  title: '매년 반복 일정',
  date: '2025-08-25',
  startTime: '09:00',
  endTime: '10:00',
  repeat: { type: 'yearly', interval: 1, endDate: '2027-08-25' },
  description: '',
  location: '',
  category: '',
  notificationTime: 0,
};

// 윤년 매년 반복 이벤트 (2024-02-29 시작, 2028년까지)
const leapYearEvents: Event = {
  id: '5',
  title: '윤년 반복 일정',
  date: '2024-02-29',
  startTime: '10:00',
  endTime: '11:00',
  repeat: { type: 'yearly', interval: 1, endDate: '2028-02-29' },
  description: '',
  location: '',
  category: '',
  notificationTime: 0,
};
describe('반복 유형 선택', () => {
  describe('사용자가 반복 유형을 매일로 설정한다', () => {
    it('2025-08-25 09:00에 시작하는 일정 생성 폼에서(given) 반복 유형을 2025-08-30까지 "매일"로 선택한 후에 일정을 추가하면(when) 2025-08-25부터 2025-08-30까지 매일 동일 시간대의 이벤트가 표시된다(then)', () => {
      const events = generateRecurringEvents(dailyEvents);
      const dates = events.map((e) => e.date);

      expect(dates).toEqual([
        '2025-08-25',
        '2025-08-26',
        '2025-08-27',
        '2025-08-28',
        '2025-08-29',
        '2025-08-30',
      ]);
    });
  });

  describe('사용자가 반복 유형을 매주로 설정한다', () => {
    it('2025-08-25(월요일) 09:00에 시작하는 일정 생성 폼에서(given) 반복 유형을 2025-09-08(월요일)까지 "매주"로 선택한 후에 일정을 추가하면(when) 2025-08-25, 2025-09-01, 2025-09-08 매주 동일 시간대의 이벤트가 표시된다(then)', () => {
      const events = generateRecurringEvents(weeklyEvents);
      const dates = events.map((e) => e.date);

      expect(dates).toEqual(['2025-08-25', '2025-09-01', '2025-09-08']);
    });
  });

  describe('사용자가 반복 유형을 매월로 설정한다', () => {
    it('2025-08-01 09:00에 시작하는 일정 생성 폼에서(given) 반복 유형을 2025-11월까지 "매월"로 선택한 후에 일정을 추가하면(when) 2025-08부터 2025-11까지 매월 동일 시간대의 이벤트가 표시된다(then)', () => {
      const events = generateRecurringEvents(monthlyEvents);
      const dates = events.map((e) => e.date);

      expect(dates).toEqual(['2025-08-01', '2025-09-01', '2025-10-01', '2025-11-01']);
    });
  });

  describe('사용자가 반복 유형을 매년으로 설정한다 (일자/월 고정)', () => {
    it('2025-08-25 09:00에 시작하는 일정 생성 폼에서(given) 반복 유형을 2027년까지 "매년"으로 선택한 후에 일정을 추가하면(when) 생성 결과에 2027년까지 매년 08-25 09:00 일정이 표시된다(then)', () => {
      const events = generateRecurringEvents(yearlyEvents);
      const dates = events.map((e) => e.date);

      expect(dates).toEqual(['2025-08-25', '2026-08-25', '2027-08-25']);
    });
  });

  describe('윤년 2024년 2월 29일에 매년 선택 시 2월 29일에만 생성된다', () => {
    it('2024-02-29 10:00에 시작하는 일정 생성 폼에서(given) 반복 유형을 2028년까지 "매년"으로 선택한 후에 일정을 추가하면(when) 2025, 2026 등 윤년이 아닌 해에는 생성되지 않고 다음 생성일은 2028-02-29 10:00이다(then)', () => {
      const events = generateRecurringEvents(leapYearEvents);
      const dates = events.map((e) => e.date);

      expect(dates).toEqual(['2024-02-29', '2028-02-29']);
    });
  });
});

describe('캘린더 뷰에서 반복 일정을 아이콘을 넣어 구분하여 표시한다.', () => {
  describe('반복 일정이 캘린더에 반복 아이콘으로 구분 표기된다', () => {
    it('반복 일정이 존재하는 상태에서(given) 캘린더를 렌더링하면(when) 반복 일정 아이콘이 표시된다(then)', () => {
      // Unit: UI 없이 로직만 검증
      expect(
        hasRecurringIcon([
          {
            id: '1',
            title: '반복 일정',
            date: '2025-08-25',
            startTime: '09:00',
            endTime: '10:00',
            repeat: { type: 'daily', interval: 1, endDate: '2025-08-30' },
            description: '',
            location: '',
            category: '',
            notificationTime: 0,
          },
        ])
      ).toBe(true);
      // 혼합 케이스(반복 + 단일)도 true
      expect(
        hasRecurringIcon([
          {
            id: '1',
            title: '반복 일정',
            date: '2025-08-25',
            startTime: '09:00',
            endTime: '10:00',
            repeat: { type: 'daily', interval: 1, endDate: '2025-08-30' },
            description: '',
            location: '',
            category: '',
            notificationTime: 0,
          },
          {
            id: '2',
            title: '단일 일정',
            date: '2025-08-25',
            startTime: '14:00',
            endTime: '15:00',
            repeat: { type: 'none', interval: 0 },
            description: '',
            location: '',
            category: '',
            notificationTime: 0,
          },
        ])
      ).toBe(true);
    });
  });

  describe('단일 일정에는 반복 아이콘이 표시되지 않는다', () => {
    it('반복 일정이 없는 상태에서(given) 캘린더를 렌더링하면(when) 반복 일정 아이콘이 표시되지 않는다(then)', () => {
      expect(
        hasRecurringIcon([
          {
            id: '2',
            title: '단일 일정',
            date: '2025-08-25',
            startTime: '14:00',
            endTime: '15:00',
            repeat: { type: 'none', interval: 0 },
            description: '',
            location: '',
            category: '',
            notificationTime: 0,
          },
        ])
      ).toBe(false);
      // 이벤트가 아예 없을 때도 false
      expect(hasRecurringIcon([])).toBe(false);
    });
  });
});

describe('반복 종료 조건 (특정 날짜까지)', () => {
  describe('사용자가 유효한 반복 종료일을 지정한다', () => {
    it("일정 생성 폼에서(given) '2025-08-25 ~ 2025-09-10'으로 매주 반복 일정을 생성하면(when) '2025-09-01'과 '2025-09-08'에 해당하는 2개의 반복 일정만 생성된다(then)", () => {
      const weeklyEvent: Event = {
        id: 'w1',
        title: '주간 반복',
        date: '2025-08-25', // 월요일
        startTime: '09:00',
        endTime: '10:00',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-09-10' },
        description: '',
        location: '',
        category: '',
        notificationTime: 0,
      };

      // when: 반복 일정 생성
      const generated = generateRecurringEvents(weeklyEvent);

      expect(generated[0].date).toEqual('2025-08-25');
      expect(generated[1].date).toEqual('2025-09-01');
      expect(generated[2].date).toEqual('2025-09-08');
    });
  });
});

describe('반복 일정 단일 수정', () => {
  it('매주 월요일 09시 반복 일정이 존재하고(given) 2025-09-01 09시 일정의 제목을 변경하면(when) 2025-09-01 09시 일정의 제목이 변경된다(then)', () => {
    // given: 2025-08-25 ~ 2025-09-08 매주 월요일 09:00
    const weekly: Event = {
      id: 'series-1',
      title: '주간 회의',
      date: '2025-08-25', // 월요일
      startTime: '09:00',
      endTime: '10:00',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-09-08' },
      description: '',
      location: '',
      category: '',
      notificationTime: 0,
    };

    const src = generateRecurringEvents(weekly);
    // 기대 날짜: 2025-08-25, 2025-09-01, 2025-09-08

    // when: 2025-09-01 09:00 occurrence의 제목만 변경
    const patched = updateRecurringOccurrence(src, {
      seriesId: 'series-1',
      date: '2025-09-01',
      startTime: '09:00',
      patch: { title: '주간 회의(안건 업데이트)' },
    });

    // then
    expect(patched).toHaveLength(3);

    // 해당 occurrence만 변경
    const d825 = patched.find((e) => e.date === '2025-08-25')!;
    const d901 = patched.find((e) => e.date === '2025-09-01')!;
    const d908 = patched.find((e) => e.date === '2025-09-08')!;

    expect(d825.title).toBe('주간 회의'); // 그대로
    expect(d901.title).toBe('주간 회의(안건 업데이트)'); // 변경됨
    expect(d908.title).toBe('주간 회의'); // 그대로
  });
});

describe('반복 일정 단일 삭제 (해당 발생만 삭제)', () => {
  it('매일 09시 반복 일정이 존재하고(given) 2025-08-27 09시 일정을 삭제하면(when) 2025-08-27 09시 일정이 캘린더에서 사라진다(then)', () => {
    // given: 2025-08-25 ~ 2025-08-30 매일 09:00
    const daily: Event = {
      id: 'series-daily-09',
      title: '매일 아침 미팅',
      date: '2025-08-25',
      startTime: '09:00',
      endTime: '10:00',
      repeat: { type: 'daily', interval: 1, endDate: '2025-08-30' },
      description: '',
      location: '',
      category: '',
      notificationTime: 0,
    };

    const src = generateRecurringEvents(daily);
    // 기대 생성 날짜: 25, 26, 27, 28, 29, 30 (총 6개)
    expect(src.map((e) => e.date)).toEqual([
      '2025-08-25',
      '2025-08-26',
      '2025-08-27',
      '2025-08-28',
      '2025-08-29',
      '2025-08-30',
    ]);

    // when: 2025-08-27 09:00 발생만 삭제
    const patched = deleteRecurringOccurrence(src, {
      seriesId: 'series-daily-09',
      date: '2025-08-27',
      startTime: '09:00',
    });

    // then: 27일만 빠지고 나머지는 유지
    expect(patched.map((e) => e.date)).toEqual([
      '2025-08-25',
      '2025-08-26',
      '2025-08-28',
      '2025-08-29',
      '2025-08-30',
    ]);
    // 27일이 존재하지 않아야 함
    expect(patched.find((e) => e.date === '2025-08-27' && e.startTime === '09:00')).toBeUndefined();
  });
});
