import { Event } from '../../types';
import { repeatingDates } from '../../utils/repeatingDates';

describe('repeatingDates', () => {
  it('매일 반복 --> 시작일부터 종료일까지 매일 생성한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
        notificationTime: 10,
      },
    ];
    const result = repeatingDates(events[0]);
    expect(result[0].date).toBe('2025-10-01');
    expect(result[1].date).toBe('2025-10-02');
    expect(result[2].date).toBe('2025-10-03');
    expect(result[3].date).toBe('2025-10-04');
    expect(result[4].date).toBe('2025-10-05');
  });

  it('매주 반복 --> 시작일부터 종료일까지 매주 생성한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-10-18' },
        notificationTime: 10,
      },
    ];
    const result = repeatingDates(events[0]);
    expect(result[0].date).toBe('2025-10-01');
    expect(result[1].date).toBe('2025-10-08');
    expect(result[2].date).toBe('2025-10-15');
  });

  it('매월 반복 --> 31일에 시작하면 31일이 있는 달에만 생성한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-10-31',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      },
    ];
    const result = repeatingDates(events[0]);
    expect(result[0].date).toBe('2025-10-31');
    expect(result[1].date).toBe('2025-12-31');
  });

  it('매년 반복 --> 윤년 2월 29일에 시작하면 2월 29일이 있는 해에만 생성한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-02-29',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: { type: 'yearly', interval: 1, endDate: '2032-12-31' },
        notificationTime: 10,
      },
    ];
    const result = repeatingDates(events[0]);
    expect(result[0].date).toBe('2024-02-29');
    expect(result[1].date).toBe('2028-02-29');
    expect(result[2].date).toBe('2032-02-29');
  });

  it('반복 일정의 종료일을 지정하지 않으면 2025-10-30까지만 반복 일정이 생성된다', async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: { type: 'daily', interval: 5 },
        notificationTime: 10,
      },
    ];

    const result = repeatingDates(events[0]);
    expect(result[0].date).toBe('2025-10-01');
    expect(result[1].date).toBe('2025-10-06');
    expect(result[2].date).toBe('2025-10-11');
    expect(result[3].date).toBe('2025-10-16');
    expect(result[4].date).toBe('2025-10-21');
    expect(result[5].date).toBe('2025-10-26');
  });

  it('반복 일정 중 하나를 수정하면 해당 일정만 repeat.type이 none으로 변경된다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
        notificationTime: 10,
      },
    ];
    const result = repeatingDates(events[0]);
    const modified = result.map((event) =>
      event.date === '2025-10-03' ? { ...event, repeat: { type: 'none' } } : event
    );

    console.log(modified);

    expect(modified[2].repeat.type).toBe('none');

    expect(modified[0].repeat.type).toBe('daily');
    expect(modified[1].repeat.type).toBe('daily');
    expect(modified[3].repeat.type).toBe('daily');
    expect(modified[4].repeat.type).toBe('daily');
  });

  it('반복 일정 중 하나를 삭제하면 해당 일정만 삭제된다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
        notificationTime: 10,
      },
    ];
    const result = repeatingDates(events[0]);
    const deleted = result.filter((event) => event.date !== '2025-10-03');

    expect(deleted.find((e) => e.date === '2025-10-03')).toBeUndefined();
    expect(deleted.length).toBe(4);
    expect(deleted[0].date).toBe('2025-10-01');
    expect(deleted[1].date).toBe('2025-10-02');
    expect(deleted[2].date).toBe('2025-10-04');
    expect(deleted[3].date).toBe('2025-10-05');
  });
});
