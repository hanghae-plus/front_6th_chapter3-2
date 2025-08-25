# Epic 4: 테스트 가이드 적용 QA 리뷰 요약

## 개요
- 전체 테스트: 192/192 통과(로컬 실행 기준)
- 콘솔 경고: MUI Select out-of-range(`none`) 경고는 `src/setupTests.ts`에서 명시 필터링 적용
- MSW: 전역 최소화 + 테스트별 `server.use(...)` 오버라이드 패턴 활용 확인
- 스냅샷: 사용 없음(구체 단언으로 대체)

## 스토리별 상태
- 4.1 공통 테스트 가이드 문서화: Pass
  - `docs/qa/test-guidelines.md` 존재, 패턴/명명/MSW/스냅샷/커버리지 목표 명시
  - 예시 리팩토링 존재(가이드 참조 링크 반영)

- 4.2 빌더/픽스처 도입: Pass
  - `src/__tests__/utils/builders.ts`, `src/__tests__/utils/fixtures.ts` 존재 및 실제 테스트에서 사용
  - 제공 빌더: `buildRepeatInfo`, `buildEventForm`, `buildEvent`, `withRepeat`, `resetTestIds`

- 4.3 MSW 구조·오버라이드: Pass
  - 테스트별 `server.use(...)` 오버라이드 다수 확인(훅/통합/리그레션)
  - 4xx/5xx/네트워크 오류 시나리오 포함

- 4.4 Flaky 안정화: Pass
  - TZ 고정 및 가짜 타이머(`vi.useFakeTimers`, `vi.setSystemTime`) 일관 적용

- 4.5 스냅샷 정책 정리: Pass
  - 의미 있는 단언으로 대체, 스냅샷 남용 없음

- 4.6 커버리지 보강: 주의
  - 중요 분기/경계 케이스(weekday, excludeDates, bulk API) 테스트 존재
  - 권고: 커버리지 임계값(라인≥85%, 브랜치≥80%)를 Vitest 설정으로 강제(예: CI 실패 조건)

- 4.7 테스트 CI 최적화: Pass(문서 기준)
  - 정책 문서화 OK. 실제 시간 단축 수치는 CI 리포트 연동 시 확인 필요

- 4.8 가이드 적용(표준화 리팩토링): Pass
  - GWT 구조/빌더·픽스처 사용/오버라이드 샘플/스냅샷 제거/콘솔 경고 최소화 충족
  - 기존 테스트 수정 최소 원칙 준수(가능한 추가 방식)

## 증빙(경로)
- 가이드: `docs/qa/test-guidelines.md`
- 콘솔 필터: `src/setupTests.ts`
- 빌더/픽스처: `src/__tests__/utils/builders.ts`, `src/__tests__/utils/fixtures.ts`
- 오버라이드 예시: `src/__tests__/integration/msw.override.example.spec.ts`, `src/__tests__/hooks/medium.useEventOperations.spec.ts`, `src/__tests__/medium.integration.spec.tsx`

## 개선 제안
- 커버리지 임계값을 Vitest 설정에 추가하여 CI에서 자동 검증
- 가이드 문서에 “허용된 콘솔 필터 예외(MUI Select out-of-range)” 항목을 명시하여 투명성 확보

## 결론
- Epic 4 수락 기준 전반 충족. 커버리지 임계값 강제 및 CI 리포트 연동을 차기 작업으로 권장.
