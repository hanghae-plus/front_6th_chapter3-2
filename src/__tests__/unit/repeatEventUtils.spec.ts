import { describe, it } from 'vitest';

import { EventForm } from '../../types';
import {
  formatDateString,
  generateRepeatEvents,
  getRepeatEndDate,
} from '../../utils/repeatEventUtils';

describe('formatDateString', () => {
  it('date를 yyyy-mm-dd 형식의 문자열로 반환한다', () => {
    const date = new Date('2025-10-26');

    expect(formatDateString(date)).toBe('2025-10-26');
  });
});

describe('getRepeatEndDate', () => {
  it('endDate가 없으면 2025-10-30을 반환한다', () => {
    expect(getRepeatEndDate()).toEqual(new Date('2025-10-30'));
  });

  it('endDate가 있으면 해당 날짜를 반환한다', () => {
    expect(getRepeatEndDate('2025-10-26')).toEqual(new Date('2025-10-26'));
  });
});

describe('generateRepeatEvents', () => {
  const baseEvent: EventForm = {
    title: '기존 회의',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('repeat type이 daily면 매일 반복된 이벤트를 반환한다', () => {
    const event: EventForm = {
      ...baseEvent,
      date: '2025-10-26',
      repeat: { type: 'daily', interval: 1 },
    };
    const events = generateRepeatEvents(event);

    expect(events).toHaveLength(5);
    expect(events[0].date).toBe('2025-10-26');
    expect(events[1].date).toBe('2025-10-27');
    expect(events[2].date).toBe('2025-10-28');
    expect(events[3].date).toBe('2025-10-29');
    expect(events[4].date).toBe('2025-10-30');
  });

  it('repeat type이 weekly면 매주 반복된 이벤트를 반환한다', () => {
    const event: EventForm = {
      ...baseEvent,
      date: '2025-10-01',
      repeat: { type: 'weekly', interval: 1 },
    };

    const events = generateRepeatEvents(event);

    expect(events).toHaveLength(5);
    expect(events[0].date).toBe('2025-10-01');
    expect(events[1].date).toBe('2025-10-08');
    expect(events[2].date).toBe('2025-10-15');
    expect(events[3].date).toBe('2025-10-22');
    expect(events[4].date).toBe('2025-10-29');
  });

  it('repeat type이 monthly면 매월 반복된 이벤트를 반환한다', () => {
    const event: EventForm = {
      ...baseEvent,
      date: '2025-08-01',
      repeat: { type: 'monthly', interval: 1 },
    };

    const events = generateRepeatEvents(event);

    expect(events).toHaveLength(3);
    expect(events[0].date).toBe('2025-08-01');
    expect(events[1].date).toBe('2025-09-01');
    expect(events[2].date).toBe('2025-10-01');
  });

  it('repeat type이 yearly면 매년 반복된 이벤트를 반환한다', () => {
    const event: EventForm = {
      ...baseEvent,
      date: '2023-01-01',
      repeat: { type: 'yearly', interval: 1 },
    };

    const events = generateRepeatEvents(event);

    expect(events).toHaveLength(3);
    expect(events[0].date).toBe('2023-01-01');
    expect(events[1].date).toBe('2024-01-01');
    expect(events[2].date).toBe('2025-01-01');
  });

  it('매월 31일 반복 시 31일이 없는 달은 스킵한다', () => {
    const event: EventForm = {
      ...baseEvent,
      date: '2025-05-31',
      repeat: { type: 'monthly', interval: 1 },
    };

    const events = generateRepeatEvents(event);

    expect(events).toHaveLength(3);
    expect(events[0].date).toBe('2025-05-31');
    expect(events[1].date).toBe('2025-07-31');
    expect(events[2].date).toBe('2025-08-31');
  });

  it('매년 2월 29일 반복 시 평년은 스킵하고 윤년에만 생성한다', () => {
    const event: EventForm = {
      ...baseEvent,
      date: '2020-02-29',
      repeat: { type: 'yearly', interval: 1 },
    };

    const events = generateRepeatEvents(event);

    expect(events).toHaveLength(2);
    expect(events[0].date).toBe('2020-02-29');
    expect(events[1].date).toBe('2024-02-29');
  });

  it('endDate 이후 일정은 반환하지 않는다', () => {
    const event: EventForm = {
      ...baseEvent,
      date: '2025-10-26',
      repeat: { type: 'daily', interval: 1, endDate: '2025-10-28' },
    };
    const events = generateRepeatEvents(event);

    expect(events).toHaveLength(3);
    expect(events[0].date).toBe('2025-10-26');
    expect(events[1].date).toBe('2025-10-27');
    expect(events[2].date).toBe('2025-10-28');
  });

  it('endDate가 없으면 최대 2025-10-30까지 반복된 이벤트를 반환한다', () => {
    const event: EventForm = {
      ...baseEvent,
      date: '2025-10-26',
      repeat: { type: 'daily', interval: 1 },
    };
    const events = generateRepeatEvents(event);

    expect(events).toHaveLength(5);
    expect(events[0].date).toBe('2025-10-26');
    expect(events[1].date).toBe('2025-10-27');
    expect(events[2].date).toBe('2025-10-28');
    expect(events[3].date).toBe('2025-10-29');
    expect(events[4].date).toBe('2025-10-30');
  });

  it('interval이 2면 2일, 2주, 2개월, 2년 주기로 반복된 이벤트를 반환한다', () => {
    const event: EventForm = {
      ...baseEvent,
      date: '2025-10-26',
      repeat: { type: 'daily', interval: 2 },
    };
    const events = generateRepeatEvents(event);

    expect(events).toHaveLength(3);
    expect(events[0].date).toBe('2025-10-26');
    expect(events[1].date).toBe('2025-10-28');
    expect(events[2].date).toBe('2025-10-30');

    const event2: EventForm = {
      ...baseEvent,
      date: '2025-10-01',
      repeat: { type: 'weekly', interval: 2 },
    };
    const events2 = generateRepeatEvents(event2);

    expect(events2).toHaveLength(3);
    expect(events2[0].date).toBe('2025-10-01');
    expect(events2[1].date).toBe('2025-10-15');
    expect(events2[2].date).toBe('2025-10-29');

    const event3: EventForm = {
      ...baseEvent,
      date: '2025-06-01',
      repeat: { type: 'monthly', interval: 2 },
    };
    const events3 = generateRepeatEvents(event3);

    expect(events3).toHaveLength(3);
    expect(events3[0].date).toBe('2025-06-01');
    expect(events3[1].date).toBe('2025-08-01');
    expect(events3[2].date).toBe('2025-10-01');

    const event4: EventForm = {
      ...baseEvent,
      date: '2023-01-01',
      repeat: { type: 'yearly', interval: 2 },
    };
    const events4 = generateRepeatEvents(event4);

    expect(events4).toHaveLength(2);
    expect(events4[0].date).toBe('2023-01-01');
    expect(events4[1].date).toBe('2025-01-01');
  });
});
