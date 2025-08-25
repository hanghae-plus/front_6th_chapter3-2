# Story 3.1: 반복 일정 그룹화 시스템 구현

## Story Goal

반복 일정들을 효과적으로 그룹화하고 관리할 수 있도록 repeat.id 시스템을 구현하고, 새로운 `/api/events-list` API와 통합하여 일괄 작업의 기반을 마련합니다.

## User Story

**As a** 개발자,  
**I want** 반복 일정들을 그룹으로 관리할 수 있는 시스템을 구현하고,  
**so that** 연관된 반복 일정들을 효과적으로 관리하고 일괄 작업을 수행할 수 있다.

## Acceptance Criteria

1. Event 타입에 repeat.id 필드가 추가되어야 한다
2. 새로운 `/api/events-list` API가 구현되어야 한다:
   - POST: 여러 반복 일정 생성 및 repeat.id 할당
   - PUT: repeat.id로 그룹화된 일정들 일괄 수정
   - DELETE: repeat.id로 그룹화된 일정들 일괄 삭제
3. 반복 일정 생성 시 모든 인스턴스가 동일한 repeat.id를 가져야 한다
4. repeat.id로 연관된 일정들을 조회할 수 있어야 한다
5. API 응답이 올바른 형식을 반환해야 한다

## Technical Notes

**Implementation Approach:**
- Event 인터페이스에 repeat.id 필드 추가
- 새로운 API 엔드포인트 구현
- 기존 반복 일정 생성 로직에 repeat.id 통합

**Key Functions to Implement:**
- `POST /api/events-list`: 여러 반복 일정 생성
- `PUT /api/events-list`: 여러 반복 일정 수정
- `DELETE /api/events-list`: 여러 반복 일정 삭제
- repeat.id 생성 및 관리 유틸리티 함수

**Data Structure Changes:**
```typescript
interface Event {
  // ... 기존 필드들
  repeat: {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
    id?: string; // 새로 추가되는 필드
  };
}
```

**Integration Points:**
- 기존 Event 인터페이스
- 새로운 API 엔드포인트
- 기존 반복 일정 생성 로직

## Definition of Done

- [x] Event 타입에 repeat.id 필드가 추가됨 (RepeatInfo.id로 반영)
- [x] POST `/api/events-list` API가 구현되고 테스트됨
- [x] PUT `/api/events-list` API가 구현되고 테스트됨
- [x] DELETE `/api/events-list` API가 구현되고 테스트됨
- [x] repeat.id 시스템이 정상 동작함 (모든 인스턴스 동일 id 부여)
- [x] API 응답이 올바른 형식을 반환함
- [x] 단위 테스트가 작성되고 통과함 (repeat.id 그룹 일관성)
- [x] API 문서가 업데이트됨

## UI 흐름 초안 (repeat.id 기반 일괄 수정/삭제)

1. 선택 모드 진입
   - 리스트/캘린더에서 반복 이벤트 항목 선택 시 `선택 모드` 활성화 (체크박스/토글)
   - 우측 상단에 그룹 작업 바(Action Bar) 노출: "그룹 수정", "그룹 삭제"

2. 그룹 수정 (PUT /api/events-list)
   - 사용자가 편집 폼에서 변경 사항 입력 → 저장 시 선택한 반복 이벤트들의 `repeat.id`를 수집
   - 클라이언트는 해당 id에 속한 이벤트들의 변경 필드를 합쳐 `events` 배열로 전송
   - 성공 시: 스낵바 "그룹이 수정되었습니다" 노출, 목록 새로고침
   - 실패 시: 스낵바 "그룹 수정 실패" 노출 및 개별 실패 항목 로그 기록

3. 그룹 삭제 (DELETE /api/events-list)
   - 삭제 확인 다이얼로그(개수/날짜 범위 요약) → 확인 시 진행
   - 클라이언트는 그룹의 모든 `eventIds`를 수집하여 삭제 요청 전송
   - 성공 시: 스낵바 "그룹이 삭제되었습니다" 노출, 목록 새로고침
   - 실패 시: 스낵바 "그룹 삭제 실패" 노출, 성공/실패 건수 요약 표시

