# Story 4.3: MSW 구조 정비와 테스트별 오버라이드

## Goal
전역 핸들러 의존을 줄이고 테스트별 `server.use(...)` 오버라이드 패턴을 표준화한다.

## User Story
As a QA/Dev, I want isolated handlers so that tests are deterministic and independent.

## Acceptance Criteria
- 전역 핸들러 최소화 가이드 수립 및 샘플 2건 적용
- 실패(4xx/5xx/네트워크) 시나리오 오버라이드 예시 포함

## Technical Notes
- 기존 핸들러 파일 구조 유지하되 story/test 로컬 오버라이드 사용 강화

## DoD
- [ ] 샘플 테스트 2건 리팩토링
- [ ] 가이드에 패턴 반영
