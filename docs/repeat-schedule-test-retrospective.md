# 반복 일정 테스트 구현 회고

## 문제 상황
반복 일정 기능의 개별 수정/삭제 테스트를 작성하면서 `setupMockHandlerUpdating`과 `setupMockHandlerDeletion`에 `{ isRepeat: true }` 옵션을 추가했습니다. 코드 중복을 줄이기 위해 공통 데이터 `mockRepeatingEvents`를 만들어 두 핸들러에서 공유하도록 했습니다.

## 발생한 문제
테스트를 실행하니 두 번째 테스트(`setupMockHandlerDeletion`)에서 예상과 다른 결과가 나왔습니다. 3개 항목이 있어야 하는데 2개만 나오는 상황이 발생했습니다.

## 원인 분석
**객체 참조 공유** 때문이었습니다:
1. 첫 번째 테스트에서 `mockRepeatingEvents` 배열의 데이터를 수정
2. 두 번째 테스트에서 같은 배열 참조를 사용하여 이미 변경된 상태로 시작
3. 테스트 간 독립성이 깨짐

## 해결 방법
각 핸들러에서 **배열 복사본**을 생성하도록 수정:
```typescript
// 문제 코드
const mockEvents: Event[] = isRepeat ? mockRepeatingEvents : [기존데이터]

// 수정 코드  
const mockEvents: Event[] = isRepeat ? [...mockRepeatingEvents] : [기존데이터]
```

## 배운 점
- **테스트 독립성**은 기본 중의 기본 - 이번에 깨달았다
- Mock 데이터를 공유할 때도 독립성을 지켜야 한다는 것을 처음 인지했다
- 코드 중복 제거도 중요하지만 테스트의 안정성이 우선
- JavaScript의 객체/배열 참조 특성을 항상 염두에 두기
- 공유 데이터를 사용할 때는 복사본 생성 필수

단순해 보이는 리팩터링이지만 테스트의 핵심 원칙을 다시 한번 상기시켜준 좋은 경험이었습니다. 특히 Mock 데이터 레벨에서도 독립성이 필요하다는 점은 새로운 깨달음이었습니다.