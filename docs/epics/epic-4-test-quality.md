# Epic 4: 테스트 품질 개선/표준화

## Goal

테스트의 안정성, 가독성, 추적성, 커버리지를 체계적으로 향상한다. 플레이키(Flaky)를 제거하고, 표준 패턴과 픽스처/빌더를 도입해 유지보수 비용을 낮춘다.

## Scope

- 플레이키 안정화(타임존/랜덤/비결정성 제거)
- MSW 구조 정비(전역 최소화, 테스트별 오버라이드)
- Gherkin/GWT(Given-When-Then) 패턴 및 명명 규칙 표준화
- 스냅샷 최소화 및 의미 있는 단언으로 대체
- 픽스처/테스트 데이터 빌더 도입
- 커버리지 보완: `repeat.id`/bulk API/weekday/exception dates/경계값
- CI 최적화(캐시/병렬화) 및 실행 시간 단축

## Non-Functional Alignment

- 신뢰성: Flaky 0건 목표, 실패 원인 즉시 식별 가능
- 유지보수성: 테스트 중복 제거, 공통 유틸/픽스처화
- 성능: 실행 시간 단축, 불필요한 렌더/대기 제거

## Success Metrics

- Flaky 테스트 0건
- 라인 커버리지 ≥ 85%, 브랜치 커버리지 ≥ 80%
- 평균 테스트 실행 시간 X% 단축(목표치 팀 합의)
- 신규/변경 스토리의 요구사항-테스트 추적성 100%

## Definition of Done

- 공통 테스트 가이드 문서화(패턴, 명명, 픽스처/빌더, MSW 가이드)
- 전역 MSW 의존 최소화, 테스트별 `server.use(...)` 오버라이드로 정리
- 스냅샷은 꼭 필요한 경우만 사용, 나머지는 명시적 단언으로 교체
- 경계/에러/성공 경로에 대한 커버리지 목표 달성
- CI에서 플래키 0건 유지, 병렬 실행 안정화

## Work Items

1. 테스트 가이드 문서 작성(`docs/qa/test-guidelines.md`)
2. 공통 픽스처/빌더 추가(`src/__tests__/utils/builders.ts`, `fixtures.ts`)
3. MSW 핸들러 정비: 전역 최소화, 스토리별/테스트별 오버라이드 샘플 추가
4. Flaky 케이스 정리: 타임존 고정, 가짜 타이머, 랜덤 시드 고정
5. 스냅샷 정리: 의미 없는 스냅샷 제거 및 명시 단언으로 교체
6. 커버리지 보완: `repeat.id`, `/api/events-list`(POST/PUT/DELETE), `weekdays`, `excludeDates` 경계값 추가 테스트
7. CI 튜닝: 캐시/병렬화, 타임아웃 재조정

## QA Gate Criteria

- Gate: PASS 기준
  - Flaky=0, 커버리지 목표 충족, 가이드/유틸 반영 PR 병합
  - 대표 시나리오(성공/에러/경계) 각각 최소 1개 이상 포함
- Gate: CONCERNS/FAIL 기준
  - 플래키 잔존, 커버리지 미달, 문서/유틸 누락

## Risks & Mitigations

- 대규모 변경으로 인한 충돌: 작은 PR로 분할, 점진 적용
- 스펙-테스트 불일치: PRD/Story 링크로 기대값 근거 명시
- 전역 핸들러 변경에 따른 영향: 테스트별 오버라이드 우선 정책

## Traceability

- 요구사항 ↔ 테스트 케이스 매핑 표를 스토리 문서 하단에 유지
- Epic 4 완료 시, 기존 스토리 문서의 테스트 설계는 Epic 4 가이드 링크로 대체

## Out of Scope

- 기능 스펙 변경(PRD 변경)은 본 Epic 범위 밖. 필요 시 별도 스토리로 분리


