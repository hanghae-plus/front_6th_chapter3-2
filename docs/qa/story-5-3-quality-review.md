# Story 5.3: 단일 수정 단일화 품질 리뷰

## 품질 게이트 결정

**상태: PENDING** (구현/테스트 완료 시 PASS로 갱신)

## 검증 근거(예정)

1. `src/App.tsx` 저장 시점에 `updateScope === 'single'`일 때 `repeat: { type: 'none', interval: 1 }` 강제 세팅 확인
2. 통합 테스트에서 단일 수정 후 해당 인스턴스의 반복 아이콘 비표시 확인
3. 기존 단일/전체 삭제 동작 회귀 이상 없음 확인

## 테스트 커버리지 체크리스트

- ✅ 통합 테스트: 단일 수정 후 저장 → `repeat.type === 'none'` 검증 (`src/__tests__/integration/*`)
- ✅ UI 회귀: 단일화 인스턴스의 반복 아이콘 미표시 확인
- ⬜ 삭제 플로우(단일/전체) 회귀 확인

## 위험/주의사항

- 폼 상태와 저장 로직 불일치 위험 → 저장 직전 강제 세팅으로 일관성 확보
- `repeat.id` 잔존 시 후속 편집 영향 가능성 → `type` 기준 표시 유지로 영향 최소화

## 요구사항 추적성

- Epic 5 요구사항 4) 단일 수정 시 단일화 및 아이콘 제거 반영
- Story 문서: `docs/stories/story-5-3-single-edit-flattening.md`
