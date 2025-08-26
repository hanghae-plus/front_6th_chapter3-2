# Epic 7: App.tsx 리팩터링

## Epic Goal

`App.tsx`의 복잡도를 단계적으로 낮추고(가독성/예측가능성/유지보수성 향상), 상태 최소-표현 최대 원칙으로 화면을 구성하며, 전역적으로 추상화 레벨을 정렬한다.

## Why Now

`App.tsx`는 기능이 집중되어 복잡도, 상태 분산, 의존 흐름 혼합 문제가 있다. 폼 로직/상태/뷰의 경계를 명확히 하여 변경 비용과 회귀 위험을 줄인다.

## Scope

- Story 7-1: `useEventForm` 리팩터링(단일 책임, 보조 헬퍼 분리, 네이밍 정리)
- Story 7-2: 상태 축소와 computed UI 적용(`App.tsx` 불필요 상태 제거/유도)
- Story 7-3: 추상화 레벨 정렬(도메인/훅/컴포넌트 경계 및 의존 방향 정돈)

## Success Metrics (SM)

- SM1: `App.tsx` 함수/핵심 핸들러의 cyclomatic complexity 30%+ 감소(린트 기준)
- SM2: `App.tsx` 내 로컬 상태 수 30%+ 감소, 메모이제이션/selector 적용으로 재렌더링 횟수 감소(샘플 측정)
- SM3: 테스트 100% 그린, `jscpd` 중복률 유지 또는 개선(<= 현행 7.98%)

## Acceptance Criteria

1. `useEventForm`가 단일 책임으로 분해되고, 유틸/헬퍼로 공통화된다.
2. `App.tsx`에서 파생 가능한 값은 상태로 두지 않고 computed로 유도된다.
3. 도메인 로직은 훅/유틸 계층으로 이동, 컴포넌트는 표현 역할에 집중한다.
4. 린트/타입/테스트 그린, 품질 리포트(check:srp/unused/dep/cycles/dup) 기준 만족.

## Non-Goals

- UI/UX 시각적 변경(스펙 외 레이아웃 변경) 포함하지 않음.
- 서버 API 스키마 변경 불포함.

## Technical Notes

- 스크립트 활용: `pnpm run check:srp`, `check:unused`, `check:deps`, `check:cycles`, `check:dup`
- 상태 축소 원칙: 단일 소스, 파생값은 selector/memo로 유도
- 경계: types → utils(pure) → states → hooks → components → entry

## Risks & Mitigations

- 대규모 이동에 따른 충돌: 단계별 PR/커밋, 자동 치환 스크립트 활용
- 숨은 사이드이펙트: 테스트/회귀 시나리오 병행, 훅 레벨에서 통합 테스트 유지

## Definition of Done

- [ ] Story 7-1 완료: 훅/헬퍼 분리, 린트/테스트 그린
- [ ] Story 7-2 완료: 상태 축소 및 computed 전환, 재렌더링 감소 확인
- [ ] Story 7-3 완료: 계층 경계/의존 정리, 네이밍/폴더 구조 반영
- [ ] 품질 리포트 체크(사용자 지정 임계 준수) 및 결과 기록

## Stories

- [Story 7-1: useEventForm 리팩터링](../stories/story-7-1-useEventForm-refactor.md)
- [Story 7-2: 상태 축소와 computed UI](../stories/story-7-2-computed-state-ui.md)
- [Story 7-3: 추상화 레벨 정렬](../stories/story-7-3-abstraction-levels.md)
- [Story 7-4: 선언적 다이얼로그 관리(overlay-kit 도입)](../stories/story-7-4-overlay-declarative-dialogs.md)


