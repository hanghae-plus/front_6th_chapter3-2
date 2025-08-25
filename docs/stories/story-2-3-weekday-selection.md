# Story 2.3: 반복 일정 요일 지정 기능 구현

## 스토리 설명

**As a** 캘린더 사용자  
**I want** 주간 반복 일정에서 특정 요일만 선택하여 반복되도록 설정할 수 있도록  
**So that** 매주 특정 요일에만 발생하는 일정을 효율적으로 관리할 수 있습니다.

## 개요

이 스토리는 주간 반복 일정에서 특정 요일만 선택하여 반복되도록 하는 기능을 구현합니다. 사용자는 월요일부터 일요일까지 원하는 요일을 선택할 수 있으며, 선택된 요일에만 일정이 반복됩니다.

## 선행 조건

1. Story 2.1 (고급 반복 간격 설정) 완료
2. Story 2.2 (예외 날짜 처리) 완료
3. 기존 반복 일정 생성/수정 UI 구현 완료

## 기술적 제약사항

1. 기존 API 엔드포인트 구조 유지
2. JSON 파일 기반 데이터 저장 구조 활용
3. Material-UI 컴포넌트 패턴 준수
4. TypeScript 타입 안정성 보장

## 상세 요구사항

### 1. 데이터 구조 확장
- [x] RepeatInfo 타입에 weekdays 필드 추가 (number[] 타입, 0-6)
- [ ] weekdayPatterns 필드 추가 (예: "평일만", "주말만")
- [x] 요일 선택 정보 저장 구조 설계
- [x] 기존 반복 일정 데이터와의 호환성 유지
- [x] 버전 관리를 위한 version 필드 추가

### 2. UI 구현
- [x] 반복 유형이 '주간'일 때만 요일 선택 UI 표시 (버튼 토글 간이 구현)
- [x] Material-UI ToggleButton 활용한 요일 선택 컴포넌트
- [x] 선택된 요일 시각적 피드백 (contained/outlined)
- [x] 요일 선택에 따른 반복 패턴 미리보기
- [x] 요일 패턴 프리셋 선택 UI (평일, 주말 등)

### 3. 비즈니스 로직
- [x] calculateRepeatingDates 함수에 요일 필터링 로직 추가
- [x] 요일 선택 유효성 검사 구현(최소 1개/0-6 범위)
- [x] 선택된 요일에 대한 날짜 계산 로직
- [x] 기존 반복 로직과의 통합

### 4. 테스트
- [x] 요일 선택 로직 테스트
- [ ] UI 컴포넌트 테스트
- [x] 날짜 계산 정확성 테스트
- [x] 기존 기능 회귀 테스트

### 5. 에러 처리
- [x] 유효하지 않은 요일 선택 처리
- [x] 최소 1개 요일 선택 강제
- [x] 주간 반복이 아닌 경우 처리
- [x] 잘못된 데이터 형식 처리

### 6. 문서화
- [ ] 타입 정의 주석 추가
- [ ] 함수 설명 주석 업데이트
- [ ] README 업데이트

## 테스트 시나리오

### 단위 테스트
1. validateWeekdays
   - 유효한 요일 값 검증 (0-6)
   - 최소 1개 요일 선택 검증
   - 중복 요일 처리

2. calculateRepeatingDates
   - 단일 요일 선택 시 날짜 계산
   - 다중 요일 선택 시 날짜 계산
   - interval과 조합된 요일 선택
   - excludeDates와 조합된 요일 선택

3. UI 컴포넌트
   - 요일 선택 UI 렌더링
   - 요일 토글 동작
   - 선택 상태 표시

### 통합 테스트
1. 반복 일정 생성
   - 요일 선택이 포함된 일정 생성
   - 다양한 요일 조합 테스트

2. 반복 일정 표시
   - 선택된 요일에만 일정 표시
   - 캘린더 뷰에서의 정확한 렌더링

3. 기존 기능 호환성
   - 기존 반복 일정 동작 검증
   - 데이터 마이그레이션 검증

## Definition of Done

- [x] 모든 상세 요구사항이 구현됨 (기본 범위 완료)
- [x] 모든 테스트가 통과함
- [ ] 코드 리뷰가 완료됨
- [ ] 타입 체크 (tsc) 통과
- [ ] 린트 검사 통과
- [x] 기존 기능에 대한 회귀 테스트 통과
- [ ] PR이 작성되고 승인됨
- [ ] 문서가 업데이트됨

## 기술적 구현 가이드

