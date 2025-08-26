# Story 3.2: 반복 일정 일괄 수정 기능 구현

## Story Goal

사용자가 반복 일정의 모든 인스턴스를 한 번에 수정할 수 있도록 하여, 반복 일정의 효율적인 관리를 가능하게 합니다.

## User Story

**As a** 사용자,  
**I want** 반복 일정의 모든 인스턴스를 한 번에 수정할 수 있도록,  
**so that** 여러 반복 일정을 효율적으로 관리할 수 있다.

## Acceptance Criteria

1. 반복 일정 수정 시 "이 일정만 수정" 또는 "모든 반복 일정 수정" 옵션을 선택할 수 있어야 한다
2. "모든 반복 일정 수정" 선택 시 repeat.id가 같은 모든 일정이 수정되어야 한다
3. 일괄 수정 시 다음 필드들이 모든 인스턴스에 적용되어야 한다:
   - 제목
   - 설명
   - 시작/종료 시간
   - 위치
   - 카테고리
   - 알림 설정
4. 일괄 수정 후 성공/실패 메시지가 표시되어야 한다
5. 수정된 일정들이 캘린더에 즉시 반영되어야 한다

## Technical Notes

**Implementation Approach:**
- 일정 수정 모달에 일괄 수정 옵션 추가
- PUT `/api/events-list` API 활용
- 수정 결과 실시간 반영

**Key Functions to Implement:**
- `useEventOperations` 훅에 일괄 수정 로직 추가
- 일괄 수정 UI 컴포넌트 구현
- 수정 결과 상태 관리 로직

**UI Components:**
```typescript
interface BulkUpdateModalProps {
  event: Event;
  onUpdate: (updateType: 'single' | 'all') => Promise<void>;
  onClose: () => void;
}
```

**Integration Points:**
- 기존 이벤트 수정 모달
- PUT `/api/events-list` API
- 캘린더 뷰 컴포넌트

## Definition of Done

- [x] 일괄 수정 옵션이 UI에 추가됨
- [x] PUT `/api/events-list` API가 정상적으로 호출됨
- [x] 수정된 일정들이 즉시 반영됨
- [x] 성공/실패 메시지가 적절히 표시됨
- [x] 단위 테스트가 작성되고 통과함
- [x] 사용자 인터페이스가 직관적이고 사용하기 쉬움

## Risk Assessment

**Technical Risks:**
- 대량 업데이트 시 성능 문제
- 실시간 상태 관리의 복잡성
- 동시성 문제

**UI/UX Risks:**
- 사용자 실수로 인한 의도치 않은 일괄 수정
- 복잡한 인터페이스로 인한 사용성 저하

**Mitigation Strategies:**
- 성능 테스트 실시
- 확인 대화상자 추가
- 실행 취소 기능 구현
- 단계적 UI 테스트

## Testing Requirements

**Unit Tests:**
- 일괄 수정 로직 테스트
- API 호출 테스트
- 상태 관리 테스트

**Integration Tests:**
- UI 컴포넌트 통합 테스트
- API 통합 테스트
- 실시간 업데이트 테스트

**UI Tests:**
```typescript
describe('BulkUpdateModal', () => {
  beforeEach(() => {
    setupMockHandlerBulkUpdate([
      {
        id: '1',
        title: '반복 회의',
        date: '2024-03-15',
        startTime: '09:00',
        endTime: '10:00',
        repeat: { 
          type: 'daily', 
          interval: 1,
          id: 'repeat-123'
        }
      },
      {
        id: '2',
        title: '반복 회의',
        date: '2024-03-16',
        startTime: '09:00',
        endTime: '10:00',
        repeat: { 
          type: 'daily', 
          interval: 1,
          id: 'repeat-123'
        }
      }
    ]);
  });

  it('should show update options', () => {
    render(<BulkUpdateModal event={mockEvent} />);
    expect(screen.getByText('이 일정만 수정')).toBeInTheDocument();
    expect(screen.getByText('모든 반복 일정 수정')).toBeInTheDocument();
  });

  it('should update all instances when bulk update is selected', async () => {
    const { result } = renderHook(() => useEventOperations(false));
    
    await act(async () => {
      await result.current.updateBulkEvents([{
        id: '1',
        title: '수정된 회의',
        repeat: { 
          type: 'daily', 
          interval: 1,
          id: 'repeat-123'
        }
      }]);
    });

    const updatedEvents = result.current.events;
    expect(updatedEvents.every(e => e.title === '수정된 회의')).toBe(true);
  });
});
```

## Dependencies

**Prerequisites:**
- Story 3.1 (반복 일정 그룹화 시스템) 완료
- 기존 이벤트 수정 기능

**External Dependencies:**
- Material-UI 컴포넌트
- 상태 관리 라이브러리

**Internal Dependencies:**
- Event 타입 정의
- useEventOperations 훅
- 알림 시스템

## Integration Verification

**IV1:** 일괄 수정이 모든 관련 일정에 적용되는지 확인
**IV2:** UI가 사용자 친화적인지 확인
**IV3:** 성능이 허용 가능한 수준인지 확인

---

## TDD 개발 가이드

### Test First Development

1. UI 컴포넌트 테스트 작성
2. 일괄 수정 로직 테스트 작성
3. API 통합 테스트 작성

### Implementation Steps

1. UI 컴포넌트 구현
2. 일괄 수정 로직 구현
3. API 통합 구현
4. 실시간 업데이트 구현

### Verification Steps

1. 단위 테스트 실행
2. UI 테스트 실행
3. 통합 테스트 실행
4. 성능 테스트 실행

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
## QA Results

- Gate Decision: PASS
- Rationale:
  - 수정 범위 선택(이 일정만/모든 반복 일정) UI 추가 및 동작 확인
  - PUT `/api/events-list` 일괄 수정 통합 테스트/훅 단위 테스트 통과
  - 성공/실패 스낵바 메시지 및 즉시 반영 확인
- Risks/Notes:
  - 대량 항목 편집 시 성능 모니터링 필요(향후 가상화/배치 UI 고려)
  - Reviewed: 최신 빌드 기준 전체 테스트(단위/통합/회귀) 그린
  - Reviewer: QA(Quinn)
  - Review Date: 2025-08-25
  - Evidence:
    - 서버 구현: `server.js`의 `PUT /api/events-list` 동작(부분 업데이트, 전체 목록 반환) 확인
    - 목 핸들러: `src/__mocks__/handlersUtils.ts`의 `updateBulkEventsHandler` 및 `setupMockHandlerBulkOperations`
    - 통합 테스트: `src/__tests__/integration/bulk-events.integration.spec.ts`의 일괄 수정 케이스 통과 확인
    - 훅 단위 테스트: `src/__tests__/hooks/medium.useEventOperations.spec.ts`의 `updateBulkEvents` 정상/부분 일치/빈 배열 케이스 검증
1. **모니터링**
   - 테스트 실행 시간 모니터링
   - 성능 메트릭 모니터링
   - 에러 로그 모니터링

2. **롤백 전략**
   - 단계별 커밋으로 롤백 포인트 확보
   - 문제 발생 시 즉시 롤백
   - 롤백 후 원인 분석
