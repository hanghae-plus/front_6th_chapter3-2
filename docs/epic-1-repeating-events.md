# 반복 일정 기본 기능 구현 - Brownfield Enhancement

## Epic Goal

기존 UI로만 구현되어 있는 반복 일정 기능을 **프론트엔드에서만** 실제로 동작하는 로직으로 구현하여, 사용자가 설정한 반복 패턴(매일, 매주, 매월, 매년)에 따라 실제 반복 일정을 생성하고 관리할 수 있도록 합니다.

**중요한 제약사항**: 백엔드 마이그레이션(데이터베이스, 인증 시스템 등)은 모두 배제하고, 기존 JSON 파일 기반 시스템을 그대로 유지합니다.

## Epic Description

**Existing System Context:**

- Current relevant functionality: 일정 관리 애플리케이션으로 CRUD, 검색, 알림, 공휴일 표시, 일정 충돌 감지 기능이 구현되어 있으며, 반복 일정을 위한 UI 요소(반복 유형 선택, 간격 설정, 종료 날짜 설정)가 이미 존재합니다.
- Technology stack: React 19.1.0, TypeScript, Express.js, Material-UI, Vite, Vitest
- Integration points: 기존 일정 생성/수정 모달, 캘린더 뷰, 일정 목록, 서버 API 엔드포인트

**Enhancement Details:**

- What's being added/changed: 반복 일정 생성 로직, 시각적 구분, 수정/삭제 기능을 **프론트엔드에서만** 구현하여 기존 UI에 실제 동작하는 로직으로 확장
- How it integrates: 기존 useEventForm, useEventOperations 훅을 확장하고, **기존 JSON 파일 구조에 반복 정보만 추가**하여 통합
- Success criteria: 사용자가 반복 일정을 설정하면 실제로 반복되는 일정들이 생성되고, 캘린더에서 시각적으로 구분되어 표시되며, 개별 수정/삭제가 가능

## Stories

List 1-3 focused stories that complete the epic:

1. **Story 1:** 반복 일정 생성 로직 구현 - 반복 패턴에 따른 실제 일정 생성 기능 (프론트엔드 전용)
2. **Story 2:** 반복 일정 시각적 구분 구현 - 캘린더에서 반복 일정을 아이콘으로 구분하여 표시
3. **Story 3:** 반복 일정 수정/삭제 기능 구현 - 개별 반복 일정의 수정 및 삭제 기능

## Compatibility Requirements

- [x] Existing APIs remain unchanged (기존 /api/events 엔드포인트 유지)
- [x] Database schema changes are backward compatible (기존 JSON 파일 구조에 반복 정보만 추가)
- [x] UI changes follow existing patterns (Material-UI 컴포넌트와 기존 폼 패턴 활용)
- [x] Performance impact is minimal (기존 일정 관리 기능 성능 유지)
- [x] Backend system remains unchanged (기존 Express 서버 구조 그대로 유지)

## Risk Mitigation

- **Primary Risk:** 반복 일정 로직의 복잡성으로 인한 기존 기능과의 충돌
- **Mitigation:** **백엔드 변경 없이** 프론트엔드에서만 구현, 단계적 구현, 각 Story마다 기존 기능 검증, TDD 방식으로 개발하여 안정성 확보
- **Rollback Plan:** 각 Story 완료 후 기존 기능 테스트를 통한 검증, 문제 발생 시 해당 Story의 변경사항만 롤백, **백엔드 변경이 없어** 롤백 위험 최소화

## Definition of Done

- [ ] 모든 Story가 수용 기준을 충족하여 완료됨
- [ ] 기존 일정 관리 기능이 테스트를 통해 정상 동작함을 확인
- [ ] 반복 일정 생성, 표시, 수정, 삭제 기능이 정상 동작함
- [ ] 통합 지점이 올바르게 작동함
- [ ] 기존 기능에 대한 회귀가 없음
- [ ] 반복 일정 관련 문서화가 적절히 업데이트됨
- [ ] **백엔드 시스템이 전혀 변경되지 않았음을 확인**

## Technical Integration Details

**Frontend Integration:**
- useEventForm 훅에 반복 일정 생성 로직 추가
- 반복 패턴 계산 함수 구현 (매일, 매주, 매월, 매년)
- 반복 종료 조건 처리 로직 구현

**Backend Integration:**
- **기존 Express.js 서버 구조를 그대로 유지**
- **기존 API 엔드포인트를 그대로 활용**
- 반복 일정을 개별 이벤트로 변환하여 기존 저장 로직 활용

**Data Structure:**
- **기존 JSON 파일 구조를 그대로 유지**
- 기존 Event 인터페이스에 반복 관련 필드만 추가
- 반복 패턴에 따른 날짜 계산 로직 구현
- 반복 종료 조건에 따른 일정 생성 제한 로직

**Testing Integration:**
- 기존 Vitest 테스트 환경 활용
- TDD 방식으로 각 기능 구현
- 기존 기능과의 호환성 검증 테스트 포함

## Success Metrics

