import { generateRepeatDates } from '../../utils/repeatEventUtils';

describe('반복 종료 테스트', () => {
  it('반복 종료 조건을 지정할 수 있다', () => {
    // Given: 반복 종료 조건을 지정하는 경우
    const event = {
      date: '2025-01-01',
      repeatType: 'weekly' as const,
      interval: 1,
      endDate: '2025-02-26',
    };

    // When: 반복 종료 조건을 지정할 때
    const repeatDates = generateRepeatDates(event);

    // Then: 반복 종료 조건이 적용되어야 한다
    expect(repeatDates).toEqual([
      '2025-01-01',
      '2025-01-08',
      '2025-01-15',
      '2025-01-22',
      '2025-01-29',
      '2025-02-05',
      '2025-02-12',
      '2025-02-19',
      '2025-02-26',
    ]);
  });

  it('특정 날짜까지 반복 일정을 생성한다', () => {
    // Given: 특정 날짜까지 반복 일정을 생성하는 경우
    const event = {
      date: '2025-01-31',
      repeatType: 'monthly' as const,
      interval: 1,
      endDate: '2025-08-31',
    };

    // When: 특정 날짜까지 반복 일정을 생성할 때
    const repeatDates = generateRepeatDates(event);

    // Then: 특정 날짜까지 반복 일정이 생성되어야 한다
    expect(repeatDates).toEqual([
      '2025-01-31',
      '2025-03-31',
      '2025-05-31',
      '2025-07-31',
      '2025-08-31',
    ]);
  });

  it('2025-10-30까지 최대 일자를 생성한다', () => {
    // Given: 2025-10-30까지 최대 일자를 생성하는 경우
    const event = {
      date: '2025-01-01',
      repeatType: 'daily' as const,
      interval: 1,
      endDate: '2025-10-30',
    };

    // When: 2025-10-30까지 최대 일자를 생성할 때
    const repeatDates = generateRepeatDates(event);

    // Then: 2025-10-30까지 최대 일자가 생성되어야 한다
    expect(repeatDates.length).toBe(303); // 1월 1일부터 10월 30일까지 총 303일
    expect(repeatDates[0]).toBe('2025-01-01'); // 시작일
    expect(repeatDates[repeatDates.length - 1]).toBe('2025-10-30'); // 종료일
  });
});
