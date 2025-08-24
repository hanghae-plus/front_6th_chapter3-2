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

- [ ] 일괄 수정 옵션이 UI에 추가됨
- [ ] PUT `/api/events-list` API가 정상적으로 호출됨
- [ ] 수정된 일정들이 즉시 반영됨
- [ ] 성공/실패 메시지가 적절히 표시됨
- [ ] 단위 테스트가 작성되고 통과함
- [ ] 사용자 인터페이스가 직관적이고 사용하기 쉬움

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
