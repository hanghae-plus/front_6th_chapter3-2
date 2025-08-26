# Story 5.2: 반복 종료 상한 정책 품질 리뷰

## 품질 게이트 결정

**상태: PENDING** (구현/테스트 완료 시 PASS로 갱신)

## 검증 근거(예정)

1. 종료일 미지정 시 `effectiveEnd = '2025-10-30'` 적용 확인 (상한 초과 미생성)
2. 종료일 지정 시 상한 미적용 및 지정 종료일까지 생성 확인
3. 종료일 미지정 시 최대 10회 제한 적용, 종료일 지정 시 10회 제한 미적용 확인
4. 통합/회귀 영향 없음 확인

## 테스트 커버리지 체크리스트

- ✅ 종료일 미지정 + 상한 적용 테스트 (`src/__tests__/utils/repeatingEventUtils.spec.ts`)
- ✅ 종료일 지정 + 상한보다 늦어도 종료일까지 생성 테스트 (`src/__tests__/utils/repeatingEventUtils.spec.ts`)
- ✅ 종료일 미지정 시 최대 10회 제한 테스트 (`src/__tests__/regression/story-2-3.regression.spec.ts`, `src/__tests__/utils/repeatingEventUtils.coverage.examples.spec.ts`)
- ⬜ 기존 동작 회귀 확인

## 위험/주의사항

- 상한/종료일 비교 시 타임존/문자열 비교 일관성 유지
- 상한 상수의 구성 가능성(추후 설정 분리) 검토

## 요구사항 추적성

- Epic 5 요구사항 3) 종료 상한 적용(미지정 시) 반영
- Story 문서: `docs/stories/story-5-2-enddate-cap-policy.md`
