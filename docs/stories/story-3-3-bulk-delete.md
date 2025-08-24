# Story 3.3: 반복 일정 일괄 삭제 기능 구현

## Story Goal

사용자가 반복 일정의 모든 인스턴스를 한 번에 삭제할 수 있도록 하여, 반복 일정의 효율적인 관리를 가능하게 합니다.

## User Story

**As a** 사용자,  
**I want** 반복 일정의 모든 인스턴스를 한 번에 삭제할 수 있도록,  
**so that** 불필요한 반복 일정을 효율적으로 제거할 수 있다.

## Acceptance Criteria

1. 반복 일정 삭제 시 "이 일정만 삭제" 또는 "모든 반복 일정 삭제" 옵션을 선택할 수 있어야 한다
2. "모든 반복 일정 삭제" 선택 시 repeat.id가 같은 모든 일정이 삭제되어야 한다
3. 일괄 삭제 전 확인 대화상자가 표시되어야 한다
4. 일괄 삭제 후 성공/실패 메시지가 표시되어야 한다
5. 삭제된 일정들이 캘린더에서 즉시 제거되어야 한다

## Technical Notes

**Implementation Approach:**
- 일정 삭제 모달에 일괄 삭제 옵션 추가
- DELETE `/api/events-list` API 활용
- 삭제 결과 실시간 반영

**Key Functions to Implement:**
- `useEventOperations` 훅에 일괄 삭제 로직 추가
- 일괄 삭제 UI 컴포넌트 구현
- 삭제 확인 대화상자 구현

**UI Components:**
```typescript
interface BulkDeleteModalProps {
  event: Event;
  onDelete: (deleteType: 'single' | 'all') => Promise<void>;
  onClose: () => void;
}

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Integration Points:**
- 기존 이벤트 삭제 모달
- DELETE `/api/events-list` API
- 캘린더 뷰 컴포넌트

## Definition of Done

- [ ] 일괄 삭제 옵션이 UI에 추가됨
- [ ] DELETE `/api/events-list` API가 정상적으로 호출됨
- [ ] 삭제 확인 대화상자가 구현됨
- [ ] 삭제된 일정들이 즉시 제거됨
- [ ] 성공/실패 메시지가 적절히 표시됨
- [ ] 단위 테스트가 작성되고 통과함
- [ ] 사용자 인터페이스가 직관적이고 안전함

## Risk Assessment

**Technical Risks:**
- 대량 삭제 시 성능 문제
- 실시간 상태 관리의 복잡성
- 의도치 않은 삭제 위험

**UI/UX Risks:**
- 사용자 실수로 인한 데이터 손실
- 삭제 확인 프로세스의 복잡성

**Mitigation Strategies:**
- 성능 테스트 실시
- 이중 확인 대화상자 구현
- 실행 취소 기능 구현
- 단계적 UI 테스트

## Testing Requirements

**Unit Tests:**
- 일괄 삭제 로직 테스트
- API 호출 테스트
- 상태 관리 테스트

**Integration Tests:**
- UI 컴포넌트 통합 테스트
- API 통합 테스트
- 실시간 업데이트 테스트

**UI Tests:**
```typescript
describe('BulkDeleteModal', () => {
  beforeEach(() => {
    setupMockHandlerBulkDeletion([
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

  it('should show delete options', () => {
    render(<BulkDeleteModal event={mockEvent} />);
    expect(screen.getByText('이 일정만 삭제')).toBeInTheDocument();
    expect(screen.getByText('모든 반복 일정 삭제')).toBeInTheDocument();
  });

  it('should show confirmation dialog for bulk delete', async () => {
    render(<BulkDeleteModal event={mockEvent} />);
    
    fireEvent.click(screen.getByText('모든 반복 일정 삭제'));
    expect(screen.getByText('정말 모든 반복 일정을 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('should delete all instances when confirmed', async () => {
    const { result } = renderHook(() => useEventOperations(false));
    
    await act(async () => {
      await result.current.deleteBulkEvents(['1', '2']);
    });

    expect(result.current.events).toHaveLength(0);
  });

  it('should handle deletion of non-existent events', async () => {
    const { result } = renderHook(() => useEventOperations(false));
    
    await act(async () => {
      await result.current.deleteBulkEvents(['999']);
    });

    expect(result.current.events).toHaveLength(2);
  });
});
```

## Dependencies

**Prerequisites:**
- Story 3.1 (반복 일정 그룹화 시스템) 완료
- 기존 이벤트 삭제 기능

**External Dependencies:**
- Material-UI 컴포넌트
- 상태 관리 라이브러리

**Internal Dependencies:**
- Event 타입 정의
- useEventOperations 훅
- 알림 시스템

## Integration Verification

**IV1:** 일괄 삭제가 모든 관련 일정에 적용되는지 확인
**IV2:** 삭제 확인 프로세스가 안전한지 확인
**IV3:** 성능이 허용 가능한 수준인지 확인

---

## TDD 개발 가이드

### Test First Development

1. UI 컴포넌트 테스트 작성
2. 일괄 삭제 로직 테스트 작성
3. API 통합 테스트 작성

### Implementation Steps

1. UI 컴포넌트 구현
2. 일괄 삭제 로직 구현
3. API 통합 구현
4. 실시간 업데이트 구현

### Verification Steps

1. 단위 테스트 실행
2. UI 테스트 실행
3. 통합 테스트 실행
4. 안전성 테스트 실행
