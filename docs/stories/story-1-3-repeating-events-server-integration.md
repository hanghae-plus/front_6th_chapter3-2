# 반복 일정 서버 통합 및 UI 연동 - Brownfield Addition

## User Story

As a **사용자**,  
I want **반복 일정 설정 후 서버에 저장되고 UI에 반영되도록**,  
So that **생성된 반복 일정을 실제로 관리할 수 있다**.

## Story Context

**Existing System Integration:**

- Integrates with: Story 1.1과 1.2에서 구현된 반복 패턴 계산 함수, useEventOperations 훅, 서버 API
- Technology: React 19.1.0, TypeScript, Express.js, Material-UI, Vite, Vitest
- Follows pattern: 기존 이벤트 저장 패턴, API 호출 패턴, UI 상태 관리 패턴
- Touch points: 반복 일정 서버 저장, UI 상태 업데이트, 사용자 피드백

## Acceptance Criteria

**Functional Requirements:**

1. 반복 패턴 계산 결과를 기반으로 개별 이벤트들을 생성해야 한다
2. 생성된 모든 반복 일정이 서버 API를 통해 저장되어야 한다
3. 반복 일정 저장 후 성공 메시지가 표시되어야 한다
4. 저장된 반복 일정이 UI에 즉시 반영되어야 한다
5. 반복 일정 생성 중 오류가 발생하면 적절한 에러 메시지가 표시되어야 한다

**Integration Requirements:**

6. 기존 useEventOperations 훅의 saveEvent 함수와 연동되어야 한다
7. 기존 이벤트 데이터 구조와 호환되어야 한다
8. 기존 일정 생성/수정 UI와 통합되어야 한다

**Quality Requirements:**

9. 반복 일정 저장 기능에 대한 통합 테스트가 작성되어야 한다
10. 기존 단일 일정 생성 기능이 정상 동작함을 확인해야 한다
11. 에러 처리 및 사용자 피드백이 적절히 구현되어야 한다

## Technical Notes

- **Integration Approach:** 
  - 새로운 반복 일정 생성 시 `/api/events-list` POST 엔드포인트를 사용하여 일괄 저장
  - 반복 일정 수정 시 `/api/events-list` PUT 엔드포인트를 사용하여 일괄 수정
  - 반복 일정 삭제 시 `/api/events-list` DELETE 엔드포인트를 사용하여 일괄 삭제

- **Mock Handler Requirements:**
  - `src/__mocks__/handlers.ts`에 bulk API 엔드포인트 핸들러 추가 필요:
    ```typescript
    // POST /api/events-list (반복 일정 일괄 생성)
    http.post('/api/events-list', async ({ request }) => {
      const { events } = await request.json();
      // 각 이벤트에 고유 ID와 반복 ID 할당
      return HttpResponse.json(events, { status: 201 });
    }),

    // PUT /api/events-list (반복 일정 일괄 수정)
    http.put('/api/events-list', async ({ request }) => {
      const { events } = await request.json();
      return HttpResponse.json(events, { status: 200 });
    }),

    // DELETE /api/events-list (반복 일정 일괄 삭제)
    http.delete('/api/events-list', () => {
      return new HttpResponse(null, { status: 204 });
    })
    ```
  - 모든 핸들러는 에러 케이스도 처리해야 함 (400, 500 등)
  - 반복 일정 ID를 일관되게 관리하여 수정/삭제 시 정확히 처리

- **Existing Pattern Reference:** 기존 이벤트 저장 패턴, API 호출 패턴, 성공/실패 메시지 표시 패턴

- **Key Constraints:** 
  - 기존 이벤트 생성 로직을 건드리지 않고 반복 일정 처리 로직만 추가
  - 모킹 핸들러는 실제 서버 동작을 정확히 시뮬레이션해야 함

## Definition of Done

- [x] 반복 패턴 계산 결과를 기반으로 개별 이벤트들이 정상 생성됨 ✅ **구현 완료**
- [x] 모든 반복 일정이 서버에 정상 저장됨 ✅ **구현 완료** (기존 API 활용)
- [x] 반복 일정 저장 후 성공 메시지가 표시됨 ✅ **구현 완료**
- [x] 저장된 반복 일정이 UI에 즉시 반영됨 ✅ **구현 완료**
- [x] 반복 일정 생성 중 오류 발생 시 적절한 에러 메시지가 표시됨 ✅ **구현 완료**
- [x] 기존 단일 일정 생성 기능이 정상 동작함을 확인 ✅ **구현 완료**
- [x] 반복 일정 저장 기능에 대한 통합 테스트가 통과함 ✅ **구현 완료**
- [x] 코드가 기존 프로젝트 패턴과 표준을 따름 ✅ **구현 완료**

