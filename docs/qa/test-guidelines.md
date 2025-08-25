# 테스트 가이드라인 (Epic 4)

## 철학
- 추가 우선, 수정 최소 (기존 테스트 보존)
- 결정성 확보 (타임존/랜덤/네트워크 비결정성 제거)
- 가독성 (GWT 패턴, 의미 있는 단언)

## 패턴
- 명명: `should <행동> when <조건>`
- 구조: Given → When → Then
- 데이터: 픽스처/빌더 활용 (예: `buildEventForm`, `buildRepeatInfo`)

## MSW 가이드
- 전역 핸들러 최소화
- 테스트별 `server.use(...)` 오버라이드 우선
- 4xx/5xx/네트워크 오류 시나리오 포함

## 스냅샷 정책
- 전체 스냅샷 지양, 구체 단언 선호(텍스트/속성/접근성)

## 커버리지 목표
- 라인 ≥ 85%, 브랜치 ≥ 80%
- 경계/에러 경로 포함

## 예시 (GWT + 빌더)
```ts
// Given
const base = buildEventForm();
const repeat = buildRepeatInfo({ type: 'weekly', interval: 2, endDate: '2025-02-01' });

// When
const dates = calculateRepeatingDates(repeat, base.date);

// Then
expect(dates.length).toBeGreaterThan(0);
```
