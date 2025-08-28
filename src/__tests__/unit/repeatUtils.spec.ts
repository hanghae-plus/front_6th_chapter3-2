import { generateRecurringEvents } from '../../utils/repeatLogic';

describe('반복 일정 생성', () => {
  describe('none 타입', () => {
    it('원본 이벤트만 반환한다', () => {
      const startDate = '2025-01-15';
      const repeatType = 'none';
      const interval = 1;

      const result = generateRecurringEvents(startDate, repeatType, interval);

      expect(result).toEqual([startDate]);
    });
  });

  describe('daily 타입', () => {
    it('매일 반복되는 일정을 생성한다', () => {
      const startDate = '2025-01-15';
      const repeatType = 'daily';
      const interval = 1;
      const repeatEndDate = '2025-01-18';

      const result = generateRecurringEvents(startDate, repeatType, interval, repeatEndDate);

      expect(result).toEqual(['2025-01-15', '2025-01-16', '2025-01-17', '2025-01-18']);
    });

    it('간격을 적용하여 반복한다', () => {
      const startDate = '2025-01-15';
      const repeatType = 'daily';
      const interval = 2; // 2일마다
      const repeatEndDate = '2025-01-25';

      const result = generateRecurringEvents(startDate, repeatType, interval, repeatEndDate);

      expect(result).toEqual([
        '2025-01-15',
        '2025-01-17',
        '2025-01-19',
        '2025-01-21',
        '2025-01-23',
        '2025-01-25',
      ]);
    });

    it('월말에서 다음 달로 넘어간다', () => {
      const startDate = '2025-01-30';
      const repeatType = 'daily';
      const interval = 1;
      const repeatEndDate = '2025-02-02';

      const result = generateRecurringEvents(startDate, repeatType, interval, repeatEndDate);

      expect(result).toEqual(['2025-01-30', '2025-01-31', '2025-02-01', '2025-02-02']);
    });
  });

  describe('weekly 타입', () => {
    it('매주 같은 요일에 반복한다', () => {
      // 2025-01-06은 월요일
      const startDate = '2025-01-06';
      const repeatType = 'weekly';
      const interval = 1;
      const repeatEndDate = '2025-01-27';

      const result = generateRecurringEvents(startDate, repeatType, interval, repeatEndDate);

      expect(result).toEqual([
        '2025-01-06', // 월요일
        '2025-01-13', // 월요일
        '2025-01-20', // 월요일
        '2025-01-27', // 월요일
      ]);
    });

    it('간격을 적용하여 반복한다', () => {
      const startDate = '2025-01-06';
      const repeatType = 'weekly';
      const interval = 2; // 2주마다
      const repeatEndDate = '2025-02-17';

      const result = generateRecurringEvents(startDate, repeatType, interval, repeatEndDate);

      expect(result).toEqual([
        '2025-01-06', // 월요일
        '2025-01-20', // 월요일 (2주 후)
        '2025-02-03', // 월요일 (4주 후)
        '2025-02-17', // 월요일 (6주 후)
      ]);
    });
  });

  describe('monthly 타입', () => {
    it('매월 같은 날짜에 반복한다', () => {
      const startDate = '2025-01-15';
      const repeatType = 'monthly';
      const interval = 1;
      const repeatEndDate = '2025-04-15';

      const result = generateRecurringEvents(startDate, repeatType, interval, repeatEndDate);

      expect(result).toEqual(['2025-01-15', '2025-02-15', '2025-03-15', '2025-04-15']);
    });

    it('31일 매월 반복 시 31일 없는 달은 건너뛴다', () => {
      const startDate = '2025-01-31';
      const repeatType = 'monthly';
      const interval = 1;
      const repeatEndDate = '2025-05-31';

      const result = generateRecurringEvents(startDate, repeatType, interval, repeatEndDate);

      expect(result).toEqual([
        '2025-01-31', // 1월 31일
        '2025-03-31', // 3월 31일 (2월 건너뜀)
        '2025-05-31', // 5월 31일 (4월 건너뜀)
      ]);
    });

    it('간격을 적용하여 반복한다', () => {
      const startDate = '2025-01-15';
      const repeatType = 'monthly';
      const interval = 2; // 2개월마다
      const repeatEndDate = '2025-07-15';

      const result = generateRecurringEvents(startDate, repeatType, interval, repeatEndDate);

      expect(result).toEqual(['2025-01-15', '2025-03-15', '2025-05-15', '2025-07-15']);
    });
  });

  describe('yearly 타입', () => {
    it('매년 같은 날짜에 반복한다', () => {
      const startDate = '2024-01-15';
      const repeatType = 'yearly';
      const interval = 1;
      const repeatEndDate = '2026-01-15';

      const result = generateRecurringEvents(startDate, repeatType, interval, repeatEndDate);

      expect(result).toEqual(['2024-01-15', '2025-01-15', '2026-01-15']);
    });

    it('윤년 2월 29일 반복 시 평년은 건너뛴다', () => {
      const startDate = '2024-02-29';
      const repeatType = 'yearly';
      const interval = 1;
      const repeatEndDate = '2029-02-29';

      const result = generateRecurringEvents(startDate, repeatType, interval, repeatEndDate);

      expect(result).toEqual([
        '2024-02-29', // 윤년
        '2028-02-29', // 다음 윤년 (2025,2026,2027 건너뜀)
      ]);
    });

    it('간격을 적용하여 반복한다', () => {
      const startDate = '2024-01-15';
      const repeatType = 'yearly';
      const interval = 2; // 2년마다
      const repeatEndDate = '2030-01-15';

      const result = generateRecurringEvents(startDate, repeatType, interval, repeatEndDate);

      expect(result).toEqual(['2024-01-15', '2026-01-15', '2028-01-15', '2030-01-15']);
    });
  });

  describe('반복 종료일 처리', () => {
    it('반복 종료일이 설정된 경우 해당 날짜까지만 반복한다', () => {
      const startDate = '2025-01-15';
      const repeatType = 'monthly';
      const interval = 1;
      const repeatEndDate = '2025-06-15';

      const result = generateRecurringEvents(startDate, repeatType, interval, repeatEndDate);

      expect(result).toEqual([
        '2025-01-15',
        '2025-02-15',
        '2025-03-15',
        '2025-04-15',
        '2025-05-15',
        '2025-06-15',
      ]);
    });

    it('반복 종료일이 시작일보다 이전인 경우 시작일만 반환한다', () => {
      const startDate = '2025-01-15';
      const repeatType = 'monthly';
      const interval = 1;
      const repeatEndDate = '2024-12-31';

      const result = generateRecurringEvents(startDate, repeatType, interval, repeatEndDate);

      expect(result).toEqual(['2025-01-15']);
    });
  });

  describe('기본 종료일 처리', () => {
    it('종료일이 설정되지 않은 경우 2025-10-30까지 반복한다', () => {
      const startDate = '2025-01-15';
      const repeatType = 'monthly';
      const interval = 1;

      const result = generateRecurringEvents(startDate, repeatType, interval);

      expect(result).toEqual([
        '2025-01-15',
        '2025-02-15',
        '2025-03-15',
        '2025-04-15',
        '2025-05-15',
        '2025-06-15',
        '2025-07-15',
        '2025-08-15',
        '2025-09-15',
        '2025-10-15',
      ]);
    });

    it('시작일이 2025-10-30 이전인 경우 정상적으로 반복한다', () => {
      const startDate = '2025-09-15';
      const repeatType = 'weekly';
      const interval = 1;

      const result = generateRecurringEvents(startDate, repeatType, interval);

      expect(result).toEqual([
        '2025-09-15',
        '2025-09-22',
        '2025-09-29',
        '2025-10-06',
        '2025-10-13',
        '2025-10-20',
        '2025-10-27',
      ]);
    });

    it('시작일이 2025-10-30 이후인 경우 시작일만 반환한다', () => {
      const startDate = '2025-11-01';
      const repeatType = 'weekly';
      const interval = 1;

      const result = generateRecurringEvents(startDate, repeatType, interval);

      expect(result).toEqual(['2025-11-01']);
    });
  });

  describe('반복 횟수 기반 종료', () => {
    it('특정 횟수만큼만 반복한다 (예: 5회)', () => {
      const startDate = '2025-01-15';
      const repeatType = 'weekly';
      const interval = 1;
      const maxOccurrences = 5;

      const result = generateRecurringEvents(
        startDate,
        repeatType,
        interval,
        undefined,
        maxOccurrences
      );

      expect(result).toEqual([
        '2025-01-15',
        '2025-01-22',
        '2025-01-29',
        '2025-02-05',
        '2025-02-12',
      ]);
    });

    it('반복 횟수가 0이거나 음수인 경우 시작일만 반환한다', () => {
      const startDate = '2025-01-15';
      const repeatType = 'daily';
      const interval = 1;

      const resultZero = generateRecurringEvents(startDate, repeatType, interval, undefined, 0);
      const resultNegative = generateRecurringEvents(
        startDate,
        repeatType,
        interval,
        undefined,
        -1
      );

      expect(resultZero).toEqual(['2025-01-15']);
      expect(resultNegative).toEqual(['2025-01-15']);
    });
  });

  describe('복합 종료 조건', () => {
    it('종료일과 반복 횟수가 모두 설정된 경우 더 먼저 도달하는 조건으로 종료한다', () => {
      const startDate = '2025-01-15';
      const repeatType = 'weekly';
      const interval = 1;
      const repeatEndDate = '2025-03-15';
      const maxOccurrences = 10;

      const result = generateRecurringEvents(
        startDate,
        repeatType,
        interval,
        repeatEndDate,
        maxOccurrences
      );

      // 2025-01-15부터 2025-03-15까지는 약 8주, 하지만 10회 반복이 가능
      // 더 먼저 도달하는 조건(종료일)으로 종료
      expect(result).toEqual([
        '2025-01-15',
        '2025-01-22',
        '2025-01-29',
        '2025-02-05',
        '2025-02-12',
        '2025-02-19',
        '2025-02-26',
        '2025-03-05',
        '2025-03-12',
      ]);
    });

    it('반복 횟수가 설정되지 않은 경우 종료일까지만 반복한다', () => {
      const startDate = '2025-01-15';
      const repeatType = 'monthly';
      const interval = 1;
      const repeatEndDate = '2025-06-15';

      const result = generateRecurringEvents(startDate, repeatType, interval, repeatEndDate);

      expect(result).toEqual([
        '2025-01-15',
        '2025-02-15',
        '2025-03-15',
        '2025-04-15',
        '2025-05-15',
        '2025-06-15',
      ]);
    });

    it('반복 횟수가 설정된 경우 종료일을 무시하고 횟수만큼 반환한다', () => {
      const startDate = '2025-01-15';
      const repeatType = 'weekly';
      const interval = 1;
      const repeatEndDate = '2025-12-31';
      const maxOccurrences = 3;

      const result = generateRecurringEvents(
        startDate,
        repeatType,
        interval,
        repeatEndDate,
        maxOccurrences
      );

      // 종료일을 무시하고 3회만 반복
      expect(result).toEqual(['2025-01-15', '2025-01-22', '2025-01-29']);
    });
  });
});
