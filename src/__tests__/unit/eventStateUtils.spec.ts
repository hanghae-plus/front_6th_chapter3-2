import {
  getRepeatingEvents,
  groupEventsByRepeatType,
  isRepeatingEvent,
  getRepeatDisplayInfo,
} from '../../utils/eventStateUtils';
import { createEvent } from '../../utils/eventUtils';

describe('반복 일정 판별 함수 테스트', () => {
  it('반복 일정을 올바르게 판별한다', () => {
    const repeatingEvent = createEvent('repeating', 'weekly', 1);
    const singleEvent = createEvent('single', 'none', 1);

    expect(isRepeatingEvent(repeatingEvent)).toBe(true);
    expect(isRepeatingEvent(singleEvent)).toBe(false);
  });

  it('반복 일정 표시 정보를 올바르게 생성한다', () => {
    const weeklyEvent = createEvent('repeating', 'weekly', 2);
    const result = getRepeatDisplayInfo(weeklyEvent);

    expect(result.isRepeating).toBe(true);
    expect(result.repeatText).toBe('2주마다');
    expect(result.shouldShowIcon).toBe(true);
  });

  it('단일 일정의 경우 아이콘을 표시하지 않는다', () => {
    const singleEvent = createEvent('single', 'none', 1);
    const result = getRepeatDisplayInfo(singleEvent);

    expect(result.isRepeating).toBe(false);
    expect(result.repeatText).toBe('');
    expect(result.shouldShowIcon).toBe(false);
  });
});

describe('반복 일정 필터링 함수 테스트', () => {
  it('반복 일정만 필터링한다', () => {
    const events = [
      createEvent('repeating', 'weekly', 1),
      createEvent('single', 'none', 1),
      createEvent('repeating', 'monthly', 1),
    ];

    const repeatingEvents = getRepeatingEvents(events);
    expect(repeatingEvents).toHaveLength(2);
  });

  it('반복 유형별로 일정을 그룹화한다', () => {
    const events = [
      createEvent('repeating', 'weekly', 1),
      createEvent('repeating', 'monthly', 1),
      createEvent('repeating', 'weekly', 2),
    ];

    const groups = groupEventsByRepeatType(events);
    expect(groups.weekly).toHaveLength(2);
    expect(groups.monthly).toHaveLength(1);
  });
});