4. 예외 및 경계
   - 혼합 선택(반복/단일) 시: 단일 일정은 개별 처리, 반복은 그룹 처리로 분기
   - 부분 실패 시: 성공 항목 반영 + 실패 항목 재시도/되돌리기 옵션 제공
   - 접근성: 키보드 포커스 이동, 다이얼로그 역할/레이블 제공

## Risk Assessment

**Technical Risks:**
- repeat.id 생성 및 관리의 복잡성
- API 엔드포인트 구현의 안정성
- 기존 데이터 구조와의 호환성

**Integration Risks:**
- 기존 반복 일정 시스템과의 충돌
- API 응답 형식의 일관성

**Mitigation Strategies:**
- TDD 방식으로 단계적 구현
- 기존 기능과의 호환성 지속적 검증
- API 문서화 및 테스트 케이스 작성

## Testing Requirements

**Mock Handlers Implementation:**
```typescript
// src/__mocks__/handlersUtils.ts

export const setupMockHandlerBulkCreation = (initEvents: Event[] = []) => {
  const mockEvents: Event[] = [...initEvents];
  let lastRepeatId: string | undefined;

  server.use(
    http.post('/api/events-list', async ({ request }) => {
      const { events } = await request.json();
      const newEvents = events.map((event: Event) => {
        const isRepeatEvent = event.repeat.type !== 'none';
        if (isRepeatEvent && !lastRepeatId) {
          lastRepeatId = crypto.randomUUID();
        }
        return {
          ...event,
          id: crypto.randomUUID(),
          repeat: {
            ...event.repeat,
            id: isRepeatEvent ? lastRepeatId : undefined,
          },
        };
      });
      mockEvents.push(...newEvents);
      return HttpResponse.json(newEvents, { status: 201 });
    })
  );
};

export const setupMockHandlerBulkUpdate = (initEvents: Event[] = []) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.put('/api/events-list', async ({ request }) => {
      const { events } = await request.json();
      let isUpdated = false;

      events.forEach((event: Event) => {
        const index = mockEvents.findIndex(e => e.id === event.id);
        if (index !== -1) {
          isUpdated = true;
          mockEvents[index] = { ...mockEvents[index], ...event };
        }
      });

      if (isUpdated) {
        return HttpResponse.json(mockEvents);
      }
      return new HttpResponse(null, { status: 404 });
    })
  );
};

export const setupMockHandlerBulkDeletion = (initEvents: Event[] = []) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.delete('/api/events-list', async ({ request }) => {
      const { eventIds } = await request.json();
      mockEvents.forEach((_, index) => {
        if (eventIds.includes(mockEvents[index].id)) {
          mockEvents.splice(index, 1);
        }
      });
      return new HttpResponse(null, { status: 204 });
    })
  );
};
```

**Unit Tests:**
- repeat.id 생성 및 관리 로직 테스트
- API 엔드포인트 기능 테스트
- 데이터 구조 변환 테스트

**Integration Tests:**
```typescript
describe('Bulk Event Operations', () => {
  it('should create multiple events with same repeat.id', async () => {
    setupMockHandlerBulkCreation();
    const { result } = renderHook(() => useEventOperations(false));

    const events = [
      {
        title: '반복 회의 1',
        date: '2024-03-15',
        repeat: { type: 'daily', interval: 1 }
      },
      {
        title: '반복 회의 2',
        date: '2024-03-16',
        repeat: { type: 'daily', interval: 1 }
      }
    ];

    await act(async () => {
      await result.current.saveBulkEvents(events);
    });

    const createdEvents = result.current.events;
    const repeatIds = new Set(
      createdEvents
        .filter(e => e.repeat.type !== 'none')
        .map(e => e.repeat.id)
    );

    expect(repeatIds.size).toBe(1);
  });
});
```

**API Tests:**
- API 엔드포인트 통합 테스트
- 기존 반복 일정 시스템과의 통합 테스트
- 에러 처리 테스트

**API Tests:**
```typescript
describe('POST /api/events-list', () => {
  it('should create multiple events with same repeat.id', async () => {
    const events = [/* test data */];
    const response = await fetch('/api/events-list', {
      method: 'POST',
      body: JSON.stringify({ events }),
    });
    expect(response.status).toBe(201);
    const data = await response.json();
    const repeatIds = new Set(data.map(event => event.repeat.id));
    expect(repeatIds.size).toBe(1);
  });
});
```

