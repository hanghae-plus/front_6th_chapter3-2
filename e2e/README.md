# E2E 테스트 가이드

이 프로젝트는 Playwright를 사용하여 E2E 테스트를 구현했습니다.

## 테스트 실행 방법

### 1. 기본 E2E 테스트 실행

```bash
pnpm test:e2e
```

### 2. UI 모드로 테스트 실행 (브라우저에서 시각적으로 확인)

```bash
pnpm test:e2e:ui
```

### 3. 헤드리스가 아닌 모드로 테스트 실행 (브라우저 창이 보임)

```bash
pnpm test:e2e:headed
```

### 4. 디버그 모드로 테스트 실행

```bash
pnpm test:e2e:debug
```

## 테스트 구성

### 테스트 파일

- `e2e/calendar-app.spec.ts`: 캘린더 앱의 주요 기능들을 테스트

### 주요 테스트 시나리오

1. **일정 생성, 수정, 삭제 및 반복 일정 기능**

   - 새로운 일정 생성
   - 기존 일정 수정
   - 반복 일정 생성 (매일, 매주)
   - 검색 기능
   - 뷰 전환 (주별/월별)
   - 일정 삭제

2. **일정 겹침 경고**

   - 겹치는 시간대에 일정 생성 시 경고 표시
   - 경고 후 계속 진행 기능

3. **매주 반복 일정**
   - 매주 반복되는 일정 생성
   - 반복 종료일 설정

## 브라우저 지원

- Chromium
- Firefox
- WebKit (Safari)

## CI/CD 지원

- GitHub Actions에서 자동으로 실행됩니다.
- CI 환경에서는 GitHub reporter를 사용합니다.
- 실패 시 Playwright 리포트가 아티팩트로 저장됩니다.

## 주의사항

- E2E 테스트 실행 시 개발 서버가 자동으로 시작됩니다.
- 테스트는 `http://localhost:5173`에서 실행됩니다.
- CI 환경에서는 더 안정적인 설정으로 동작합니다.
- TypeScript 타입 체크를 위한 전용 설정 파일(`tsconfig.playwright.json`) 사용
