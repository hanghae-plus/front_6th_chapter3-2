import { generateRepeatSchedules } from '../../utils/repeatScheduleUtils';

// 1. **(필수) 반복 유형 선택**
//     - 일정 생성 또는 수정 시 반복 유형을 선택할 수 있다.
//     - 반복 유형은 다음과 같다: 매일, 매주, 매월, 매년
//         - 31일에 매월을 선택한다면 → 매월 마지막이 아닌, 31일에만 생성하세요.
//         - 윤년 29일에 매년을 선택한다면 → 29일에만 생성하세요!
// 2. **(필수) 반복 일정 표시**
//     - 캘린더 뷰에서 반복 일정을 아이콘을 넣어 구분하여 표시한다.
// 3. **(필수) 반복 종료**
//     - 반복 종료 조건을 지정할 수 있다.
//     - 옵션: 특정 날짜까지
//         - 예제 특성상, 2025-10-30까지 최대 일자를 만들어 주세요.
// 4. **(필수) 반복 일정 단일 수정**
//     - 반복일정을 수정하면 단일 일정으로 변경됩니다.
//     - 반복일정 아이콘도 사라집니다.
// 5. **(필수) 반복 일정 단일 삭제**
//     - 반복일정을 삭제하면 해당 일정만 삭제합니다.

// <선택 과제>

// 1. 반복 간격 설정
//     - 각 반복 유형에 대해 간격을 설정할 수 있다.
//     - 예: 2일마다, 3주마다, 2개월마다 등  → 제거
//         - 반복종료 조건은 횟수는 10회로 제한해주세요.
// 2. 예외 날짜 처리:
//     - 반복 일정 중 특정 날짜를 제외할 수 있다.
//     - 반복 일정 중 특정 날짜의 일정을 수정할 수 있다.
// 3. 요일 지정 (주간 반복의 경우):
//     - 주간 반복 시 특정 요일을 선택할 수 있다.
// 4. 월간 반복 옵션:
//     - 매월 특정 날짜에 반복되도록 설정할 수 있다.
//     - 매월 특정 순서의 요일에 반복되도록 설정할 수 있다.
// 5. 반복 일정 전체 수정 및 삭제
//     - 반복 일정의 모든 일정을 수정할 수 있다.
//     - 반복 일정의 모든 일정을 삭제할 수 있다.

describe('generateRepeatSchedules', () => {
  it('31일에 매월 반복 일정을 선택한다면, 매월 마지막이 아닌, 31일에만 반복 일정을 생성한다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2025-05-31',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'monthly', interval: 1, endDate: '2025-10-10' },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual(['2025-05-31', '2025-07-31', '2025-08-31']);
  });

  it('윤년 29일에 매년 반복 일정을 선택한다면, 29일에만 반복 일정을 생성한다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2020-02-29',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'yearly', interval: 1, endDate: '2025-10-10' },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual(['2020-02-29', '2024-02-29']);
  });

  it('매일 반복 시 반복 종료일을 설정하지 않으면, 2025-10-30일까지 반복 일정을 생성한다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2025-10-21',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1 },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual([
      '2025-10-21',
      '2025-10-22',
      '2025-10-23',
      '2025-10-24',
      '2025-10-25',
      '2025-10-26',
      '2025-10-27',
      '2025-10-28',
      '2025-10-29',
      '2025-10-30',
    ]);
  });

  it('매주 반복 시 반복 종료일을 설정하지 않으면, 2025-10-30일까지 반복 일정을 생성한다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual(['2025-10-01', '2025-10-08', '2025-10-15', '2025-10-22', '2025-10-29']);
  });

  it('매월 반복 시 반복 종료일을 설정하지 않으면, 2025-10-30일까지 반복 일정을 생성한다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2025-08-21',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'monthly', interval: 1 },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual(['2025-08-21', '2025-09-21', '2025-10-21']);
  });

  it('매년 반복 시 반복 종료일을 설정하지 않으면, 2025-10-30일까지 반복 일정을 생성한다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2025-08-21',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'yearly', interval: 1 },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual(['2025-08-21']);
  });

  it('매일 반복 시 시작일부터 종료일까지 날짜가 생성된다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2025-08-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1, endDate: '2025-08-10' },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual([
      '2025-08-01',
      '2025-08-02',
      '2025-08-03',
      '2025-08-04',
      '2025-08-05',
      '2025-08-06',
      '2025-08-07',
      '2025-08-08',
      '2025-08-09',
      '2025-08-10',
    ]);
  });

  it('매주 반복 시 시작일부터 종료일까지 날짜가 생성된다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2025-08-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-08-10' },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual(['2025-08-01', '2025-08-08']);
  });

  it('매월 반복 시 시작일부터 종료일까지 날짜가 생성된다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2025-06-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'monthly', interval: 1, endDate: '2025-08-10' },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual(['2025-06-01', '2025-07-01', '2025-08-01']);
  });

  it('매년 반복 시 시작일부터 종료일까지 날짜가 생성된다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2023-06-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'yearly', interval: 1, endDate: '2025-08-10' },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual(['2023-06-01', '2024-06-01', '2025-06-01']);
  });

  it('2일 간격 반복 시, 시작일부터 종료일까지 2일 간격 날짜가 생성된다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2025-08-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 2, endDate: '2025-08-10' },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual(['2025-08-01', '2025-08-03', '2025-08-05', '2025-08-07', '2025-08-09']);
  });

  it('2주 간격 반복 시, 시작일부터 종료일까지 2주 간격 날짜가 생성된다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'weekly', interval: 2, endDate: '2025-08-10' },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual(['2025-07-01', '2025-07-15', '2025-07-29']);
  });

  it('2달 간격 반복 시, 시작일부터 종료일까지 2달 간격 날짜가 생성된다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2025-06-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'monthly', interval: 2, endDate: '2025-08-10' },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual(['2025-06-01', '2025-08-01']);
  });

  it('2년 간격 반복 시, 시작일부터 종료일까지 2년 간격 날짜가 생성된다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2023-06-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'yearly', interval: 2, endDate: '2025-08-10' },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual(['2023-06-01', '2025-08-01']);
  });

  it('매일 반복 시, 반복 간격이 10일을 넘어가면, 반복 일정 간격은 10일로 설정된다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 15, endDate: '2025-08-10' },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual(['2025-07-01', '2025-07-11', '2025-07-21', '2025-07-31', '2025-08-10']);
  });

  it('매주 반복 시, 반복 간격이 10주를 넘어가면, 반복 일정 간격은 10주로 설정된다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2025-05-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'weekly', interval: 15, endDate: '2025-08-10' },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual(['2025-05-01', '2025-07-10']);
  });

  it('매월 반복 시, 반복 간격이 10달을 넘어가면, 반복 일정 간격은 10달로 설정된다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2024-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'monthly', interval: 15, endDate: '2025-08-10' },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual(['2024-07-01', '2025-05-01']);
  });

  it('매년 반복 시, 반복 간격이 10년을 넘어가면, 반복 일정 간격은 10년으로 설정된다.', () => {
    const events = generateRepeatSchedules({
      title: '',
      date: '2014-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'yearly', interval: 15, endDate: '2025-08-10' },
      notificationTime: 10,
    });

    const dates = events.map((event) => event.date);

    expect(dates).toEqual(['2014-07-01', '2025-07-01']);
  });
});
