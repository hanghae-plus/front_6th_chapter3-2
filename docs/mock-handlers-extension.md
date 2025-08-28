# Mock Handlers 확장 - isRepeat 옵션 추가

## 개요
반복 일정 테스트를 위해 기존 Mock Handler들에 `isRepeat` 옵션을 추가하여 확장했습니다.

## 확장이 필요했던 이유
반복 일정과 일반 일정은 **서로 다른 Mock 데이터**가 필요했습니다:
- **일반 일정**: 개별적인 제목을 가진 서로 다른 일정들
- **반복 일정**: 동일한 제목을 가진 여러 날짜의 일정들

기존 핸들러들이 일반 일정용 데이터만 제공했기 때문에, 반복 일정의 "개별 수정/삭제 시 다른 일정에 영향을 주지 않는다"는 시나리오를 테스트할 수 없었습니다.

## 확장된 Handlers

### setupMockHandlerUpdating
```typescript
// 기존 사용법
setupMockHandlerUpdating() // 일반 일정 2개

// 확장된 사용법  
setupMockHandlerUpdating({ isRepeat: true }) // 반복 일정 3개
```

### setupMockHandlerDeletion
```typescript
// 기존 사용법
setupMockHandlerDeletion() // 삭제할 일반 일정 1개

// 확장된 사용법
setupMockHandlerDeletion({ isRepeat: true }) // 반복 일정 3개
```

## 구현 방식
1. **공통 데이터 분리**: `mockRepeatingEvents` 배열을 상단에 선언
2. **조건부 데이터 선택**: `isRepeat` 플래그에 따라 다른 데이터셋 사용
3. **배열 복사**: 테스트 독립성을 위해 `[...mockRepeatingEvents]` 복사본 생성
4. **기본값 설정**: 기존 코드 호환성을 위해 `{ isRepeat = false } = {}` 기본값 제공

## 장점
- **코드 중복 제거**: 핸들러 로직 재사용
- **가독성 향상**: `{ isRepeat: true }` 로 의도 명확
- **확장성**: 향후 다른 옵션 추가 가능
- **호환성**: 기존 테스트 코드 수정 없이 동작

## 사용 예시
```typescript
// 반복 일정 개별 수정 테스트
it('반복으로 생성된 일정 중 하나만 수정해도 나머지는 영향받지 않는다', async () => {
  setupMockHandlerUpdating({ isRepeat: true });
  // ... 테스트 로직
});

// 반복 일정 개별 삭제 테스트  
it('반복으로 생성된 일정 중 하나만 삭제해도 나머지는 영향받지 않는다', async () => {
  setupMockHandlerDeletion({ isRepeat: true });
  // ... 테스트 로직
});
```

이 확장을 통해 반복 일정의 개별 조작 시나리오를 효과적으로 테스트할 수 있게 되었습니다.