# Story 2.1: 고급 반복 간격 설정 기능 구현

## 스토리 설명

**As a** 캘린더 사용자  
**I want** 일정 반복 시 2일마다, 3주마다와 같이 세밀한 간격을 설정할 수 있도록  
**So that** 더 유연하고 정교한 반복 일정을 생성할 수 있습니다.

## 개요

이 스토리는 기존 반복 일정 기능(Epic 1)을 확장하여 사용자가 더 세밀한 반복 간격을 설정할 수 있도록 합니다. 1-99 범위의 간격 값을 지원하여 "2일마다", "3주마다"와 같은 고급 반복 패턴을 구현합니다.

## 선행 조건

1. Epic 1의 기본 반복 일정 기능이 완성되어 있어야 함
2. 기존 반복 일정 생성/수정 UI가 구현되어 있어야 함
3. 반복 일정 저장 및 표시 기능이 정상 작동해야 함

## 기술적 제약사항

1. 기존 API 엔드포인트 구조 유지
2. JSON 파일 기반 데이터 저장 구조 활용
3. Material-UI 컴포넌트 패턴 준수
4. TypeScript 타입 안정성 보장

## 상세 요구사항

### 1. 데이터 구조 확장
- [ ] RepeatInfo 타입에 interval 필드 추가 (기본값: 1)
- [ ] interval 필드는 1-99 범위의 숫자만 허용
- [ ] version 필드 추가로 데이터 구조 버전 관리 (기본값: 1)
- [ ] 기존 반복 일정 데이터와의 호환성 유지
- [ ] 마이그레이션 스크립트 작성

### 2. UI 구현
- [ ] 반복 설정 폼에 간격 입력 필드 추가 (Material-UI TextField)
- [ ] 1-99 범위 제한 및 유효성 검사 구현
- [ ] 간격 설정에 따른 반복 패턴 미리보기 표시
- [ ] 스피너 버튼으로 값 조정 기능 표시

### 3. 비즈니스 로직
- [ ] calculateRepeatingDates 함수에 interval 로직 추가
- [ ] 간격 값에 따른 날짜 계산 로직 구현
- [ ] 유효하지 않은 간격 값 처리
- [ ] 기존 반복 로직과의 통합

### 4. 테스트
- [ ] interval 필드 유효성 검사 테스트
- [ ] 날짜 계산 로직 테스트 (다양한 간격 값)
- [ ] UI 컴포넌트 테스트
- [ ] 기존 기능 회귀 테스트
- [ ] 성능 테스트 (대량의 반복 일정 처리)
- [ ] 메모리 사용량 모니터링 테스트
- [ ] 마이그레이션 테스트

### 5. 에러 처리
- [ ] 잘못된 간격 값 입력 시 에러 메시지 표시
- [ ] 범위 초과 값 입력 방지
- [ ] 유효하지 않은 날짜 조합 처리

### 6. 문서화
- [ ] 타입 정의 주석 추가
- [ ] 함수 설명 주석 업데이트
- [ ] README 업데이트

## 테스트 시나리오

### 단위 테스트
1. validateInterval
   - 유효한 간격 값 (1-99) 검증
   - 경계값 테스트 (0, 1, 99, 100)
   - 소수점, 문자열 등 잘못된 입력 처리

2. calculateRepeatingDates
   - 2일마다 반복 (interval: 2)
   - 3주마다 반복 (interval: 3)
   - 4개월마다 반복 (interval: 4)
   - 2년마다 반복 (interval: 2)

3. UI 컴포넌트
   - 간격 입력 필드 렌더링
   - 유효성 검사 메시지 표시
   - 사용자 입력 처리

### 통합 테스트
1. 반복 일정 생성
   - 다양한 간격 값으로 일정 생성
   - 생성된 일정의 정확성 검증

2. 반복 일정 표시
   - 간격이 적용된 일정의 올바른 표시
   - 캘린더 뷰에서의 정확한 렌더링

3. 기존 기능 호환성
   - 기존 반복 일정 동작 검증
   - 데이터 마이그레이션 검증

## Definition of Done

