# Story 1.2: 반복 일정 시각적 구분 구현

## Story Goal

캘린더에서 반복 일정을 일반 일정과 구분하여 볼 수 있도록 하여, 반복 일정을 쉽게 식별할 수 있도록 합니다.

**중요한 제약사항**: 백엔드 마이그레이션은 배제하고, 프론트엔드에서만 반복 일정 시각적 구분 기능을 구현합니다.

## User Story

**As a** 사용자,  
**I want** 캘린더에서 반복 일정을 일반 일정과 구분하여 볼 수 있도록,  
**so that** 반복 일정을 쉽게 식별할 수 있다.

## Acceptance Criteria

1. 캘린더 뷰에서 반복 일정이 아이콘과 함께 표시되어야 한다
2. 반복 일정의 반복 패턴이 시각적으로 명확하게 표시되어야 한다
3. 반복 일정과 일반 일정의 구분이 명확해야 한다
4. 반복 일정 클릭 시 상세 정보가 표시되어야 한다
5. **백엔드 시스템은 전혀 변경되지 않아야 한다**

## Technical Notes

**Implementation Approach:**
- 기존 캘린더 뷰 컴포넌트에 반복 일정 아이콘 표시 로직 추가
- 반복 일정과 일반 일정을 구분하는 시각적 요소 구현
- 반복 패턴 정보를 표시하는 UI 컴포넌트 확장

**Key Functions to Implement:**
- `isRepeatingEvent(event)`: 이벤트가 반복 일정인지 판별하는 함수
- `getRepeatIcon(repeatType)`: 반복 유형에 따른 아이콘 반환 함수
- `renderRepeatingEvent(event)`: 반복 일정을 렌더링하는 함수

**Data Structure Changes:**
- 기존 Event 인터페이스 활용 (변경 없음)
- 반복 일정 식별을 위한 기존 repeat 필드 활용

**Integration Points:**
- 기존 캘린더 뷰 컴포넌트
- 기존 이벤트 렌더링 로직
- 기존 이벤트 클릭 이벤트 핸들러

## Definition of Done

- [x] 반복 일정이 아이콘과 함께 표시됨 ✅ **구현 완료** (`EventItem` 컴포넌트)
- [x] 반복 패턴 정보가 시각적으로 명확하게 표시됨 ✅ **구현 완료** (유형별 아이콘)
- [x] 반복 일정과 일반 일정의 구분이 명확함 ✅ **구현 완료** (배경색 차별화)
- [x] 반복 일정 클릭 시 상세 정보가 정상 표시됨 ✅ **구현 완료**
- [x] 기존 일정 표시 기능이 정상적으로 동작함 ✅ **구현 완료**
- [x] 기존 일정 클릭 이벤트가 반복 일정에서도 정상 동작함 ✅ **구현 완료**
- [x] **백엔드 시스템이 전혀 변경되지 않았음을 확인** ✅ **구현 완료**
- [x] 단위 테스트가 작성되고 통과함 ✅ **구현 완료**
- [x] 기존 기능과의 호환성이 검증됨 ✅ **구현 완료**

## 📋 **구현 완료 상태**

**Epic 1 - Story 1.2는 모든 요구사항이 완료되었습니다.**

### 구현된 핵심 기능
- ✅ `isRepeatingEvent()`: 반복 일정 판별 함수
- ✅ `getRepeatIcon()`: 반복 유형별 아이콘 반환 함수
  - 🔄 매일 반복
  - 📅 매주 반복  
  - 📆 매월 반복
  - 🎯 매년 반복
- ✅ `EventItem` 컴포넌트에서 시각적 구분 구현

### 시각적 구분 요소
- ✅ **아이콘 표시**: 반복 유형별 이모지 아이콘
- ✅ **배경색 구분**: 반복 일정은 파란색 계열 배경 (`#e3f2fd`)
- ✅ **호버 효과**: 마우스 오버 시 색상 변화
- ✅ **일반 일정과 명확한 구분**: 색상과 아이콘으로 즉시 식별 가능

### 통합 확인
- ✅ 기존 캘린더 뷰와 완전 호환
- ✅ 기존 이벤트 클릭 기능 정상 동작
- ✅ Material-UI 컴포넌트 패턴 준수

