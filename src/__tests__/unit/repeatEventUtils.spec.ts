import { EventForm, Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import {
  isLeapYear,
  fixEndDate,
  REPEAT_MAX_END_DATE,
  generateDailyDates,
  generateWeeklyDates,
  generateMonthlyDates,
  generateYearlyDates,
  buildRecurringEvents,
  isRecurring,
  toSingleEventForm, removeEventById,
} from '../../utils/repeatUtils.ts';
import { makeEventForm } from '../utils.ts';

describe('반복 일정 Unit Test', () => {
  it('해가 윤년이라면 true를 반환한다.', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
  });

  it('종료일 미지정/상한 초과 시 2025-10-30으로 반영한다.', () => {
    expect(formatDate(fixEndDate())).toBe('2025-10-30');
    expect(formatDate(fixEndDate('2025-10-15'))).toBe('2025-10-15');
    expect(formatDate(fixEndDate('2026-01-01'))).toBe('2025-10-30');
    expect(formatDate(REPEAT_MAX_END_DATE)).toBe('2025-10-30');
  });

  it('일정 날짜 구하기 - 일 단위로 날짜를 반환한다.', () => {
    const startDate = '2025-10-28';
    const endDate = '2025-10-30';
    const dates = generateDailyDates(startDate, endDate);
    expect(dates).toEqual(['2025-10-28', '2025-10-29', '2025-10-30']);
  });

  it('일정 날짜 구하기 - 주 단위로 날짜를 반환한다.', () => {
    const startDate = '2025-10-10';
    const endDate = '2025-10-30';
    const dates = generateWeeklyDates(startDate, endDate);
    expect(dates).toEqual(['2025-10-10', '2025-10-17', '2025-10-24']);
  });

  it('일정 날짜 구하기 - 월 단위로 날짜를 반환한다.', () => {
    const datesWith31 = generateMonthlyDates('2025-08-31', '2025-11-30');
    expect(datesWith31).toEqual(['2025-08-31', '2025-10-31']);
    expect(datesWith31).toHaveLength(2);
    expect(datesWith31).not.toContain('2025-09-30');
    expect(datesWith31).not.toContain('2025-11-30');

    const datesWith30 = generateMonthlyDates('2025-04-30', '2025-06-30');
    expect(datesWith30).toEqual(['2025-04-30', '2025-05-30', '2025-06-30']);
    expect(datesWith30).toContain('2025-05-30');
    expect(datesWith30).not.toContain('2025-05-31');
  });

  it('일정 날짜 구하기 - 연 단위로 날짜를 반환한다.', () => {
    const datesWithLeap = generateYearlyDates('2024-02-29', '2030-12-31');
    expect(datesWithLeap).toEqual(['2024-02-29', '2028-02-29']);
    expect(datesWithLeap).toHaveLength(2);
    expect(datesWithLeap).not.toContain('2025-02-29');
    expect(datesWithLeap).not.toContain('2026-02-29');

    const datesWithoutLeap = generateYearlyDates('2025-02-28', '2027-03-01');
    expect(datesWithoutLeap).toEqual(['2025-02-28', '2026-02-28', '2027-02-28']);
    expect(datesWithoutLeap).toContain('2026-02-28');
  });

  it('반복된 일정에 맞춰 이벤트 생성하기 - daily', () => {
    const eventFormData: EventForm = {
      title: 'Daily 일정 만들어랏',
      date: '2025-10-28', // 시작일
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: 'default',
      repeat: { type: 'daily', interval: 1 },
      notificationTime: 0,
    };

    const events = buildRecurringEvents(eventFormData);

    // 만들어진 날짜 확인
    expect(events.map((event: EventForm) => event.date)).toEqual([
      '2025-10-28',
      '2025-10-29',
      '2025-10-30',
    ]);
    // 개수 확인
    expect(events).toHaveLength(3);
    // 일부 필드 보존 확인
    expect(events[0].title).toBe('Daily 일정 만들어랏');
    expect(events[0].startTime).toBe('09:00');
    expect(events[0].endTime).toBe('10:00');
    // 반복 타입은 유지 (아이콘 표시용)
    expect(events.every((event: EventForm) => event.repeat?.type === 'daily')).toBe(true);
  });

  it('단일 수정/아이콘 - 반복 해제 시 반복 아이콘이 사라진다.', () => {
    const eventFormData = makeEventForm({
      date: '2025-10-01',
      repeat: { type: 'daily', endDate: '2025-10-22', interval: 77 },
      title: 'daily인척 daily인 일정',
    });

    // 반복 아이콘 flag용
    expect(isRecurring(eventFormData)).toBe(true);

    const singleEventForm = toSingleEventForm(eventFormData);

    // 반복 설정 해제
    expect(singleEventForm.repeat.type).toBe('none');
    expect(singleEventForm.repeat.interval).toBe(1);
    expect(singleEventForm.repeat.endDate).toBeUndefined();

    // 나머지 필드는 그대로 유지
    expect(singleEventForm.title).toBe(eventFormData.title);
    expect(singleEventForm.date).toBe(eventFormData.date);
    expect(singleEventForm.startTime).toBe(eventFormData.startTime);
    expect(singleEventForm.endTime).toBe(eventFormData.endTime);

    // 반복 아이콘 해제
    expect(isRecurring(singleEventForm)).toBe(false);
  });

  it('이미 비반복인 일정에 단일 수정 적용해도 동일하게 아이콘은 보이지 않는다.', () => {
    const nonRepeatEventForm = makeEventForm({
      repeat: { type: 'none', interval: 1, endDate: undefined },
    });

    expect(isRecurring(nonRepeatEventForm)).toBe(false);

    const singleEventForm = toSingleEventForm(nonRepeatEventForm);

    expect(singleEventForm.repeat.type).toBe('none');
    expect(singleEventForm.repeat.endDate).toBeUndefined();
    expect(singleEventForm.date).toBe(nonRepeatEventForm.date);
    expect(singleEventForm.title).toBe(nonRepeatEventForm.title);
  });

  it('단일 삭제 - 해당 id만 제거된다.', () => {
    const event1: Event = {
      id: '1',
      title: '반복1-id1',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: 'default',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-10-22' },
      notificationTime: 0,
    };
    const event2: Event = {
      id: '2',
      title: '반복1-id2',
      date: '2025-10-08',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: 'default',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-10-22' },
      notificationTime: 0,
    };
    const event3: Event = {
      id: '3',
      title: '단일-id3',
      date: '2025-10-05',
      startTime: '13:00',
      endTime: '14:00',
      description: '',
      location: '',
      category: 'default',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };

    const original = [event1, event2, event3];
    const next = removeEventById(original, '2');

    // id가 2인 이벤트만 제거됨
    expect(next).toHaveLength(2);
    expect(next.some((event: Event) => event.id === '1')).toBe(true);
    expect(next.some((event: Event) => event.id === '2')).toBe(false);
    expect(next.some((event: Event) => event.id === '3')).toBe(true);

    // 원본은 변하지 않는다
    expect(original).toHaveLength(3);
  });
});
