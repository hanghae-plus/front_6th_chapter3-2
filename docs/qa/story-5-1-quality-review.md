# Story 5.1: 월/연 반복 경계 규칙 품질 리뷰

## 품질 게이트 결정

**상태: PENDING** (구현/테스트 완료 시 PASS로 갱신)

## 검증 근거(예정)

1. `src/utils/repeatingEventUtils.ts`의 `calculateRepeatingDates` 보정 확인
2. 단위 테스트에서 다음 시나리오 통과 확인:
   - 월 31일 시작: 31일 없는 달 미생성
   - 연 2/29 시작: 비윤년 미생성
3. 통합/회귀 영향 없음 확인(주/일 반복 및 아이콘 표시 유지)

## 테스트 커버리지 체크리스트

- ✅ 월 31일 시작 보정 테스트 추가 (`src/__tests__/utils/repeatingEventUtils.spec.ts`)
- ✅ 연 2/29 시작 보정 테스트 추가 (`src/__tests__/utils/repeatingEventUtils.spec.ts`)
- ⬜ 기존 반복 표시/주간 동작 회귀 확인

## 위험/주의사항

- 타임존 변환으로 인한 day mismatch 가능성 → ISO 문자열 비교 권장
- 과거 말일 보정 로직 존재 시 충돌 가능성 → 정확 일자 매칭만 허용

## 요구사항 추적성

- Epic 5 요구사항 1) 월/연 경계 규칙 준수 반영
- Story 문서: `docs/stories/story-5-1-monthly-yearly-boundary-rules.md`
