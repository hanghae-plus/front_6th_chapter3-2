# Story 6.1: 명명/인터페이스 일관화

## Story Goal

코드 전반에 예측 가능하고 일관된 명명 체계를 적용하고, 액션/데이터 네이밍 패턴을 준수하도록 정비한다. 외부 공개 API/타입은 유지하면서 내부 구현/파일·심볼 명을 표준화한다.

## User Story

As a developer, I want consistent and predictable names so that I can understand, search, and change code safely.

## Acceptance Criteria

1. 액션 함수 접두어를 표준 패턴으로 정렬: `create|get|update|delete|validate|compute|init|save|log|send|dispatch|parse|transform`
2. 데이터 변수 접두/접미 규칙 적용: `count|num|is|has|current|selected|...s|...Id|...At|type`
3. 동의어 혼용 제거: 동일 의도에는 동일 용어만 사용(예: `show` 또는 `display` 중 하나로 통일)
4. 공개 API/타입/스토리지 계약 불변. 기존 테스트는 수정하지 않음(필요 시 비공개 내부만 변경하거나 내보내기(alias)로 호환 유지)
5. 린트 규칙(`naming-convention`, `no-restricted-syntax` 금지 용어 리스트) 추가 및 전 파일 적용
6. 빌드/타입체크/테스트 전체 그린. 린트 경고 0
7. `docs/qa/naming-glossary.md`에 용어집(선호 용어/금지 용어/예시) 작성 및 본 스토리에서 링크

## Technical Notes

- 린트 설정: 액션/데이터 패턴을 `@typescript-eslint/naming-convention`으로 강제
- 금지/치환 목록: `no-restricted-syntax` 또는 커스텀 룰로 `display↔show`, `load↔fetch`, `write↔save` 등의 혼용 방지
- 코데모드: `ts-morph/jscodeshift`로 내부 심볼 대량 리네이밍(외부 export는 alias로 유지)
- 문서: `docs/qa/naming-glossary.md`에 표 형태로 사례/허용·금지 패턴 기재 (본 스토리에서 참조)

## Definition of Done

- [ ] 린트 규칙과 스크립트 반영(`eslint.config.js`)
- [ ] 금지/선호 용어 용어집 작성(`docs/qa/naming-glossary.md`)
- [ ] 내부 심볼 리네이밍 적용(비호환 변경 없음)
- [ ] 공개 export는 기존 이름 유지 또는 deprecated alias 제공
- [ ] 전체 테스트/타입/린트 그린(경고 0)

## Risks & Mitigations

- 리네이밍 범위가 커서 충돌 위험: 작은 PR 단위, 자동화 스크립트, 단계 적용
- 공개 이름 변경 위험: 기존 export 유지 + 내부 alias로 단계적 전환
- 혼용 재발: 린트 게이트/PR 템플릿에 체크리스트 추가

## Testing Requirements

- 런타임 동작 동치성 회귀 테스트(기존 테스트 유지)
- 린트 CI에서 `naming-convention`/`no-restricted-syntax` 위반 0 확인
- 신규 작은 단위 테스트: alias 경로/이름 통해 동일 동작 보장

## Implementation Steps

1. `eslint.config.js`에 네이밍 규칙/금지 용어 반영 → CI 통합
2. `docs/qa/naming-glossary.md` 초안 작성(본 문서에서 링크)
3. 내부 심볼부터 일괄 리네이밍(테스트/공개 export 비변경) → 단계 PR
4. alias 경로/이름 추가 후 사용처 천천히 이전
5. 최종 린트/타입/테스트 그린 확인


