# 네이밍 용어집 (Naming Glossary)

## 목적
일관되고 예측 가능한 명명 규칙을 유지하여 가독성과 검색/변경 용이성을 높인다.

## 액션 함수 접두사(권장)
- 생성: `create*`, `add*`, `build*`, `generate*`
- 조회: `get*`, `fetch*`, `query*`
- 변환: `parse*`, `split*`, `transform*`, `serialize*`
- 수정: `update*`, `mutate*`
- 삭제: `delete*`, `remove*`
- 통신: `send*`, `dispatch*`, `receive*`, `put*`
- 검증: `validate*`, `check*`
- 계산: `calc*`, `compute*`
- 제어: `init*`, `configure*`, `start*`, `stop*`
- 저장: `save*`, `store*`
- 로깅: `log*`, `record*`

## 데이터 변수 접두/접미사(권장)
- 수량: `count*`, `num*`, `total*`, `min*`, `max*`
- 상태: `is*`, `has*`, `current*`, `selected*`
- 시점: `*At`, `*Date`
- 식별자: `*Id`, `*Key`, `*Index`, `*Code`
- 집합: 복수형 `*s`

## 통일 용어(선호 ↔ 금지)
- UI 표시: `show*` ↔ `display*`
- 데이터 조회: `get*|fetch*` ↔ `load*`
- 저장: `save*` ↔ `write*`
- 변환: `transform*|parse*` ↔ `convert*`(모호)

## 예시
- 함수: `getEventById`, `updateEventTitle`, `saveEvents`, `validateRepeatInfo`
- 변수: `selectedEventIds`, `currentViewType`, `isOverlapping`, `eventCount`

## 적용 원칙
- 동일 의도 = 동일 용어
- 공개 API 이름 호환 유지 필요 시 alias로 단계적 이전
- 린트 경고 해결을 기본으로 하되, 예외는 PR 설명에 근거 남김


