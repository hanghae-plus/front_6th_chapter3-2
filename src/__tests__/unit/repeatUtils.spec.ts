import { Event, EventForm } from '../../types';
import { toSingleEvent, checkEndDateValid, getRepeatEventList } from '../../utils/repeatUtils';

describe('toSingleEvent', () => {
  const event: Event = {
    id: '1',
    title: '이벤트 1',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'daily', interval: 1 },
    notificationTime: 0,
  };

  it('반복 일정을 단일 일정으로 수정하여 반환한다', () => {
    const result = toSingleEvent(event);
    expect(result).toEqual({
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    });
  });
});

describe('checkEndDateValid', () => {
  it('시작일이 종료일보다 앞이면 true를 반환한다', () => {
    const startDate = new Date('2025-10-15');
    const endDate = new Date('2025-10-30');
    expect(checkEndDateValid(startDate, endDate)).toBe(true);
  });

  it('시작일이 종료일보다 뒤이면 false를 반환한다', () => {
    const startDate = new Date('2025-10-15');
    const endDate = new Date('2025-10-10');
    expect(checkEndDateValid(startDate, endDate)).toBe(false);
  });
});

describe('getRepeatEventList', () => {
  const dailyEvent: EventForm = {
    title: '이벤트 1',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'daily', interval: 1, endDate: '2025-07-15' },
    notificationTime: 0,
  };

  const weeklyEvent: EventForm = {
    title: '이벤트 1',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'weekly', interval: 2, endDate: '2025-07-30' },
    notificationTime: 0,
  };

  it('반복 유형에 맞게 일정이 생성된다', () => {
    const result = getRepeatEventList(dailyEvent);
    expect(result.length).toBe(15);
  });

  it('반복 간격에 맞게 일정이 생성된다', () => {
    const result = getRepeatEventList(weeklyEvent);
    expect(result.length).toBe(3); // 2025-07-01, 2025-07-15, 2025-07-29
  });
});
