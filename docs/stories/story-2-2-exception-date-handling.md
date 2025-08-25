# Story 2.2: 반복 일정 예외 날짜 처리 기능 구현

## 스토리 설명

**As a** 캘린더 사용자  
**I want** 반복 일정에서 특정 날짜를 제외할 수 있도록  
**So that** 공휴일이나 특별한 날을 반복 일정에서 제외할 수 있습니다.

## 개요

이 스토리는 반복 일정에서 특정 날짜를 제외할 수 있는 기능을 구현합니다. 사용자는 반복 패턴에서 제외하고 싶은 날짜를 선택할 수 있으며, 이 날짜들은 반복 일정 생성 시 자동으로 제외됩니다.

## 선행 조건

1. Story 2.1 (고급 반복 간격 설정)이 완료되어 있어야 함
2. 기존 반복 일정 생성/수정 UI가 구현되어 있어야 함
3. 날짜 선택 컴포넌트가 구현되어 있어야 함

## 기술적 제약사항

1. 기존 API 엔드포인트 구조 유지
2. JSON 파일 기반 데이터 저장 구조 활용
3. Material-UI DatePicker 컴포넌트 활용
4. TypeScript 타입 안정성 보장

## 상세 요구사항

### 1. 데이터 구조 확장
- [x] RepeatInfo 타입에 excludeDates 필드 추가 (ISODateString[] 타입)
- [ ] excludeDatePatterns 필드 추가 (예: "매월 마지막 금요일")
- [x] 제외 날짜 목록을 ISO 문자열로 저장
- [x] 기존 반복 일정 데이터와의 호환성 유지 (옵셔널 필드)
- [ ] 벌크 제외 날짜 처리를 위한 구조 설계

### 2. UI 구현
- [x] 반복 설정 폼에 제외 날짜 선택 섹션 추가 (간이 date 입력)
- [ ] Material-UI DatePicker를 사용한 날짜 선택 UI
- [x] 선택된 제외 날짜 목록 표시 (버튼 칩 대체)
- [x] 제외 날짜 개별 삭제 기능
- [ ] 제외된 날짜를 캘린더에서 시각적으로 구분
- [x] 벌크 제외 날짜 선택 UI (날짜 범위 선택)

### 3. 비즈니스 로직
- [x] calculateRepeatingDates 함수에 제외 날짜 처리 로직 추가
- [x] 제외 날짜 유효성 검사 구현 (형식/중복/범위)
- [x] 제외 날짜가 반복 범위 내에 있는지 확인
- [x] 기존 반복 로직과의 통합

### 4. 테스트
- [x] 제외 날짜 처리 로직 테스트
- [ ] UI 컴포넌트 테스트
- [ ] 날짜 선택 및 삭제 기능 테스트
- [x] 기존 기능 회귀 테스트 (전체 그린)

### 5. 에러 처리
- [ ] 잘못된 날짜 형식 처리
- [ ] 중복 날짜 선택 방지
- [ ] 과거 날짜 선택 제한
- [ ] 반복 범위를 벗어난 날짜 처리

### 6. 문서화
- [ ] 타입 정의 주석 추가
- [ ] 함수 설명 주석 업데이트
- [ ] README 업데이트

## 테스트 시나리오

### 단위 테스트
1. validateExcludeDates
   - 유효한 날짜 형식 검증
   - 중복 날짜 검사
   - 범위 내 날짜 검증

2. calculateRepeatingDates
   - 제외 날짜가 있는 경우의 반복 패턴
   - 제외 날짜가 반복 날짜와 일치하는 경우
   - 제외 날짜가 범위를 벗어난 경우

3. UI 컴포넌트
   - 날짜 선택 UI 렌더링
   - 선택된 날짜 목록 표시
   - 날짜 삭제 기능

### 통합 테스트
1. 반복 일정 생성
   - 제외 날짜가 포함된 일정 생성
   - 제외 날짜 처리 검증

2. 반복 일정 표시
   - 제외된 날짜의 올바른 처리
   - 캘린더 뷰에서의 정확한 렌더링

3. 기존 기능 호환성
   - 기존 반복 일정 동작 검증
   - 데이터 마이그레이션 검증

## Definition of Done

- [ ] 모든 상세 요구사항이 구현됨 (DatePicker/캘린더 시각 표시/UI 테스트 남음)
- [x] 모든 테스트가 통과함 (현재 scope)
- [ ] 코드 리뷰가 완료됨
- [x] 타입 체크 (tsc) 통과
- [x] 린트 검사 통과
- [x] 기존 기능에 대한 회귀 테스트 통과
- [ ] PR이 작성되고 승인됨
- [x] 문서가 업데이트됨

## 기술적 구현 가이드

### 1. 타입 정의
```typescript
type ISODateString = string;
type ExcludeDatePattern = string; // "매월 마지막 금요일" 등의 패턴

interface RepeatInfo {
  type: RepeatType;
  interval: number;
  excludeDates: ISODateString[];
  excludeDatePatterns?: ExcludeDatePattern[];
  endDate?: ISODateString;
  version: number;
  // ... 기존 필드
}

interface ExcludeDateValidationError extends ValidationError {
  dateValue?: ISODateString;
  pattern?: ExcludeDatePattern;
}
```

