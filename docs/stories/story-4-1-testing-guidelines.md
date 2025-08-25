# Story 4.1: 공통 테스트 가이드 문서화

## Goal
공통 테스트 원칙/패턴/MSW/스냅샷/커버리지 가이드를 문서화한다.

## User Story
As a QA/Dev, I want a single test guideline so that tests are consistent and stable.

## Acceptance Criteria
- `docs/qa/test-guidelines.md` 문서가 존재한다(패턴, 명명, MSW 오버라이드, 스냅샷 정책 포함)
- 커버리지 목표(라인≥85%, 브랜치≥80%) 명시 및 Epic 4에서 참조
- 최소 1개 기존 테스트가 가이드에 맞게 리팩토링 예시 포함

## Technical Notes
- GWT 패턴, 의미 있는 단언, 전역 MSW 최소화, 테스트별 `server.use(...)`
- 참조: docs/qa/test-guidelines.md

## DoD
- [x] 문서 초안 작성 및 리뷰
- [x] 스토리/에픽 링크 반영
- [x] 예시 테스트 1건 리팩토링
