# Story 5.2: 반복 종료 상한(End Date Cap) 정책 적용

## Story Goal

사용자가 종료일을 지정하지 않더라도 반복 생성의 상한을 특정 날짜(예: 2025-10-30)로 캡핑하여 무한 생성/성능 문제를 방지합니다.

## User Story

**As a** 사용자,
**I want** 종료일을 비워도 과도한 반복 생성이 되지 않도록 시스템 상한을 두고,
**so that** 앱 성능과 안정성을 확보하고 싶다.

## Acceptance Criteria

1. 종료일이 비어있는 경우 내부적으로 `effectiveEnd = min(userEndDate ?? Infinity, '2025-10-30')`를 사용한다.
2. 상한 날짜를 초과하는 반복 인스턴스는 생성되지 않는다.
3. 기존 종료일 지정 동작은 그대로 유지한다.

## Technical Notes

- 대상 파일: `src/utils/repeatingEventUtils.ts`
- 함수: `calculateRepeatingDates(repeatInfo, startDate)`
- 내부 비교용 상한 상수: `'2025-10-30'` (예제 정책)
- 비교 시 ISO 날짜 문자열 기준으로 비교하거나 UTC 정규화하여 비교 일관성 보장

## Definition of Done

- [ ] 종료일 미지정 시 2025-10-30을 넘는 생성이 되지 않음을 단위 테스트로 검증
- [ ] 종료일 지정 시 사용자가 지정한 종료일과 상한 중 더 이른 날짜가 적용됨을 검증
- [ ] 기존 기능 회귀 이상 없음
- [ ] 문서 반영(본 문서) 완료

## Testing Requirements

- 단위 테스트 추가: `src/__tests__/utils/repeatingEventUtils.spec.ts`
  - 종료일 미지정 + 상한 적용 케이스
  - 종료일 지정 + 상한보다 늦은 날짜 지정 시 상한 적용 케이스

## Risks / Notes

- 타임존에 따른 날짜 비교 오프셋 방지(문자열 비교 또는 UTC 고정)
- 상한 날짜는 구성 가능 상수로 분리 고려(현 에픽에서는 하드코딩 허용)
