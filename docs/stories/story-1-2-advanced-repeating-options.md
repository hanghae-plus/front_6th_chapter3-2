# 고급 반복 옵션 구현 - Brownfield Addition

## User Story

As a **사용자**,  
I want **반복 간격과 종료 조건을 세밀하게 설정할 수 있도록**,  
So that **더욱 유연한 반복 일정을 만들 수 있다**.

## Story Context

**Existing System Integration:**

- Integrates with: Story 1.1에서 구현된 기본 반복 패턴 계산 함수, useEventForm 훅
- Technology: React 19.1.0, TypeScript, Vite, Vitest
- Follows pattern: 기존 유틸리티 함수 패턴, 폼 상태 관리 패턴
- Touch points: 반복 간격 설정, 종료 조건 처리, 고급 반복 패턴 계산

## Acceptance Criteria

**Functional Requirements:**

1. 사용자가 1-99 범위의 간격을 설정할 수 있어야 한다 (2일마다, 3주마다 등)
2. 반복 종료 조건을 특정 날짜까지로 설정할 수 있어야 한다
3. 반복 종료 조건을 최대 횟수(10회)로 설정할 수 있어야 한다
4. 간격과 종료 조건이 적용된 고급 반복 패턴이 정확히 계산되어야 한다
5. 잘못된 설정값에 대한 유효성 검사가 수행되어야 한다

**Integration Requirements:**

6. Story 1.1의 기본 반복 패턴 계산 함수를 확장하여 고급 옵션을 지원해야 한다
7. 기존 useEventForm 훅의 반복 관련 상태와 연동되어야 한다
8. 고급 옵션 설정이 UI에 반영되어야 한다

**Quality Requirements:**

9. 고급 반복 옵션에 대한 단위 테스트가 작성되어야 한다
10. 간격과 종료 조건의 경계값 테스트가 포함되어야 한다
11. 기존 기본 반복 패턴 기능이 정상 동작함을 확인해야 한다

## Technical Notes

- **Integration Approach:** Story 1.1의 기본 반복 패턴 계산 함수를 확장하여 간격과 종료 조건을 처리하는 매개변수를 추가
- **Existing Pattern Reference:** 기존 유틸리티 함수 확장 패턴, 폼 상태 관리 패턴
- **Key Constraints:** 기본 반복 패턴 기능을 깨뜨리지 않고 확장, 기존 UI 구조를 최대한 활용

## Definition of Done

- [ ] 반복 간격 설정 기능이 정상 동작함 (1-99 범위)
- [ ] 반복 종료 조건(날짜/횟수) 설정 기능이 정상 동작함
- [ ] 고급 옵션이 적용된 반복 패턴이 정확히 계산됨
- [ ] 잘못된 설정값에 대한 유효성 검사가 정상 동작함
- [ ] Story 1.1의 기본 반복 패턴 기능이 정상 동작함을 확인
- [ ] 고급 반복 옵션에 대한 단위 테스트가 통과함
- [ ] 코드가 기존 프로젝트 패턴과 표준을 따름
- [ ] UI에 고급 옵션 설정이 반영됨

## Risk and Compatibility Check

**Minimal Risk Assessment:**

- **Primary Risk:** 고급 옵션 추가로 인한 기본 반복 패턴 기능과의 충돌
- **Mitigation:** 기본 함수를 건드리지 않고 새로운 함수로 확장, 철저한 테스트를 통한 검증
- **Rollback:** 고급 옵션 관련 코드만 제거하여 기본 기능 복원 가능

**Compatibility Verification:**

- [x] No breaking changes to existing APIs (기존 함수는 그대로 유지)
- [x] Database changes (if any) are additive only (기존 구조 변경 없음)
- [x] UI changes follow existing design patterns (기존 UI 패턴 활용)
- [x] Performance impact is negligible (계산 로직 확장으로 성능 영향 최소)

## Implementation Details

**Enhanced Utility Functions:**
- `calculateDailyPatternWithInterval(startDate, endDate, interval, maxOccurrences)`: 간격과 횟수 제한이 적용된 매일 반복
- `calculateWeeklyPatternWithInterval(startDate, endDate, interval, maxOccurrences)`: 간격과 횟수 제한이 적용된 매주 반복
- `calculateMonthlyPatternWithInterval(startDate, endDate, interval, maxOccurrences)`: 간격과 횟수 제한이 적용된 매월 반복
- `calculateYearlyPatternWithInterval(startDate, endDate, interval, maxOccurrences)`: 간격과 횟수 제한이 적용된 매년 반복

**Data Structure Updates:**
- RepeatInfo 인터페이스에 간격과 종료 조건 관련 필드 추가
- 고급 반복 옵션 설정을 위한 타입 정의

**UI Integration:**
- 기존 반복 설정 UI에 간격 입력 필드 추가
- 종료 조건 선택 옵션(날짜/횟수) 추가
- 설정값 유효성 검사 및 에러 메시지 표시

## Testing Strategy

**Unit Tests:**
- 각 고급 반복 패턴 계산 함수별 테스트
- 간격과 종료 조건의 경계값 테스트
- 잘못된 입력값에 대한 유효성 검사 테스트

**Integration Tests:**
- Story 1.1 기능과의 호환성 테스트
- useEventForm 훅과의 연동 테스트
- UI 상태 업데이트 테스트

**Regression Tests:**
- 기본 반복 패턴 기능이 정상 동작하는지 확인
- 기존 반복 관련 상태가 올바르게 유지되는지 확인

## Success Metrics

- 반복 간격 설정이 1-99 범위에서 정확하게 동작함
- 반복 종료 조건(날짜/횟수)이 올바르게 처리됨
- 고급 옵션이 적용된 반복 패턴이 정확히 계산됨
- 잘못된 설정값에 대한 적절한 에러 메시지가 표시됨
- Story 1.1의 기본 기능이 정상 동작함
- 고급 반복 옵션에 대한 테스트 커버리지가 100% 달성됨
- 사용자가 더욱 유연한 반복 일정을 설정할 수 있게 됨
