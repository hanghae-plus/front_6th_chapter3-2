# Story 4.4: Flaky 테스트 안정화(타임존/타이머/랜덤)

## Goal
비결정성 요인을 제거해 테스트를 안정화한다.

## User Story
As a Dev, I want stable tests so that CI가 일관되게 통과한다.

## Acceptance Criteria
- 타임존 고정, 가짜 타이머 적용 가이드 및 샘플 2건
- 랜덤 시드 고정 유틸/가이드 제공

## Technical Notes
- Date/Intl, setTimeout 지연, Math.random 시드 처리

## DoD
- [ ] 불안정 사례 2건 재현 및 고정
- [ ] 가이드에 체크리스트 추가
