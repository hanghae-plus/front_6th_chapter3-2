# Story 4.8: 기존 테스트에 가이드 적용(표준화 리팩토링)

## Goal
기존 테스트 전반에 Epic 4 테스트 가이드(패턴/빌더·픽스처/MSW 오버라이드/스냅샷 정책)를 적용한다.

## User Story
As a QA/Dev, I want all tests to follow the guideline so that they are readable, stable, and consistent.

## Scope
- 대상: `src/__tests__/utils`, `src/__tests__/hooks`, `src/__tests__/integration`, `src/__tests__/regression`
- 제외: 스펙 변경이 필요한 테스트(별도 스토리로 분리)

## Acceptance Criteria
- GWT(Given-When-Then) 구조를 적용(설명 주석 또는 단계적 블록)
- 공통 빌더/픽스처(`builders.ts`, `fixtures.ts`) 적극 사용(중복 데이터 제거)
- MSW 전역 의존 최소화, 테스트별 `server.use(...)` 오버라이드 적용 예시 포함
- 스냅샷 남용 제거: 의미 있는 단언으로 치환(접근성/텍스트/속성)
- 콘솔 경고 최소화(필요 시 명시적 처리)

## Technical Notes
- 기능 기대값은 변경하지 않는다(리팩토링만). 스펙 변경은 별도 PR/스토리.
- 파일 단위로 작은 PR을 선호(리뷰 용이성).

## Plan (Phased)
1) Utils/Hook 테스트 정리 → 2) Integration/Regression 정리 → 3) 문서/가이드 보완

## DoD
- [ ] Utils/Hook 디렉토리 가이드 적용 완료
- [ ] Integration/Regression 디렉토리 가이드 적용 완료
- [ ] 스냅샷 최소화 및 대체 단언 반영
- [ ] MSW 오버라이드 패턴 사용 확인(샘플 포함)
- [ ] 문서 최신화 및 링크: [테스트 가이드라인](../qa/test-guidelines.md)
