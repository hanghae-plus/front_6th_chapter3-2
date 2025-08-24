# Story 1.1: 반복 일정 생성 로직 구현

## Story Goal

사용자가 반복 일정 설정 시 실제로 반복되는 일정들이 생성되도록 하여, 설정한 패턴(매일, 매주, 매월, 매년)에 따라 자동으로 일정이 생성되도록 합니다.

**중요한 제약사항**: 백엔드 마이그레이션은 배제하고, 프론트엔드에서만 반복 일정 로직을 구현합니다.

## User Story

**As a** 사용자,  
**I want** 반복 일정 설정 시 실제로 반복되는 일정들이 생성되도록,  
**so that** 설정한 패턴에 따라 자동으로 일정이 생성된다.

## Acceptance Criteria

1. 반복 유형(매일, 매주, 매월, 매년) 선택 시 해당 패턴에 맞는 일정들이 생성되어야 한다
2. 반복 간격 설정이 정확히 적용되어야 한다 (1일마다, 2주마다 등)
3. 반복 종료 조건(특정 날짜까지, 최대 10회)이 정확히 처리되어야 한다
4. 생성된 반복 일정들은 **기존 JSON 파일 구조에 저장**되어야 한다
5. 반복 일정 생성 후 성공 메시지가 표시되어야 한다
6. **백엔드 시스템은 전혀 변경되지 않아야 한다**

## Technical Notes

**Implementation Approach:**
- 반복 패턴 계산 로직을 프론트엔드 유틸리티 함수로 구현
- 기존 useEventForm 훅에 반복 일정 생성 로직 통합
- 반복 일정을 개별 이벤트로 변환하여 기존 저장 로직 활용

**Key Functions to Implement:**
- `calculateRepeatingDates(repeatInfo, startDate, endDate)`: 반복 패턴에 따른 날짜 배열 생성
- `validateRepeatSettings(repeatInfo)`: 반복 설정 유효성 검사
- `generateEventInstances(repeatInfo, baseEvent)`: 반복 일정 인스턴스 생성

**Data Structure Changes:**
- 기존 Event 인터페이스에 반복 관련 필드만 추가
- 기존 JSON 파일 구조는 그대로 유지
- 반복 정보는 각 이벤트 인스턴스에 포함

**Integration Points:**
- useEventForm 훅의 이벤트 생성 로직
- 기존 POST /api/events API 엔드포인트
- 기존 이벤트 저장 및 상태 관리 로직

## Definition of Done

- [ ] 반복 패턴 계산 함수가 정확히 동작함
- [ ] 매일, 매주, 매월, 매년 반복 패턴이 올바르게 처리됨
- [ ] 반복 간격 설정이 정확히 적용됨
- [ ] 반복 종료 조건이 정확히 처리됨
- [ ] 생성된 반복 일정이 기존 JSON 파일에 올바르게 저장됨
- [ ] 기존 단일 일정 생성 기능이 정상적으로 동작함
- [ ] 반복 일정 생성 후 성공 메시지가 표시됨
- [ ] **백엔드 시스템이 전혀 변경되지 않았음을 확인**
- [ ] 단위 테스트가 작성되고 통과함
- [ ] 기존 기능과의 호환성이 검증됨

## Risk Assessment

**Technical Risks:**
- 반복 패턴 계산 로직의 복잡성으로 인한 버그 발생 가능성
- 날짜 계산 시 윤년, 월말 등 경계 케이스 처리 오류

**Integration Risks:**
- 기존 이벤트 생성 로직과의 충돌
- 기존 데이터 구조와의 호환성 문제

**Mitigation Strategies:**
- TDD 방식으로 단계적 구현
- 각 반복 패턴별로 개별 테스트 작성
- 기존 기능과의 호환성 지속적 검증
- **백엔드 변경 없음으로 인한 위험 최소화**

## Testing Requirements

**Unit Tests:**
- 각 반복 패턴(매일, 매주, 매월, 매년)에 대한 계산 로직 테스트
- 반복 간격 설정 테스트
- 반복 종료 조건 테스트
- 경계 케이스 테스트 (윤년, 월말 등)

**Integration Tests:**
- 반복 일정 생성 후 기존 이벤트 조회 기능 테스트
- 반복 일정과 일반 일정의 공존 테스트
- 기존 API 엔드포인트와의 호환성 테스트

**Regression Tests:**
- 기존 단일 일정 생성 기능 테스트
- 기존 이벤트 수정/삭제 기능 테스트
- 기존 검색 및 필터링 기능 테스트

## Dependencies

**Prerequisites:**
- 기존 이벤트 생성 기능이 정상 동작해야 함
- 기존 useEventForm 훅이 정상 동작해야 함
- 기존 API 엔드포인트가 정상 동작해야 함

**External Dependencies:**
- 날짜 계산을 위한 내장 Date API 또는 date-fns 라이브러리
- 기존 Material-UI 컴포넌트

**Internal Dependencies:**
- 기존 Event 타입 정의
- 기존 이벤트 저장 로직
- 기존 폼 검증 로직

## Integration Verification

**IV1:** 기존 단일 일정 생성 기능이 정상적으로 동작하는지 확인
**IV2:** 기존 일정 수정/삭제 기능이 반복 일정과 충돌하지 않는지 확인
**IV3:** 기존 검색 및 필터링 기능이 반복 일정을 포함하여 정상 동작하는지 확인
**IV4:** **백엔드 시스템이 전혀 변경되지 않았는지 확인**

## Story Handoff

**Developer Prompt:**

```
Assignment-7 프로젝트의 기존 시스템 아키텍처 문서를 참조하여 다음 요구사항을 구현해주세요:

**핵심 구현 요구사항:**
- 반복 패턴 계산 로직을 프론트엔드 유틸리티 함수로 구현
- 매일, 매주, 매월, 매년 반복 패턴에 대한 날짜 계산 함수 구현
- 반복 간격 및 종료 조건 처리 로직 구현
- 기존 useEventForm 훅에 반복 일정 생성 로직 통합

**중요한 제약사항 (백엔드 마이그레이션 배제):**
- 백엔드 시스템은 전혀 변경하지 않음
- 기존 JSON 파일 기반 시스템을 그대로 유지
- 기존 API 엔드포인트 구조를 그대로 활용
- 반복 일정을 개별 이벤트로 변환하여 기존 저장 로직 활용

**기존 시스템과의 통합 요구사항:**
- 기존 Event 인터페이스와 호환되는 반복 정보 필드 추가
- 기존 이벤트 생성 로직과의 호환성 보장
- 기존 데이터 저장 구조와의 호환성 보장
- 기존 UI/UX 패턴과의 일관성 유지

**구현 순서:**
1. 반복 일정 관련 타입 정의 추가
2. 반복 패턴 계산 유틸리티 함수 구현
3. useEventForm 훅에 반복 일정 생성 로직 통합
4. 단위 테스트 작성 및 실행
5. 기존 기능과의 호환성 검증

**중요:** 모든 구현은 기존 시스템의 무결성을 유지하면서 진행되어야 하며, 백엔드 변경은 절대 금지입니다. TDD 방식으로 개발하여 안정성을 확보하세요.
```

---

**Story Manager Notes:**
This story focuses on implementing the core logic for calculating repeating event patterns. It should be implemented using TDD approach and must maintain compatibility with existing functionality. **Backend changes are strictly prohibited** - all logic should be implemented on the frontend only.