- [ ] 모든 상세 요구사항이 구현됨
- [ ] 모든 테스트가 통과함
- [ ] 코드 리뷰가 완료됨
- [ ] 타입 체크 (tsc) 통과
- [ ] 린트 검사 통과
- [ ] 기존 기능에 대한 회귀 테스트 통과
- [ ] PR이 작성되고 승인됨
- [ ] 문서가 업데이트됨

## 기술적 구현 가이드

### 1. 타입 정의
```typescript
type ISODateString = string;

interface RepeatInfo {
  type: RepeatType;
  interval: number; // 1-99 범위
  endDate?: ISODateString;
  version: number; // 데이터 구조 버전 관리
  // ... 기존 필드
}

interface ValidationError {
  code: string;
  message: string;
  field?: string;
}
```

### 2. 유효성 검사
```typescript
function validateInterval(interval: number): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!Number.isInteger(interval)) {
    errors.push({
      code: 'INVALID_INTERVAL_TYPE',
      message: '정수만 입력 가능합니다',
      field: 'interval'
    });
  }
  
  if (interval < 1 || interval > 99) {
    errors.push({
      code: 'INVALID_INTERVAL_RANGE',
      message: '1에서 99 사이의 값을 입력하세요',
      field: 'interval'
    });
  }
  
  return errors;
}
```

### 3. 날짜 계산 로직
```typescript
const calculateRepeatingDates = memoize((
  startDate: Date,
  repeatInfo: RepeatInfo
): Date[] => {
  const { type, interval, endDate } = repeatInfo;
  // interval을 고려한 날짜 계산 로직
  
  return calculateDatesBatch(dates, 100); // 성능 최적화를 위한 배치 처리
}, {
  maxAge: 5 * 60 * 1000, // 5분 캐시
  maxSize: 100 // 최대 100개 캐시
});

// 배치 처리를 통한 성능 최적화
async function calculateDatesBatch(
  dates: Date[],
  batchSize = 100
): Promise<Date[]> {
  const results: Date[] = [];
  for (let i = 0; i < dates.length; i += batchSize) {
    const batch = dates.slice(i, i + batchSize);
    results.push(...await processBatch(batch));
  }
  return results;
}
```

## UI/UX 가이드라인

1. 간격 입력 필드
   - 숫자 입력 필드 사용
   - 스피너 버튼으로 값 조정 가능
   - 즉각적인 유효성 검사 피드백

2. 에러 메시지
   - "1에서 99 사이의 값을 입력하세요"
   - "정수만 입력 가능합니다"

3. 반복 패턴 표시
   - "2일마다 반복"
   - "3주마다 반복"
   - "4개월마다 반복"

## 예상 소요 시간

- 프론트엔드 개발: 2일
- 테스트 작성: 1일
- 코드 리뷰 및 수정: 1일
- 총 예상 시간: 4일

## 우선순위 및 위험요소

**우선순위:** High
- Epic 2의 기반이 되는 핵심 기능
- 다른 고급 기능의 선행 조건

**위험요소:**
1. 기존 반복 로직과의 통합 복잡도
2. 날짜 계산의 정확성 보장
3. 성능 영향 최소화 필요

**위험 완화 전략:**
1. 통합 복잡도
   - 점진적 통합 접근
   - 코드 리뷰 강화
   - 통합 테스트 자동화

2. 날짜 계산 정확성
   - 엄격한 유닛 테스트
   - 경계값 테스트 케이스 추가
   - 실제 사용자 시나리오 기반 테스트

3. 성능 최적화
   - 메모이제이션 전략 구현
   - 배치 처리 도입
   - 성능 모니터링 지표 설정

**롤백 계획:**
1. 데이터 롤백
   - 버전 관리를 통한 데이터 구조 롤백
   - 이전 버전 데이터 호환성 유지

2. 코드 롤백
   - 기능 플래그를 통한 점진적 롤아웃
   - 자동화된 롤백 스크립트 준비

3. 모니터링
   - 성능 지표 모니터링
   - 에러 발생률 추적
   - 사용자 피드백 수집

## 관련 문서

- Epic 1 문서
- 반복 일정 기술 명세
- Material-UI 컴포넌트 가이드