## Risk Assessment

**Technical Risks:**
- 기존 캘린더 렌더링 로직과의 충돌
- 반복 일정 아이콘 표시로 인한 성능 저하

**Integration Risks:**
- 기존 이벤트 표시 기능과의 호환성 문제
- 기존 이벤트 클릭 이벤트와의 충돌

**Mitigation Strategies:**
- TDD 방식으로 단계적 구현
- 기존 컴포넌트 구조를 최대한 유지
- 기존 기능과의 호환성 지속적 검증
- **백엔드 변경 없음으로 인한 위험 최소화**

## Testing Requirements

**Unit Tests:**
- 반복 일정 판별 함수 테스트
- 반복 유형별 아이콘 반환 함수 테스트
- 반복 일정 렌더링 함수 테스트

**Integration Tests:**
- 기존 캘린더 뷰와의 통합 테스트
- 기존 이벤트 표시 기능과의 호환성 테스트
- 기존 이벤트 클릭 이벤트와의 연동 테스트

**Regression Tests:**
- 기존 일정 표시 기능 테스트
- 기존 일정 클릭 이벤트 테스트
- 기존 캘린더 네비게이션 기능 테스트

## Dependencies

**Prerequisites:**
- Story 1.1이 완료되어 반복 일정 생성 로직이 구현되어야 함
- 기존 캘린더 뷰 컴포넌트가 정상 동작해야 함
- 기존 이벤트 표시 기능이 정상 동작해야 함

**External Dependencies:**
- Material-UI 아이콘 컴포넌트
- 기존 캘린더 스타일링 시스템

**Internal Dependencies:**
- 기존 Event 타입 정의
- 기존 캘린더 렌더링 로직
- 기존 이벤트 클릭 이벤트 핸들러

## Integration Verification

**IV1:** 기존 캘린더 뷰의 레이아웃과 스타일이 유지되는지 확인
**IV2:** 기존 일정 표시 기능이 정상적으로 동작하는지 확인
**IV3:** 기존 일정 클릭 이벤트가 반복 일정에서도 정상 동작하는지 확인
**IV4:** **백엔드 시스템이 전혀 변경되지 않았는지 확인**

---

## 🚨 **TDD 준수 강제 지시사항**

### **⚠️ 절대 금지사항**
- **구현 코드를 먼저 작성하는 것**
- **테스트 없이 코드 작성하는 것**
- **테스트를 나중에 작성하는 것**

### **✅ 필수 준수사항**
1. **반드시 테스트를 먼저 작성해야 함**
2. **테스트가 실패하는 것을 확인한 후에만 구현 시작**
3. **테스트를 통과하는 최소한의 코드만 작성**
4. **각 단계마다 테스트 실행 및 통과 확인**

### **🔒 TDD 개발 순서 강제**
```
1단계: 테스트 작성 (Red) → 2단계: 구현 (Green) → 3단계: 리팩토링 (Refactor)
```

**위 순서를 절대 바꿀 수 없습니다!**

### **🎯 Red-Green-Refactor 전략 상세 가이드**

#### **Red 단계 (테스트 작성)**
- **목표**: 실패하는 테스트 작성
- **행동**: 구현하려는 기능에 대한 테스트 케이스 작성
- **결과**: 테스트가 반드시 실패해야 함 (Red)
- **검증**: `pnpm test --run` 실행하여 실패 확인 (빠른 피드백)

#### **Green 단계 (구현)**
- **목표**: 테스트를 통과하는 최소한의 코드 작성
- **행동**: 테스트가 통과할 수 있는 가장 간단한 코드 구현
- **결과**: 테스트가 반드시 통과해야 함 (Green)
- **검증**: `pnpm test --run` 실행하여 통과 확인 (빠른 피드백)

#### **Refactor 단계 (리팩토링)**
- **목표**: 코드 품질 개선 (기능 변경 없이)
- **행동**: 중복 제거, 가독성 향상, 구조 개선
- **결과**: 테스트가 여전히 통과해야 함
- **검증**: `pnpm test --run` 실행하여 통과 유지 확인 (빠른 피드백)

---

## TDD 개발 가이드

### TDD 개발 원칙

