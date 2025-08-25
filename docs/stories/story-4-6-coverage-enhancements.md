# Story 4.6: 커버리지 보강(repeat.id/bulk API/weekday/excludeDates)

## Goal
중요 분기/경계 케이스 커버리지를 강화한다.

## User Story
As a QA, I want high coverage on critical paths so that 회귀 위험을 낮춘다.

## Acceptance Criteria
- repeat.id 생성/전파/보존 경계 테스트 추가
- /api/events-list POST/PUT/DELETE 성공/실패/부분 실패(가능 시) 추가
- weekdays 및 excludeDates 경계/충돌 케이스 추가

## Technical Notes
- MSW로 정상/에러/빈 응답 케이스 구성

## DoD
- [ ] 라인≥85%, 브랜치≥80% 달성
- [ ] 회귀 스위트에 시나리오 편입
