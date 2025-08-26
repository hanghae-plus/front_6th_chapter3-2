# Assignment-7 Brownfield Architecture Document

## 소개

이 문서는 Assignment-7 프로젝트 코드베이스의 **현재 상태**를 포착하며, 기술적 부채, 우회 방법, 실제 패턴을 포함합니다. 이는 향상을 위해 작업하는 AI 에이전트를 위한 참조 자료로 활용됩니다.

### 문서 범위

전체 시스템에 대한 포괄적인 문서화

### 변경 로그

| 날짜   | 버전 | 설명                     | 작성자    |
| ------ | ---- | ------------------------ | --------- |
| 2024   | 1.0  | 초기 brownfield 분석     | Winston   |

---

## 빠른 참조 - 주요 파일 및 진입점

### 시스템 이해를 위한 중요 파일

- **메인 진입점**: `src/main.tsx` (React 애플리케이션 진입점)
- **메인 컴포넌트**: `src/App.tsx` (661줄의 단일 파일 컴포넌트)
- **설정**: `vite.config.ts`, `tsconfig.json`, `eslint.config.js`
- **핵심 비즈니스 로직**: `src/hooks/` (커스텀 훅들)
- **API 정의**: `server.js` (Express 서버, 로컬 개발용)
- **데이터 모델**: `src/types.ts` (TypeScript 타입 정의)
- **테스트**: `src/__tests__/` (Vitest + React Testing Library)

---

## 고수준 아키텍처

### 기술 요약

Assignment-7은 TypeScript/React 기반의 프론트엔드 전용 캘린더 애플리케이션입니다. 이벤트 관리, 알림, 검색 기능을 제공하며, 로컬 JSON 파일을 데이터 저장소로 사용합니다.

### 실제 기술 스택 (package.json 기준)

| 카테고리 | 기술 | 버전 | 비고 |
| -------- | ---- | ---- | ---- |
| **런타임** | Node.js | - | ES 모듈 지원 |
| **프론트엔드 프레임워크** | React | 19.1.0 | 최신 React 기능 |
| **언어** | TypeScript | 5.2.2 | 타입 안전성 |
| **빌드 도구** | Vite | 7.0.2 | 빠른 개발 환경 |
| **UI 라이브러리** | Material-UI | 7.2.0 | 일관된 디자인 |
| **상태 관리** | React Hooks | - | 커스텀 훅 기반 |
| **HTTP 클라이언트** | Fetch API | - | 네이티브 API |
| **백엔드** | Express | 4.19.2 | 로컬 개발용 |
| **테스트** | Vitest | 3.2.4 | Jest 호환 |
| **패키지 매니저** | pnpm | - | 빠른 설치 |

### 저장소 구조 현실 점검

- **타입**: 단일 저장소 (Monorepo 아님)
- **패키지 매니저**: pnpm
- **주목할 점**: 프론트엔드와 백엔드가 같은 저장소에 있지만 분리된 구조

---

## 소스 트리 및 모듈 조직

### 프로젝트 구조 (실제)

