# Epic 6: 클린코드 리팩터링/표준화 (DRY/KISS/YAGNI/SRP)

## Epic Goal

코드의 가독성, 예측 가능성, 일관성, 유지보수성을 체계적으로 향상한다. 중복을 제거하고 단순화하며 불필요한 코드를 제거하고, 모든 함수가 단일 책임(20라인 이하)을 갖도록 리팩터링 규칙을 코드베이스 전반에 적용한다.

## Epic Description

**Existing System Context:**

- Tech stack: React 19.1.x, TypeScript, Vite, Vitest, Express.js, Material-UI
- Scope: 반복 일정 도메인(생성/수정/삭제/검색/알림/뷰), 테스트/빌드/도구 구성
- Constraints: 기능 스펙/외부 API/스토리지 구조/공개 타입은 변경 금지(내부 구조/이름/폴더링은 개선 가능)

**Refactoring Rules to Apply (Mandatory):**

- Core principles: DRY, KISS, YAGNI, Single Responsibility(모든 함수 20줄 이하, 하나의 책임)
- Organization: Proximity, Commonality, Similarity, Continuity
- Naming: 예측 가능(Predictable) · 맥락적(Contextual) · 명확(Clear) · 간결(Concise) · 일관(Consistent)
- Naming patterns: Action(`create|get|update|delete|validate|compute|init|save|log`…), Data(`count|is|has|current|selected|...s|...Id|...At|type`)

**Enhancement Details:**

- What's being changed:
  1) 중복 유틸/로직 통합 및 공통화, 2) 함수 단일 책임화/20줄 이하 분해, 3) 명명 체계 전면 정비, 4) 폴더/파일 구조를 의존 순서로 재배열, 5) 데드코드/미사용 타입/불필요 옵션 제거(YAGNI), 6) 린트/CI 게이트 추가로 규칙 지속 적용
- How it integrates:
  - 런타임 동작/퍼블릭 API/스토리지 포맷 불변. 내부 구현/이름/경로만 개선
  - 테스트 기준으로 동작 보존을 보장. 변경은 모두 테스트 그린 상태로 병합
- Success criteria:
  - 중복 제거, 함수 길이/책임 기준 충족, 명명 규칙 일관 적용, 폴더 구조 개선, CI 게이트 통과율 100%

## Stories

1. [Story 6.1: 명명/인터페이스 일관화](../stories/story-6-1-naming-and-interface-consistency.md)
   - 목표: Action/Data 네이밍 패턴 전역 적용, 용어 통일(`display` vs `show` 혼용 금지)
   - 산출물: 내부 리네이밍/코데모드, 네이밍 가이드/용어집
   - 수용 기준: 빌드/테스트 그린, 린트 경고 0, 공개 API 불변

2. [Story 6.2: 함수 단일 책임화 및 20줄 기준화](../stories/story-6-2-single-responsibility-20-lines.md)
   - 목표: 복합 함수 분리, 가드절/조기 반환, 중첩 최소화
   - 산출물: 소함수 추출, 유틸 이동, 함수 길이/복잡도 린트
   - 수용 기준: 20줄 규칙 적용, 지표 개선, 테스트 그린

3. [Story 6.3: DRY/KISS/YAGNI 적용과 구조 정리](../stories/story-6-3-dry-kiss-yagni-structure.md)
   - 목표: 중복 유틸 통합, 데드코드 제거, 의존 순서 재정렬
   - 산출물: 공통 모듈/제거 목록, 임포트 경로 정리
   - 수용 기준: 번들/타입 크기 감소, import 단순화, 회귀 없음

## Compatibility Requirements

- [x] 퍼블릭 타입/함수 시그니처, API 경로/계약, 스토리지 포맷 불변
- [x] 동작/UX 변화 없음(내부 리팩터링에 한정)
- [x] 기존 테스트 전부 그린, 회귀 테스트 추가로 동치성 검증
- [x] 성능 비퇴행(= 또는 개선)

## Risk Mitigation

- 작은 PR 단위/폴더 단위로 점진 적용, 변경 영향 최소화
- 테스트 우선(TDD/회귀)로 리팩터링 안전망 확보, CI 병렬로 빠른 피드백
- 타입 우선 리팩터링(명시적 타입/불변 구조)로 런타임 리스크 저감
- 변경 가이드/용어집 제공으로 리뷰 속도 향상

## Definition of Done

- [ ] 명명 규칙: Action/Data 패턴 100% 적용, 동의어 혼용 제거
- [ ] 함수 규칙: 모든 함수 단일 책임, 20줄 이하, 가드절/조기 반환 사용
- [ ] 구조 규칙: Proximity/Commonality/Similarity/Continuity 반영한 폴더/파일 정리
- [ ] 중복 제거: 동일/유사 로직 통합, 유틸 공통화, 데드코드 0
- [ ] 린트/형상: ESLint 규칙 추가/적용, 자동 수정 스크립트 제공, CI 게이트 통과
- [ ] 테스트: 기존 전부 그린, 경계/에러 경로 포함 검증, 회귀 없음
- [ ] 문서화: 네이밍 가이드/리팩터링 가이드/변경 로그 반영

## Technical Integration Details

**Lint/Rules:**

- `@typescript-eslint` 규칙 활성화: max-lines-per-function(20), complexity, no-duplicate-imports, no-restricted-syntax(금지 용어), consistent-type-definitions, naming-convention(액션/데이터 접두사), import/order(Proximity/Continuity 반영)
- 스크립트: `pnpm lint:fix:refactor`(자동 수정), `pnpm check:srp`(함수 길이/복잡도 리포트)

**Codemods/Automation:**

- `ts-morph/jscodeshift`로 배치 리네이밍/유틸 합치기, 데드코드 제거 검출(report + 삭제 PR)
- 임포트 경로 재작성(index 정리, 배럴 제거/도입 정책 명확화)

**Folder Structure Guidance:**

- 도메인 우선 + 의존 순서 정렬: 타입 → 유틸(순수) → 상태 → 훅 → 컴포넌트 → 엔트리
- 유틸 명확 분리: 날짜/이벤트/알림/저장 별 하위 모듈과 공통 모듈로 재배치

**CI Gates:**

- 린트/타입/테스트 모두 필수, 함수 길이/복잡도 위반 Fail, 커버리지 하한 유지
- 변경량이 큰 PR은 스모크 회귀 시나리오 병행 실행

## Success Metrics

- 린트 위반(함수 길이/복잡도/네이밍) 0
- 중복율 감소(예: `sonarqube` 또는 유사 리포트 기준) ≥ X%
- 번들 크기/타입 크기 감소, 임포트 경로 길이 평균 감소
- 테스트 실행 시간/플레이키 0 유지, 실패 케이스 즉시 원인 추적 가능

## Dependencies

- Epic 4(테스트 품질)와 정렬: 빌더/픽스처/가이드 활용하여 안정적 리팩터링
- 기존 스토리/PRD 문서 링크로 기대값 보존 근거 유지

## Performance Considerations

- 런타임/빌드 성능 비퇴행 원칙. 중복 제거/조기 반환으로 경로 단축 효과 기대
- CI 캐시/병렬화로 리팩터링 PR 처리 시간 유지/개선

---

**Story Manager Handoff:**

"Please develop detailed stories for this clean code refactoring epic. Key considerations:

- No behavior change. Public APIs/types/storage contracts must remain intact
- Apply DRY/KISS/YAGNI/SRP and the naming/organization rules across the codebase
- Enforce with lint rules/automation, verify with full test suite and CI gates
- Each story must prove equivalence with pre/post behavior using tests and metrics"