### 1. 타입 정의
```typescript
type ISODateString = string;
type WeekdayPattern = 'weekdays' | 'weekend' | 'custom';

enum WeekDay {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

interface RepeatInfo {
  type: RepeatType;
  interval: number;
  weekdays?: WeekDay[];
  weekdayPattern?: WeekdayPattern;
  excludeDates?: ISODateString[];
  endDate?: ISODateString;
  version: number;
  // ... 기존 필드
}

interface WeekdayValidationError extends ValidationError {
  weekday?: WeekDay;
  pattern?: WeekdayPattern;
}

const WEEKDAY_PRESETS = {
  weekdays: [WeekDay.MONDAY, WeekDay.TUESDAY, WeekDay.WEDNESDAY, WeekDay.THURSDAY, WeekDay.FRIDAY],
  weekend: [WeekDay.SATURDAY, WeekDay.SUNDAY]
};
```

### 2. 유효성 검사
```typescript
function validateWeekdays(
  weekdays: WeekDay[],
  pattern?: WeekdayPattern
): WeekdayValidationError[] {
  const errors: WeekdayValidationError[] = [];

  if (!weekdays.length) {
    errors.push({
      code: 'NO_WEEKDAYS',
      message: '최소 하나의 요일을 선택해야 합니다',
      field: 'weekdays'
    });
  }

  if (pattern === 'weekdays' && !isWeekdaysPattern(weekdays)) {
    errors.push({
      code: 'INVALID_WEEKDAYS_PATTERN',
      message: '평일 패턴이 올바르지 않습니다',
      field: 'weekdayPattern',
      pattern: 'weekdays'
    });
  }

  if (pattern === 'weekend' && !isWeekendPattern(weekdays)) {
    errors.push({
      code: 'INVALID_WEEKEND_PATTERN',
      message: '주말 패턴이 올바르지 않습니다',
      field: 'weekdayPattern',
      pattern: 'weekend'
    });
  }

  weekdays.forEach(day => {
    if (!Object.values(WeekDay).includes(day)) {
      errors.push({
        code: 'INVALID_WEEKDAY',
        message: '유효하지 않은 요일입니다',
        field: 'weekdays',
        weekday: day
      });
    }
  });

  return errors;
}

function isWeekdaysPattern(weekdays: WeekDay[]): boolean {
  return WEEKDAY_PRESETS.weekdays.every(day => weekdays.includes(day));
}

function isWeekendPattern(weekdays: WeekDay[]): boolean {
  return WEEKDAY_PRESETS.weekend.every(day => weekdays.includes(day));
}
```

### 3. 날짜 계산 로직
```typescript
const calculateRepeatingDates = memoize((
  startDate: Date,
  repeatInfo: RepeatInfo
): Date[] => {
  const { type, interval, weekdays, weekdayPattern, excludeDates, endDate } = repeatInfo;
  
  // 1. 패턴 기반 요일 설정
  const selectedWeekdays = weekdayPattern && weekdayPattern !== 'custom'
    ? WEEKDAY_PRESETS[weekdayPattern]
    : weekdays || [];
  
  // 2. 기본 반복 날짜 계산
  const dates = calculateBaseDates(startDate, type, interval, endDate);
  
  // 3. 요일 필터링
  const filteredDates = dates.filter(date => 
    selectedWeekdays.includes(date.getDay() as WeekDay)
  );
  
  // 4. 제외 날짜 처리 및 배치 처리
  return calculateDatesBatch(
    filteredDates.filter(date => 
      !excludeDates?.includes(date.toISOString())
    ),
    100
  );
}, {
  maxAge: 5 * 60 * 1000, // 5분 캐시
  maxSize: 100 // 최대 100개 캐시
});
```

## UI/UX 가이드라인

1. 요일 선택 UI
   - 7개의 요일 토글 버튼
   - 선택된 요일 강조 표시
   - 한글 요일 표시 ("일", "월", ...)

2. 에러 메시지
   - "최소 하나의 요일을 선택하세요"
   - "주간 반복에서만 요일 선택이 가능합니다"

3. 반복 패턴 표시
   - "매주 월, 수, 금 반복"
   - "2주마다 화, 목 반복"

## 예상 소요 시간

- 프론트엔드 개발: 2일
- 테스트 작성: 1일
- 코드 리뷰 및 수정: 1일
- 총 예상 시간: 4일

## 우선순위 및 위험요소

**우선순위:** High
- Story 2.1, 2.2 완료 후 진행
- 사용자가 자주 요청하는 핵심 기능

**위험요소:**
1. 날짜 계산 복잡도 증가
2. interval, excludeDates와의 조합
3. 성능 최적화 필요