## Dependencies

**Prerequisites:**
- Epic 1의 반복 일정 기본 기능 구현 완료
- 기존 API 시스템 이해

**External Dependencies:**
- Express.js 서버
- UUID 생성 라이브러리

**Internal Dependencies:**
- Event 타입 정의
- 반복 일정 생성 로직

## Integration Verification

**IV1:** repeat.id 시스템이 기존 반복 일정과 호환되는지 확인
**IV2:** API 엔드포인트가 올바른 응답을 반환하는지 확인
**IV3:** 데이터 구조 변경이 기존 기능에 영향을 주지 않는지 확인

---

## TDD 개발 가이드

### Test First Development

1. API 엔드포인트 테스트 작성
2. repeat.id 관리 로직 테스트 작성
3. 데이터 구조 변환 테스트 작성

### Implementation Steps

1. Event 타입 업데이트
2. repeat.id 생성 및 관리 로직 구현
3. API 엔드포인트 구현
4. 통합 테스트 실행

### Verification Steps

1. 단위 테스트 실행
2. API 테스트 실행
3. 통합 테스트 실행
4. 문서 업데이트 확인

## 리팩터링 행동강령 (Code of Conduct for Refactoring)

### 핵심 원칙
1. **기존 코드 보존**
   - 기존 애플리케이션 코드를 수정하지 않음
   - 기존 테스트 코드를 수정하지 않음
   - 새로운 기능은 기존 코드와 분리된 새로운 파일에 구현

2. **점진적 리팩터링**
   - 한 번에 하나의 책임만 리팩터링
   - 각 리팩터링 단계마다 테스트 실행
   - 작은 단위로 커밋하여 변경사항 추적 용이

3. **테스트 주도 리팩터링**
   - 새로운 기능에 대한 테스트 먼저 작성
   - 기존 테스트가 항상 통과하는지 확인
   - 리팩터링 후 모든 테스트 통과 확인

### 구체적인 가이드라인

#### 파일 구조
```
src/
  ├── __tests__/
  │   └── utils/
  │       ├── existing-tests.spec.ts     # 기존 테스트 (수정 금지)
  │       └── new-feature.spec.ts        # 새로운 테스트
  ├── utils/
  │   ├── existing-utils.ts              # 기존 유틸리티 (수정 금지)
  │   └── new-feature-utils.ts           # 새로운 유틸리티
  └── hooks/
      ├── existing-hooks.ts              # 기존 훅 (수정 금지)
      └── new-feature-hooks.ts           # 새로운 훅
```

#### 코드 작성 규칙
1. **새로운 파일 생성**
   - 기존 파일 수정 대신 새 파일 생성
   - 의미있는 파일명으로 목적 명확히 표현
   - 관련 코드끼리 같은 디렉토리에 위치

2. **인터페이스 설계**
   - 기존 인터페이스 확장하여 새로운 인터페이스 정의
   - 기존 타입을 재사용하여 호환성 유지
   - 새로운 타입은 별도 파일에 정의

3. **의존성 관리**
   - 새로운 의존성 추가 시 기존 코드 영향 없도록 관리
   - 순환 의존성 방지
   - 의존성 주입 패턴 활용

#### 품질 관리
1. **코드 품질**
   - 일관된 코딩 컨벤션 준수
   - 중복 코드 최소화
   - 명확한 변수/함수명 사용

2. **테스트 품질**
   - 테스트 커버리지 유지/향상
   - 경계값 테스트 포함
   - 테스트 가독성 확보

3. **문서화**
   - 새로운 기능 문서화
   - 리팩터링 결정 사항 기록
   - API 문서 업데이트

### 검증 절차
1. **리팩터링 전**
   - 기존 테스트 전체 통과 확인
   - 코드 커버리지 측정
   - 기존 기능 동작 확인

2. **리팩터링 중**
   - 단계별 테스트 실행
   - 코드 리뷰 수행
   - 성능 영향 모니터링

