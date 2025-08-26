# Story 4.7: 테스트 CI 최적화

## Goal
테스트 실행 시간을 단축하고 안정성을 높인다.

## User Story
As a DevOps, I want faster and reliable CI so that 개발 피드백 주기가 짧아진다.

## Acceptance Criteria
- 캐시/병렬화/타임아웃 정책 정립
- 평균 실행 시간 X% 단축(팀 합의치 반영)

## Technical Notes
- Vitest 캐시, 워크스페이스 분할, flaky 재시도 제한

## DoD
- [x] 파이프라인 설정 PR 병합
- [x] 실행 시간 리포트 공유
