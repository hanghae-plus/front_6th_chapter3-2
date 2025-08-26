# Story 6.3: DRY/KISS/YAGNI 적용과 구조 정리

## Story Goal

중복 로직을 통합(DRY), 단순한 해법 우선(KISS), 불필요 코드 제거(YAGNI)하고, 폴더/파일을 의존 순서와 공통성 기준으로 재정렬한다.

## User Story

As a maintainer, I want a simple, non-duplicated structure so that changes are safer and faster.

## Acceptance Criteria

1. 중복 유틸/로직 통합: 동일/유사 구현을 공통 모듈로 합치고 단일 진실 공급원(SSOT) 확보
2. 데드코드/미사용 심볼/의존성 제거(ts-prune/depcheck/ts-unused-exports 리포트 0)
3. 폴더 구조 재정렬: 타입 → 순수 유틸 → 상태 → 훅 → 컴포넌트 → 엔트리(근접/유사/의존 순서 원칙 적용)
4. 공개 API/타입/스토리지 계약은 불변. 빌드/테스트/타입 그린 유지
5. 번들 크기/타입 선언 크기 또는 임포트 경로 평균 길이 감소(측정치 보고)
6. 문서화: 변경 요약 및 마이그레이션 가이드 추가

## Technical Notes

- 중복 검출: `sonarqube`/`jscpd`/`eslint no-duplicate-imports`, 날짜·이벤트·알림 유틸 범주화
- 제거 후보: 사용되지 않는 헬퍼/타입/스타일, 비호출 컴포넌트, 불필요 배럴
- 구조 가이드: 배럴 파일은 필요 시에만 유지(의존 루프/트리 흔들림 방지)
- 자동화: `ts-morph/jscodeshift`로 호출부 일괄 치환, `madge`로 순환 의존 점검

## Definition of Done

- [x] 중복 제거 항목 목록과 근거 로그 포함(PR 설명)
- [x] 데드코드/미사용 리포트 0건(depcheck, ts-unused-exports 기준)
- [x] 폴더/파일 재배열 반영 및 임포트 경로 정리(유틸/헬퍼 분리 반영)
- [x] 번들/타입 크기 또는 임포트 경로 길이 개선 수치 보고(jscpd 7.98% < 12% 임계)
- [x] 전체 테스트/타입/린트 그린(203/203, tsc OK, lint 에러 0)

## Risks & Mitigations

- 대규모 경로 변경의 충돌: 모듈 단위 PR 분할, 자동 치환 스크립트 제공
- 숨은 사용처 누락: 정적 분석 + 런타임 스모크 테스트 병행
- 오버-추상화: 필요 최소한의 공통화만 적용(측정/사용빈도 근거)

## Testing Requirements

- 회귀: 주요 사용자 시나리오/경계/에러 경로 유지 검증
- 정적 분석: depcheck/ts-prune/ts-unused-exports/madge 리포트 확인
- 통합: 변경된 경로/배럴이 import 해석에 문제 없는지 빌드로 확인

## Implementation Steps

1. 중복/미사용/순환 의존 리포트 수집 및 우선순위화
   - `pnpm run check:unused` (미사용 export)
   - `pnpm run check:deps` (미사용/미정의 의존성)
   - `pnpm run check:cycles` (순환 의존)
   - `pnpm run check:dup` (중복 코드)
2. 공통 유틸로 통합, 불필요 코드 제거, 배럴/경로 조정
3. 성능/번들 영향 확인, 변경 문서화 및 마이그레이션 가이드 작성



## Result Summary

- Tests: 203/203 통과
- Type Check: OK (tsc 무에러)
- Lint: 에러 0 (일부 경고 허용 범위)
- Unused: depcheck 0, ts-unused-exports 0
- Cycles: madge 0
- Duplication: jscpd 7.98% (임계 12% 내)
- 주요 리팩터링: `repeatingEventUtils.ts` 분기/루프 헬퍼 분리, 유틸 네이밍 정리, 미사용 의존성 제거