```text
assignment-7/
├── src/
│   ├── __mocks__/           # MSW 모킹 데이터 및 핸들러
│   │   ├── handlers.ts      # API 모킹 핸들러
│   │   ├── handlersUtils.ts # 테스트용 유틸리티
│   │   └── response/        # 모킹 응답 데이터
│   ├── __tests__/           # 테스트 파일들
│   │   ├── hooks/           # 훅별 단위 테스트
│   │   ├── unit/            # 유틸리티 단위 테스트
│   │   ├── medium.integration.spec.tsx # 통합 테스트
│   │   └── utils.ts         # 테스트 유틸리티
│   ├── apis/                # API 관련 함수들
│   │   └── fetchHolidays.ts # 공휴일 API (실제 외부 API 없음)
│   ├── hooks/               # 커스텀 훅들
│   │   ├── useEventForm.ts  # 이벤트 폼 상태 관리
│   │   ├── useEventOperations.ts # 이벤트 CRUD 작업
│   │   ├── useNotifications.ts   # 알림 관리
│   │   ├── useSearch.ts     # 검색 기능
│   │   └── useCalendarView.ts    # 캘린더 뷰 관리
│   ├── utils/               # 유틸리티 함수들
│   │   ├── dateUtils.ts     # 날짜 관련 유틸리티
│   │   ├── eventOverlap.ts  # 이벤트 중복 검사
│   │   ├── eventUtils.ts    # 이벤트 관련 유틸리티
│   │   ├── notificationUtils.ts # 알림 유틸리티
│   │   └── timeValidation.ts # 시간 유효성 검사
│   ├── App.tsx              # 메인 애플리케이션 (661줄)
│   ├── main.tsx             # 애플리케이션 진입점
│   ├── types.ts             # 타입 정의
│   └── setupTests.ts        # 테스트 설정
├── public/                  # 정적 파일들
├── docs/                    # 문서 (architecture.md만 존재)
├── server.js                # Express 서버 (로컬 개발용)
├── vite.config.ts           # Vite 빌드 설정
├── tsconfig.json            # TypeScript 설정
├── eslint.config.js         # ESLint 설정
├── package.json             # 의존성 및 스크립트
└── README.md                # 최소한의 설명
```

### 주요 모듈과 그 목적

- **이벤트 관리**: `src/hooks/useEventOperations.ts` - 모든 이벤트 CRUD 작업 처리
- **폼 상태 관리**: `src/hooks/useEventForm.ts` - 이벤트 폼 상태 및 유효성 검사
- **알림 시스템**: `src/hooks/useNotifications.ts` - 사용자 알림 관리
- **검색 기능**: `src/hooks/useSearch.ts` - 이벤트 검색 및 필터링
- **캘린더 뷰**: `src/hooks/useCalendarView.ts` - 캘린더 표시 및 네비게이션
- **백엔드 API**: `server.js` - 로컬 JSON 파일 기반 데이터 저장

---

## 데이터 모델 및 API

### 데이터 모델

실제 모델 파일을 참조하세요:

- **Event 모델**: `src/types.ts`의 Event 인터페이스 참조
- **EventForm 모델**: `src/types.ts`의 EventForm 인터페이스 참조
- **관련 타입**: `src/types.ts`의 RepeatType, RepeatInfo 참조

### API 명세

**수동 엔드포인트** (server.js에서 발견):

- **GET /api/events** - 모든 이벤트 조회
- **POST /api/events** - 새 이벤트 생성
- **PUT /api/events/:id** - 기존 이벤트 수정
- **DELETE /api/events/:id** - 이벤트 삭제