#### Red-Green-Refactor 사이클
1. **Red**: 실패하는 테스트 작성
2. **Green**: 테스트를 통과하는 최소한의 코드 작성
3. **Refactor**: 코드 개선 (기능 변경 없이)

#### 핵심 규칙
- **테스트 우선**: 구현 코드보다 테스트 코드를 먼저 작성
- **최소한의 코드**: 테스트를 통과하는 최소한의 코드만 작성
- **지속적 리팩토링**: 각 단계마다 코드 품질 개선

### 개발 워크플로우

#### 일일 개발 사이클
1. **아침**: 오늘 구현할 기능의 테스트 작성
2. **오후**: 테스트를 통과하는 코드 구현
3. **저녁**: 코드 리팩토링 및 내일 테스트 계획

#### 스토리별 완료 체크리스트
- [ ] 모든 테스트 케이스 작성 완료
- [ ] 테스트 통과 확인
- [ ] 코드 리팩토링 완료
- [ ] 기존 기능 회귀 테스트 통과
- [ ] 백엔드 변경 없음 확인

### 테스트 작성 가이드

#### 테스트 파일 구조
```typescript
// src/__tests__/components/CalendarView.spec.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CalendarView from '../../components/CalendarView';

describe('CalendarView - Repeating Events Display', () => {
  // 테스트 그룹들...
});
```

#### 기본 테스트 패턴
```typescript
it('should display repeating event with icon', () => {
  // Given: 반복 일정 데이터
  const repeatingEvent = {
    id: '1',
    title: '반복 회의',
    date: '2024-12-20',
    repeat: { type: 'daily', interval: 1 }
  };
  
  // When: 캘린더 뷰 렌더링
  render(<CalendarView events={[repeatingEvent]} />);
  
  // Then: 반복 일정 아이콘이 표시되어야 함
  expect(screen.getByTestId('repeating-event-icon')).toBeInTheDocument();
});
```

#### 테스트 실행 명령어
```bash
# 특정 테스트 파일 실행
pnpm test src/__tests__/components/CalendarView.spec.tsx

# 테스트 커버리지 확인
pnpm run test:coverage

# 테스트 UI 실행
pnpm run test:ui
```

### 스토리별 테스트 전략

#### 반복 일정 판별 로직 테스트
- **단위 테스트**: isRepeatingEvent 함수의 정확성 검증
- **경계값 테스트**: 다양한 반복 설정에 대한 판별 검증
- **에러 케이스 테스트**: 잘못된 데이터에 대한 처리 검증

#### 반복 일정 아이콘 표시 테스트
- **컴포넌트 테스트**: 반복 유형별 아이콘 렌더링 검증
- **통합 테스트**: 캘린더 뷰와의 통합 검증
- **사용자 상호작용 테스트**: 아이콘 클릭 이벤트 검증

#### 기존 기능 호환성 테스트
- **기존 일정 표시 테스트**: 일반 일정 표시 기능 유지 검증
- **기존 이벤트 클릭 테스트**: 이벤트 클릭 기능 유지 검증
- **회귀 테스트**: 기존 기능 무결성 보장 검증

### TDD 구현 단계

#### 1단계: 테스트 환경 설정
```bash
# 테스트 파일 생성
mkdir -p src/__tests__/components
touch src/__tests__/components/CalendarView.spec.tsx
```

#### 2단계: 첫 번째 테스트 작성 (Red 단계)
```typescript
// 반복 일정 아이콘 표시 테스트
it('should display repeating event with icon', () => {
  const repeatingEvent = {
    id: '1',
    title: '반복 회의',
    date: '2024-12-20',
    repeat: { type: 'daily', interval: 1 }
  };
  
  render(<CalendarView events={[repeatingEvent]} />);
  
  expect(screen.getByTestId('repeating-event-icon')).toBeInTheDocument();
});
```

#### 3단계: 최소한의 구현 (Green 단계)
```typescript
// 최소한의 구현으로 테스트 통과
function CalendarView({ events }) {
  return (
    <div>
      {events.map(event => (
        <div key={event.id}>
          {event.repeat?.type !== 'none' && (
            <span data-testid="repeating-event-icon">🔄</span>
          )}
          {event.title}
        </div>
      ))}
    </div>
  );
}
```