### 2. 유효성 검사
```typescript
function validateExcludeDate(
  date: ISODateString,
  repeatInfo: RepeatInfo
): ExcludeDateValidationError[] {
  const errors: ExcludeDateValidationError[] = [];
  const startDate = new Date(repeatInfo.startDate);
  const endDate = repeatInfo.endDate ? new Date(repeatInfo.endDate) : null;
  const targetDate = new Date(date);
  
  if (targetDate < startDate) {
    errors.push({
      code: 'DATE_BEFORE_START',
      message: '시작일 이후의 날짜만 제외할 수 있습니다',
      field: 'excludeDates',
      dateValue: date
    });
  }
  
  if (endDate && targetDate > endDate) {
    errors.push({
      code: 'DATE_AFTER_END',
      message: '종료일 이전의 날짜만 제외할 수 있습니다',
      field: 'excludeDates',
      dateValue: date
    });
  }
  
  if (repeatInfo.excludeDates.includes(date)) {
    errors.push({
      code: 'DUPLICATE_DATE',
      message: '이미 제외된 날짜입니다',
      field: 'excludeDates',
      dateValue: date
    });
  }
  
  return errors;
}

function validateExcludeDatePattern(
  pattern: ExcludeDatePattern,
  repeatInfo: RepeatInfo
): ExcludeDateValidationError[] {
  const errors: ExcludeDateValidationError[] = [];
  
  // 패턴 유효성 검사 로직
  
  return errors;
}
```

### 3. 날짜 계산 로직
```typescript
const calculateRepeatingDates = memoize((
  startDate: Date,
  repeatInfo: RepeatInfo
): Date[] => {
  const { type, interval, excludeDates, excludeDatePatterns, endDate } = repeatInfo;
  
  // 1. 기본 반복 날짜 계산
  const dates = calculateBaseDates(startDate, type, interval, endDate);
  
  // 2. 제외 날짜 패턴 처리
  const patternExcludeDates = excludeDatePatterns
    ? calculatePatternDates(excludeDatePatterns, startDate, endDate)
    : [];
  
  // 3. 모든 제외 날짜 통합
  const allExcludeDates = new Set([
    ...excludeDates.map(d => d.toISOString()),
    ...patternExcludeDates.map(d => d.toISOString())
  ]);
  
  // 4. 제외 날짜 필터링 및 배치 처리
  return calculateDatesBatch(
    dates.filter(d => !allExcludeDates.has(d.toISOString())),
    100
  );
}, {
  maxAge: 5 * 60 * 1000, // 5분 캐시
  maxSize: 100 // 최대 100개 캐시
});
```

## UI/UX 가이드라인

1. 제외 날짜 선택 UI
   - DatePicker 컴포넌트 사용
   - 선택된 날짜 칩(Chip) 형태로 표시
   - 개별 날짜 삭제 버튼 제공

2. 에러 메시지
   - "반복 기간 내의 날짜만 선택 가능합니다"
   - "이미 선택된 날짜입니다"
   - "과거 날짜는 선택할 수 없습니다"

3. 캘린더 표시
   - 제외된 날짜 시각적 구분
   - 툴팁으로 제외 사유 표시

## 예상 소요 시간

- 프론트엔드 개발: 3일
- 테스트 작성: 1일
- 코드 리뷰 및 수정: 1일
- 총 예상 시간: 5일

## 우선순위 및 위험요소

**우선순위:** Medium
- Story 2.1 완료 후 진행
- 사용자 편의성 향상을 위한 중요 기능

**위험요소:**
1. 날짜 계산 복잡도 증가
2. UI/UX 일관성 유지
3. 성능 영향 (다수의 제외 날짜 처리)

**위험 완화 전략:**
1. 날짜 계산 복잡도
   - 모듈화된 날짜 계산 로직
   - 캐싱 및 메모이제이션 적용
   - 단위 테스트 강화

2. UI/UX 일관성
   - Material-UI 컴포넌트 가이드라인 준수
   - 디자인 시스템 문서화
   - 사용자 피드백 수집

3. 성능 최적화
   - 배치 처리 구현
   - 가상 스크롤링 적용
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

- Story 2.1 문서
- Material-UI DatePicker 문서
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

## QA Results

- Gate Decision: PASS
- Rationale:
  - `excludeDates` 처리/검증 로직 충족, 벌크 범위 병합 로직 정상
  - 회귀 시나리오 및 전체 테스트 그린 (현재 스코프)
  - UI 요소 일부는 의도적으로 스코프 외로 남김
- Risks/Notes:
  - DatePicker/캘린더 시각 구분 UI 미구현 → 후속 개선 필요
  - 에러 처리 UI 메시지 구체화 필요 (형식/중복/과거/범위)
