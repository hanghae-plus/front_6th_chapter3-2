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

- [ ] Event 타입에 repeat.id 필드가 추가됨
- [ ] POST `/api/events-list` API가 구현되고 테스트됨
- [ ] PUT `/api/events-list` API가 구현되고 테스트됨
- [ ] DELETE `/api/events-list` API가 구현되고 테스트됨
- [ ] repeat.id 시스템이 정상 동작함
- [ ] API 응답이 올바른 형식을 반환함
- [ ] 단위 테스트가 작성되고 통과함
- [ ] API 문서가 업데이트됨

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