**위험 완화 전략:**
1. 날짜 계산 복잡도
   - 모듈화된 날짜 계산 로직
   - 캐싱 및 메모이제이션 적용
   - 단위 테스트 강화

2. 기능 조합
   - 명확한 우선순위 규칙 정의
   - 엣지 케이스 테스트 강화
   - 사용자 시나리오 검증

3. 성능 최적화
   - 배치 처리 구현
   - 메모이제이션 전략 적용
   - 성능 메트릭 모니터링

**롤백 계획:**
1. 데이터 롤백
   - 버전 관리를 통한 데이터 구조 롤백
   - 이전 버전과의 호환성 유지

2. 기능 롤백
   - 기능 플래그 시스템 구현
   - 단계적 기능 활성화/비활성화

3. 모니터링
   - 에러 발생률 추적
   - 성능 지표 모니터링
   - 사용자 피드백 수집

**성능 모니터링 지표:**
1. 응답 시간
   - 날짜 계산 시간 < 100ms
   - UI 렌더링 시간 < 50ms

2. 메모리 사용량
   - 최대 메모리 사용량 < 50MB
   - 메모리 누수 모니터링

3. 사용자 경험
   - 첫 로딩 시간 < 2초
   - 상호작용 지연 < 100ms

## 관련 문서

- Story 2.1, 2.2 문서
- Material-UI ToggleButton 문서
- 반복 일정 기술 명세

## 리팩터링 행동강령 (Code of Conduct for Refactoring)

### 핵심 원칙
1. **기존 코드 보존**
   - 기존 애플리케이션 코드를 수정하지 않음
   - 기존 테스트 코드를 수정하지 않음
   - 새로운 기능은 기존 코드와 분리된 새로운 파일에 구현

2. **점진적 리팩터링**
   - 한 번에 하나의 책임만 리팩터링
   - 각 리팩터링 단계마다 테스트 실행
   - 작은 단위로 커밋하여 변경사항 추적 용이

3. **테스트 주도 리팩터링**
   - 새로운 기능에 대한 테스트 먼저 작성
   - 기존 테스트가 항상 통과하는지 확인
   - 리팩터링 후 모든 테스트 통과 확인

### 구체적인 가이드라인

#### 파일 구조
```
src/
  ├── __tests__/
  │   └── utils/
  │       ├── existing-tests.spec.ts     # 기존 테스트 (수정 금지)
  │       └── new-feature.spec.ts        # 새로운 테스트
  ├── utils/
  │   ├── existing-utils.ts              # 기존 유틸리티 (수정 금지)
  │   └── new-feature-utils.ts           # 새로운 유틸리티
  └── hooks/
      ├── existing-hooks.ts              # 기존 훅 (수정 금지)
      └── new-feature-hooks.ts           # 새로운 훅
```

#### 코드 작성 규칙
1. **새로운 파일 생성**
   - 기존 파일 수정 대신 새 파일 생성
   - 의미있는 파일명으로 목적 명확히 표현
   - 관련 코드끼리 같은 디렉토리에 위치

2. **인터페이스 설계**
   - 기존 인터페이스 확장하여 새로운 인터페이스 정의
   - 기존 타입을 재사용하여 호환성 유지
   - 새로운 타입은 별도 파일에 정의

3. **의존성 관리**
   - 새로운 의존성 추가 시 기존 코드 영향 없도록 관리
   - 순환 의존성 방지
   - 의존성 주입 패턴 활용

#### 품질 관리
1. **코드 품질**
   - 일관된 코딩 컨벤션 준수
   - 중복 코드 최소화
   - 명확한 변수/함수명 사용

2. **테스트 품질**
   - 테스트 커버리지 유지/향상
   - 경계값 테스트 포함
   - 테스트 가독성 확보

3. **문서화**
   - 새로운 기능 문서화
   - 리팩터링 결정 사항 기록
   - API 문서 업데이트

### 검증 절차
1. **리팩터링 전**
   - 기존 테스트 전체 통과 확인
   - 코드 커버리지 측정
   - 기존 기능 동작 확인

2. **리팩터링 중**
   - 단계별 테스트 실행
   - 코드 리뷰 수행
   - 성능 영향 모니터링

3. **리팩터링 후**
   - 전체 테스트 통과 확인
   - 코드 커버리지 비교
   - 기존 기능 정상 동작 검증

### 모니터링 및 롤백 계획
1. **모니터링**
   - 테스트 실행 시간 모니터링
   - 성능 메트릭 모니터링
   - 에러 로그 모니터링

2. **롤백 전략**
   - 단계별 커밋으로 롤백 포인트 확보
   - 문제 발생 시 즉시 롤백
   - 롤백 후 원인 분석
