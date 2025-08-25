# Story 4.2: 공통 테스트 빌더/픽스처 도입

## Goal
중복을 줄이고 의도를 드러내는 테스트 데이터 빌더/픽스처를 도입한다.

## User Story
As a Dev, I want reusable builders/fixtures so that tests are concise and clear.

## Acceptance Criteria
- `src/__tests__/utils/builders.ts`, `fixtures.ts` 제공 및 사용 예시 PR
- 빌더: `buildRepeatInfo`, `buildEventForm`, `buildEvent`, `withRepeat`, `resetTestIds`
- 픽스처: 대표 반복/단일 이벤트 세트 제공

## Technical Notes
- 타입은 `src/types.ts` 재사용, 기본값은 안정적인 결정값 사용

## DoD
- [x] 유틸 추가 및 샘플 리팩토링 2건
- [x] 문서(`test-guidelines.md`)에 예시 링크