- 반복 일정 설정 시 정확한 패턴으로 일정이 생성됨
- 캘린더에서 반복 일정과 일반 일정이 명확히 구분되어 표시됨
- 반복 일정의 개별 수정/삭제가 정상 동작함
- 기존 일정 관리 기능의 성능이 유지됨
- 사용자 경험이 향상되어 반복 일정 관리가 용이해짐
- **백엔드 시스템이 전혀 변경되지 않음**

## Dependencies

- **Prerequisite**: 없음 (첫 번째 에픽)
- **Integration Points**: 기존 일정 관리 기능, 기존 JSON 파일 구조, 기존 API 엔드포인트
- **Backend Changes**: **없음** - 모든 변경사항은 프론트엔드에서만 구현

---

## TDD 개발 가이드

### TDD 개발 원칙

#### Red-Green-Refactor 사이클
1. **Red**: 실패하는 테스트 작성
2. **Green**: 테스트를 통과하는 최소한의 코드 작성
3. **Refactor**: 코드 개선 (기능 변경 없이)

#### 핵심 규칙
- **테스트 우선**: 구현 코드보다 테스트 코드를 먼저 작성
- **최소한의 코드**: 테스트를 통과하는 최소한의 코드만 작성
- **지속적 리팩토링**: 각 단계마다 코드 품질 개선

### 개발 워크플로우

#### 일일 개발 사이클
1. **아침**: 오늘 구현할 기능의 테스트 작성
2. **오후**: 테스트를 통과하는 코드 구현
3. **저녁**: 코드 리팩토링 및 내일 테스트 계획

#### 스토리별 완료 체크리스트
- [ ] 모든 테스트 케이스 작성 완료
- [ ] 테스트 통과 확인
- [ ] 코드 리팩토링 완료
- [ ] 기존 기능 회귀 테스트 통과
- [ ] 백엔드 변경 없음 확인

### 테스트 작성 가이드

#### 테스트 파일 구조
```typescript
// src/__tests__/utils/repeatingEventUtils.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  calculateRepeatingDates, 
  validateRepeatSettings, 
  generateEventInstances 
} from '../../utils/repeatingEventUtils';

describe('RepeatingEventUtils', () => {
  // 테스트 그룹들...
});
```

#### 기본 테스트 패턴
```typescript
it('should calculate daily repeating dates correctly', () => {
  // Given: 기본 반복 설정
  const repeatInfo = {
    type: 'daily' as const,
    interval: 1,
    endDate: '2024-12-25'
  };
  const startDate = '2024-12-20';
  
  // When: 일일 반복 날짜 계산
  const result = calculateRepeatingDates(repeatInfo, startDate);
  
  // Then: 예상 결과 검증
  expect(result).toEqual([
    '2024-12-20', '2024-12-21', '2024-12-22',
    '2024-12-23', '2024-12-24', '2024-12-25'
  ]);
});
```

#### 테스트 실행 명령어
```bash
# 특정 테스트 파일 실행
pnpm test src/__tests__/utils/repeatingEventUtils.spec.ts

# 테스트 커버리지 확인
pnpm run test:coverage

# 테스트 UI 실행
pnpm run test:ui
```

### 에픽별 테스트 전략

#### Story 1.1: 반복 일정 생성 로직 구현
- **단위 테스트**: 각 반복 패턴 계산 함수별 테스트
- **경계값 테스트**: 윤년, 월말, 연말 등 특수한 날짜 케이스
- **통합 테스트**: useEventForm 훅과의 연동 테스트

#### Story 1.2: 반복 일정 시각적 구분 구현
- **컴포넌트 테스트**: 반복 일정 아이콘 렌더링 테스트
- **통합 테스트**: 캘린더 뷰와의 통합 테스트
- **사용자 상호작용 테스트**: 반복 일정 클릭 이벤트 테스트

#### Story 1.3: 반복 일정 수정/삭제 기능 구현
- **기능 테스트**: 수정/삭제 로직 테스트
- **통합 테스트**: 기존 API 엔드포인트와의 호환성 테스트
- **회귀 테스트**: 기존 기능 무결성 보장 테스트

---

## Story Manager Handoff

"Please develop detailed user stories for this brownfield epic. Key considerations:

- This is an enhancement to an existing system running React 19.1.0, TypeScript, Express.js, Material-UI
- Integration points: useEventForm 훅, useEventOperations 훅, 캘린더 뷰, 일정 목록, 서버 API 엔드포인트
- Existing patterns to follow: Material-UI 컴포넌트 패턴, React 훅 패턴, Express.js API 패턴
- Critical compatibility requirements: 기존 이벤트 데이터 구조 호환성, 기존 API 엔드포인트 유지, 기존 UI/UX 패턴 일관성, **백엔드 시스템 변경 금지**
- Each story must include verification that existing functionality remains intact

**중요한 제약사항**: 백엔드 마이그레이션은 절대 금지이며, 모든 반복 일정 기능은 프론트엔드에서만 구현해야 합니다. 기존 JSON 파일 기반 시스템을 그대로 유지하고, 기존 Express 서버 구조는 전혀 변경하지 마세요.

The epic should maintain system integrity while delivering 반복 일정 기본 기능 구현."