**API 응답 형식**:
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "이벤트 제목",
      "date": "2024-01-01",
      "startTime": "09:00",
      "endTime": "10:00",
      "description": "설명",
      "location": "위치",
      "category": "카테고리",
      "repeat": { "type": "none", "interval": 1 },
      "notificationTime": 10
    }
  ]
}
```

---

## 기술적 부채 및 알려진 문제

### 중요한 기술적 부채

1. **단일 파일 컴포넌트**: `src/App.tsx`가 661줄로 너무 큼 - 컴포넌트 분리 필요
2. **데이터 지속성**: 로컬 JSON 파일에만 의존 - 실제 데이터베이스 없음
3. **백엔드 인프라**: Express 서버가 로컬 개발용으로만 설계됨
4. **인증 시스템**: 사용자 인증 및 권한 부여 시스템 없음
5. **에러 처리**: 일관된 에러 처리 패턴 부족
6. **타입 안전성**: 일부 any 타입 사용 및 타입 가드 부족

### 우회 방법 및 주의사항

- **환경 변수**: `.env` 파일이 없어 하드코딩된 설정 사용
- **데이터베이스 연결**: JSON 파일 직접 읽기/쓰기로 인한 동시성 문제
- **API 모킹**: MSW를 사용한 테스트 환경 구축
- **빌드 설정**: Vite 프록시 설정으로 로컬 서버와 연결

---

## 통합 포인트 및 외부 의존성

### 외부 서비스

| 서비스 | 목적 | 통합 유형 | 주요 파일 |
| ------ | ---- | ---------- | --------- |
| **공휴일 API** | 공휴일 정보 | REST API | `src/apis/fetchHolidays.ts` |
| **MSW** | API 모킹 | 개발 도구 | `src/__mocks__/` |

### 내부 통합 포인트

- **프론트엔드-백엔드 통신**: REST API on port 3000, 특정 헤더 기대
- **컴포넌트 간 통신**: React Context 대신 props drilling 사용
- **상태 관리**: 각 훅에서 개별적으로 상태 관리

---

## 개발 및 배포

### 로컬 개발 설정

1. **의존성 설치**: `pnpm install`
2. **개발 서버 시작**: `pnpm run dev` (프론트엔드 + 백엔드 동시 실행)
3. **테스트 실행**: `pnpm test` (Vitest)
4. **테스트 커버리지**: `pnpm run test:coverage`

**알려진 설정 문제**:
- Node.js 버전 호환성 (`.nvmrc` 파일 존재)
- ESLint 설정이 복잡함 (여러 플러그인 사용)

### 빌드 및 배포 프로세스

- **빌드 명령**: `pnpm run build` (TypeScript 컴파일 + Vite 빌드)
- **배포**: 수동 배포 (자동화된 CI/CD 없음)
- **환경**: 개발 환경만 존재 (스테이징/프로덕션 없음)

---

## 테스트 현실

### 현재 테스트 커버리지

- **단위 테스트**: Vitest + React Testing Library
- **통합 테스트**: `medium.integration.spec.tsx` (343줄)
- **E2E 테스트**: 없음
- **수동 테스트**: 주요 QA 방법

### 테스트 실행

```bash
pnpm test              # 단위 테스트 실행
pnpm run test:ui       # Vitest UI 실행
pnpm run test:coverage # 커버리지 리포트 생성
```

**테스트 환경 특징**:
- MSW를 사용한 API 모킹
- Material-UI 테마 제공자로 래핑
- 사용자 이벤트 시뮬레이션

---

## 부록 - 유용한 명령어 및 스크립트

### 자주 사용하는 명령어

```bash
pnpm run dev           # 개발 서버 시작 (프론트엔드 + 백엔드)
pnpm run start         # 프론트엔드만 시작
pnpm run server        # 백엔드만 시작
pnpm run build         # 프로덕션 빌드
pnpm test              # 테스트 실행
pnpm run lint          # 코드 린팅
```

### 디버깅 및 문제 해결

- **로그**: 브라우저 콘솔 및 Node.js 콘솔 확인
- **디버그 모드**: React DevTools 사용
- **일반적인 문제**: 
  - 포트 3000 충돌 (백엔드 서버)
  - Vite 프록시 설정 문제
  - TypeScript 컴파일 에러

---

## 향후 개선 방향

### 단기 개선 (1-2개월)

1. **컴포넌트 분리**: App.tsx를 여러 컴포넌트로 분리
2. **상태 관리 개선**: React Context 또는 Zustand 도입
3. **에러 처리 표준화**: 일관된 에러 처리 패턴 구현
4. **테스트 커버리지 향상**: 현재 60%에서 80%로 개선

### 중기 개선 (3-6개월)

1. **데이터베이스 도입**: PostgreSQL 또는 SQLite 도입
2. **인증 시스템**: JWT 기반 사용자 인증 구현
3. **API 문서화**: OpenAPI/Swagger 명세 작성
4. **CI/CD 파이프라인**: GitHub Actions 설정

### 장기 개선 (6개월 이상)

1. **마이크로서비스 아키텍처**: 백엔드 서비스 분리
2. **클라우드 배포**: AWS/Azure/GCP 배포
3. **모니터링 및 로깅**: 구조화된 로깅 및 메트릭 수집
4. **성능 최적화**: 코드 스플리팅, 지연 로딩 구현

---

**문서 완성일**: 2024년  
**다음 검토**: 3개월 후 또는 주요 변경사항 발생 시  
**담당 아키텍트**: Winston 🏗️