#### 4단계: 추가 테스트 작성 (Red 단계)
```typescript
// 반복 유형별 아이콘 테스트
it('should display different icons for different repeat types', () => {
  const events = [
    { id: '1', title: '일일 반복', date: '2024-12-20', repeat: { type: 'daily' } },
    { id: '2', title: '주간 반복', date: '2024-12-20', repeat: { type: 'weekly' } }
  ];
  
  render(<CalendarView events={events} />);
  
  expect(screen.getByTestId('daily-repeat-icon')).toBeInTheDocument();
  expect(screen.getByTestId('weekly-repeat-icon')).toBeInTheDocument();
});
```

#### 5단계: 실제 로직 구현 (Green 단계)
```typescript
// 실제 반복 유형별 아이콘 로직 구현
function getRepeatIcon(repeatType) {
  switch (repeatType) {
    case 'daily': return '🔄';
    case 'weekly': return '📅';
    case 'monthly': return '📆';
    case 'yearly': return '🎯';
    default: return '';
  }
}

function CalendarView({ events }) {
  return (
    <div>
      {events.map(event => (
        <div key={event.id}>
          {event.repeat?.type !== 'none' && (
            <span data-testid={`${event.repeat.type}-repeat-icon`}>
              {getRepeatIcon(event.repeat.type)}
            </span>
          )}
          {event.title}
        </div>
      ))}
    </div>
  );
}
```

#### 6단계: 리팩토링 (Refactor 단계)
```typescript
// 컴포넌트를 더 작은 단위로 분리
function EventItem({ event }) {
  const isRepeating = event.repeat?.type !== 'none';
  
  return (
    <div>
      {isRepeating && (
        <span data-testid={`${event.repeat.type}-repeat-icon`}>
          {getRepeatIcon(event.repeat.type)}
        </span>
      )}
      {event.title}
    </div>
  );
}

function CalendarView({ events }) {
  return (
    <div>
      {events.map(event => (
        <EventItem key={event.id} event={event} />
      ))}
    </div>
  );
}
```

---

## Story Handoff

**Developer Prompt:**

```
Assignment-7 프로젝트의 기존 시스템 아키텍처 문서를 참조하여 다음 요구사항을 구현해주세요:

**핵심 구현 요구사항:**
- 반복 일정을 시각적으로 구분하여 표시하는 기능 구현
- 반복 유형별 아이콘 표시 로직 구현
- 기존 캘린더 뷰와의 통합 및 호환성 보장

**중요한 제약사항 (백엔드 마이그레이션 배제):**
- 백엔드 시스템은 전혀 변경하지 않음
- 기존 JSON 파일 기반 시스템을 그대로 유지
- 기존 API 엔드포인트 구조를 그대로 활용
- 기존 이벤트 데이터 구조를 그대로 활용

**기존 시스템과의 통합 요구사항:**
- 기존 캘린더 뷰 컴포넌트와의 호환성 보장
- 기존 이벤트 표시 기능과의 호환성 보장
- 기존 이벤트 클릭 이벤트와의 호환성 보장
- 기존 UI/UX 패턴과의 일관성 유지

**구현 순서:**
1. 반복 일정 판별 로직 구현
2. 반복 유형별 아이콘 표시 로직 구현
3. 기존 캘린더 뷰에 반복 일정 표시 기능 통합
4. 단위 테스트 작성 및 실행
5. 기존 기능과의 호환성 검증

**중요:** 모든 구현은 기존 시스템의 무결성을 유지하면서 진행되어야 하며, 백엔드 변경은 절대 금지입니다. TDD 방식으로 개발하여 안정성을 확보하세요.
```

---

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

**Story Manager Notes:**
This story focuses on implementing visual distinction for repeating events in the calendar view. It should be implemented using TDD approach and must maintain compatibility with existing functionality. **Backend changes are strictly prohibited** - all logic should be implemented on the frontend only.

**🚨 TDD 준수 강제**: 개발 에이전트는 반드시 테스트를 먼저 작성하고, 테스트가 실패하는 것을 확인한 후에만 구현을 시작해야 합니다. 구현 코드를 먼저 작성하는 것은 절대 금지됩니다.