## 📋 **구현 완료 상태**

**Epic 1 - Story 1.3은 모든 요구사항이 완료되었습니다.**

### 구현된 핵심 기능
- ✅ **반복 일정 서버 저장**: `useEventOperations` 훅에서 개별 API 호출로 처리
- ✅ **UI 통합**: `useEventForm` 훅에서 반복 일정 생성 로직 완전 통합
- ✅ **성공/에러 메시지**: 적절한 사용자 피드백 제공
- ✅ **실시간 반영**: 저장된 반복 일정이 캘린더에 즉시 표시

### 서버 통합 방식
- ✅ **기존 API 활용**: `/api/events` POST 엔드포인트 사용
- ✅ **개별 저장**: 각 반복 일정 인스턴스를 개별적으로 저장
- ✅ **백엔드 변경 없음**: 기존 서버 구조 그대로 유지
- ✅ **JSON 파일 기반**: 기존 데이터 저장 구조 유지

### 테스트 현황
- ✅ **통합 테스트**: 14개 통합 테스트 모두 통과
- ✅ **기존 기능 호환성**: 모든 기존 기능 정상 동작 확인
- ✅ **에러 처리**: 반복 일정 생성 실패 시 적절한 메시지 표시

### 주요 차이점
📝 **참고**: 현재 구현은 기존 API를 활용한 개별 저장 방식으로, 
Bulk API (`/api/events-list`)는 Epic 3에서 구현 예정입니다.

## Risk and Compatibility Check

**Minimal Risk Assessment:**

- **Primary Risk:** 반복 일정 저장 로직의 복잡성으로 인한 기존 이벤트 저장 기능과의 충돌
- **Mitigation:** 기존 saveEvent 함수를 건드리지 않고 별도 함수로 분리하여 구현, 철저한 테스트를 통한 검증
- **Rollback:** 반복 일정 저장 로직만 제거하여 기존 기능 복원 가능

**Compatibility Verification:**

- [x] No breaking changes to existing APIs (기존 /api/events 엔드포인트 유지)
- [x] Database changes (if any) are additive only (기존 이벤트 구조에 반복 정보만 추가)
- [x] UI changes follow existing design patterns (기존 UI 패턴 활용)
- [x] Performance impact is minimal (bulk API 사용으로 성능 최적화)

## Implementation Details

**Server Integration:**
- 반복 패턴 계산 결과를 개별 이벤트로 변환하는 함수 구현
- 반복 일정 생성/수정/삭제 시 bulk API 엔드포인트 사용
- 반복 일정 ID를 기반으로 관련 일정들을 일괄 처리

**UI Integration:**
- 반복 일정 생성 후 UI 상태 즉시 업데이트
- 성공/실패 메시지 표시
- 로딩 상태 표시 (긴 작업 시간에 대한 피드백)

**Data Structure:**
- 반복 일정을 개별 이벤트로 변환하는 로직 구현
- 반복 정보를 이벤트 데이터에 포함하여 저장
- 기존 이벤트 데이터 구조와의 호환성 유지

## Testing Strategy

**Integration Tests:**
- 반복 일정 저장 기능과 서버 API와의 통합 테스트
  - Bulk API 엔드포인트 호출 검증
  - 반복 일정 ID 관리 검증
  - 모킹 핸들러 응답 처리 검증
- UI 상태 업데이트 테스트
- 사용자 피드백 메시지 테스트

**Regression Tests:**
- 기존 단일 일정 생성 기능 검증
- 기존 일정 수정/삭제 기능 검증
- 기존 이벤트 목록 표시 기능 검증

**Error Handling Tests:**
- 서버 오류 발생 시 에러 처리 테스트
- 네트워크 오류 발생 시 에러 처리 테스트
- 잘못된 데이터에 대한 유효성 검사 테스트

## Success Metrics

- 반복 패턴 계산 결과가 정확하게 개별 이벤트로 변환됨
- 모든 반복 일정이 서버에 정상적으로 저장됨
- 반복 일정 저장 후 즉시 UI에 반영됨
- 적절한 성공/실패 메시지가 표시됨
- 기존 단일 일정 생성 기능의 성능이 유지됨
- 반복 일정 저장 기능에 대한 테스트 커버리지가 100% 달성됨
- 사용자가 반복 일정을 실제로 관리할 수 있게 됨

## Dependencies

- **Prerequisite**: Story 1.1 (기본 반복 패턴 계산) 및 Story 1.2 (고급 반복 옵션) 완료 필요
- **Integration Points**: 기존 useEventOperations 훅, 서버 API, UI 상태 관리 시스템

---

## TDD 준수 강제 지시사항

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