3. **리팩터링 후**
   - 전체 테스트 통과 확인
   - 코드 커버리지 비교
   - 기존 기능 정상 동작 검증

### 모니터링 및 롤백 계획
1. **모니터링**
   - 테스트 실행 시간 모니터링
   - 성능 메트릭 모니터링
   - 에러 로그 모니터링

2. **롤백 전략**
   - 단계별 커밋으로 롤백 포인트 확보
   - 문제 발생 시 즉시 롤백
   - 롤백 후 원인 분석

## API 문서

### 공통 타입 (발췌)

```typescript
type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
  excludeDates?: string[];
  weekdays?: number[]; // 0(Sun) - 6(Sat)
  id?: string; // 반복 이벤트 그룹 ID (서버/생성 로직에서 부여)
}

interface Event {
  id: string;
  title: string;
  date: string;           // YYYY-MM-DD
  startTime: string;      // HH:mm
  endTime: string;        // HH:mm
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number; // 분 단위
}
```

### GET /api/events

- 응답: 200 OK
- Body:

```json
{
  "events": [ { /* Event */ } ]
}
```

### POST /api/events-list

- 설명: 여러 이벤트를 일괄 생성. 반복 이벤트(`repeat.type !== 'none'`)는 동일한 `repeat.id`가 자동 부여됨
- 응답: 201 Created
- Request Body:

```json
{
  "events": [
    {
      "title": "A",
      "date": "2024-01-01",
      "startTime": "09:00",
      "endTime": "10:00",
      "description": "",
      "location": "",
      "category": "업무",
      "repeat": { "type": "daily", "interval": 1, "endDate": "2024-01-05" },
      "notificationTime": 10
    }
  ]
}
```

- Response Body: 생성된 `Event[]` (배열, 래핑 없음)

```json
[
  {
    "id": "...",
    "title": "A",
    "date": "2024-01-01",
    "startTime": "09:00",
    "endTime": "10:00",
    "description": "",
    "location": "",
    "category": "업무",
    "repeat": { "type": "daily", "interval": 1, "endDate": "2024-01-05", "id": "repeat-group-id" },
    "notificationTime": 10
  }
]
```

- 오류: 400 잘못된 페이로드, 500 서버 오류

### PUT /api/events-list

- 설명: 여러 이벤트를 일괄 수정. 각 이벤트의 `id` 반드시 필요
- 응답: 200 OK
- Request Body:

```json
{
  "events": [ { "id": "...", "title": "A-updated" } ]
}
```

- Response Body: 전체 이벤트 목록 `Event[]` (배열, 래핑 없음)
- 오류: 404 해당 이벤트 없음, 400 잘못된 페이로드, 500 서버 오류

### DELETE /api/events-list

- 설명: 여러 이벤트를 일괄 삭제
- 응답: 204 No Content
- Request Body:

```json
{ "eventIds": ["id-1", "id-2"] }
```

- 오류: 404 해당 이벤트 없음, 400 잘못된 페이로드, 500 서버 오류

### 동작 상 주의 사항

- POST: 반복 이벤트 집합 생성 시 동일 `repeat.id`가 자동 부여됨. 단일 일정(`none`)은 `repeat.id` 없음
- PUT: 부분 업데이트 허용. 서버는 존재하는 항목만 갱신하며 응답으로 전체 목록을 반환
- DELETE: 일부만 삭제 가능한 경우에도 204 또는 404를 반환할 수 있음(서버 구현에 따름)

## QA Results

- Gate Decision: PASS
- Rationale:
  - 타입에 `RepeatInfo.id` 추가 및 생성 로직의 그룹 ID 일관 부여 검증 완료
  - 서버 API(POST/PUT/DELETE `/api/events-list`) 구현 및 통합 테스트 통과
  - UI 선택 모드/그룹 수정·삭제 플로우 추가 및 UI 회귀 테스트 통과
  - 문서(API/흐름/DoD) 업데이트 완료
- Risks/Notes:
  - 그룹 편집 항목은 현재 제목만 예시로 일괄 수정(추가 필드 확장 여지)
  - 선택 모드 접근성(a11y) 향상 여지(포커스 이동/역할/레이블 강화)
