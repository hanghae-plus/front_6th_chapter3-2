# 일정 관리 애플리케이션 반복 일정 기능 브라운필드 PRD

## Intro Project Analysis and Context

### Existing Project Overview

#### Analysis Source
IDE 기반 신규 분석을 통해 현재 프로젝트의 상태를 파악했습니다.

#### Current Project State
현재 애플리케이션은 **7주차 과제의 요구사항이 적용된 일정 관리 애플리케이션**으로, 다음과 같은 기능들이 구현되어 있습니다:

- **일정 CRUD 기능**: 생성, 조회, 수정, 삭제
- **일정 상세 정보**: 제목, 날짜, 시작/종료 시간, 설명, 위치, 카테고리
- **캘린더 뷰**: 주별/월별 일정 표시
- **알림 설정**: 1분, 10분, 1시간, 2시간, 1일 전 알림
- **검색 기능**: 일정 검색
- **공휴일 표시**: 달력에 공휴일 정보 표시
- **일정 충돌 감지**: 겹치는 일정 경고
- **반복 일정 UI**: 반복 유형 선택, 간격 설정, 종료 날짜 설정 (UI만 구현, 로직 미구현)

### Available Documentation Analysis

#### Available Documentation
- ✅ Tech Stack Documentation (package.json 기반)
- ✅ Source Tree/Architecture (src 폴더 구조)
- ✅ Coding Standards (eslint.config.js, prettier 설정)
- ❌ API Documentation (서버 코드는 있으나 문서화되지 않음)
- ❌ External API Documentation
- ❌ UX/UI Guidelines
- ❌ Technical Debt Documentation

**중요**: 반복 일정 관련 문서화가 부족하여, 이 부분에 대한 상세한 분석이 필요합니다.

### Enhancement Scope Definition

#### Enhancement Type
- ✅ **New Feature Addition**: 반복 일정 로직 구현 (프론트엔드 전용)
- ✅ **Major Feature Modification**: 기존 반복 일정 UI를 실제 동작하는 기능으로 확장

#### Enhancement Description
현재 UI로만 구현되어 있는 반복 일정 기능을 **프론트엔드에서만** 실제로 동작하는 로직으로 구현하여, 사용자가 매일, 매주, 매월, 매년 단위로 반복되는 일정을 생성하고 관리할 수 있도록 합니다.

**중요한 제약사항**: 백엔드 마이그레이션(데이터베이스, 인증 시스템 등)은 모두 배제하고, 기존 JSON 파일 기반 시스템을 그대로 유지합니다.

#### Impact Assessment
- **Minimal Impact**: 기존 백엔드 구조는 전혀 변경하지 않고, 프론트엔드 로직만 추가
- **기존 기능 영향**: 반복 일정 관련 로직만 추가되며, 기존 일정 관리 기능은 그대로 유지

### Goals and Background Context

#### Goals
- 기존 반복 일정 UI를 실제 동작하는 기능으로 확장 (프론트엔드 전용)
- TDD 방식으로 반복 일정 로직을 구현하여 개발 품질 향상
- 사용자가 복잡한 반복 패턴을 쉽게 설정하고 관리할 수 있도록 개선
- 기존 일정 관리 기능의 성능과 사용성을 유지하면서 새로운 기능 추가
- **백엔드 변경 없이** 프론트엔드에서만 반복 일정 기능 완성

#### Background Context
현재 애플리케이션에는 반복 일정을 위한 UI 요소(반복 유형 선택, 간격 설정, 종료 날짜 설정)가 이미 구현되어 있지만, 실제로 반복 일정을 생성하고 관리하는 로직은 구현되지 않았습니다. 

사용자가 반복 일정을 설정해도 실제로는 단일 일정만 생성되고, 반복 패턴에 따른 추가 일정들이 자동으로 생성되지 않는 상황입니다. 

**아키텍처 결정**: 백엔드 마이그레이션은 프로젝트 범위와 복잡성을 고려하여 배제하고, 프론트엔드에서만 반복 일정 로직을 구현하여 TDD 학습 목적을 달성합니다.

### Change Log

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|---------|
| 초기 분석 | 2024-12-19 | v1.0 | 기존 애플리케이션 분석 및 요구사항 도출 | John (PM) |
| 백엔드 마이그레이션 배제 결정 | 2024-12-19 | v1.1 | 백엔드 변경 없이 프론트엔드 전용 구현으로 방향 전환 | John (PM) |

---

## Requirements

현재 애플리케이션 분석을 바탕으로 한 요구사항입니다. 이 요구사항들은 기존 시스템의 현실을 반영하고 있습니다. 신중하게 검토하고 프로젝트의 실제 상황과 일치하는지 확인해주세요.

### Functional Requirements

**FR1:** 시스템은 사용자가 설정한 반복 패턴(매일, 매주, 매월, 매년)에 따라 실제 반복 일정을 생성해야 한다 (프론트엔드에서만)

**FR2:** 반복 일정 생성 시 설정된 간격(1일마다, 2주마다 등)을 정확히 적용해야 한다

**FR3:** 반복 일정의 종료 조건(특정 날짜까지, 최대 10회)을 정확히 처리해야 한다

**FR4:** 반복 일정을 수정할 때는 해당 일정만 단일 일정으로 변경되어야 한다

**FR5:** 반복 일정을 삭제할 때는 해당 일정만 제거되어야 한다

**FR6:** 기존 일정 관리 기능(CRUD, 검색, 알림, 공휴일 표시, 일정 충돌 감지)은 그대로 유지되어야 한다

**FR7:** 반복 일정과 일반 일정을 시각적으로 구분하여 표시해야 한다

**FR8:** 반복 일정의 예외 날짜(특정 날짜 제외)를 처리할 수 있어야 한다

**FR9:** 주간 반복 시 특정 요일만 선택하여 반복되도록 설정할 수 있어야 한다

**FR10:** 반복 일정의 모든 일정을 일괄적으로 수정하거나 삭제할 수 있어야 한다

### Non-Functional Requirements

**NFR1:** 반복 일정 생성 시 31일 매월 반복은 31일에만, 윤년 29일 매년 반복은 29일에만 생성되어야 한다

**NFR2:** 반복 일정의 최대 종료 일자는 2025-10-30으로 제한되어야 한다

**NFR3:** 기존 일정 관리 기능의 성능이 저하되지 않아야 한다 (응답 시간 1초 이내)

**NFR4:** 반복 일정 관련 데이터는 기존 이벤트 데이터 구조와 호환되어야 한다

**NFR5:** 모든 새로운 기능은 TDD 방식으로 구현되어야 한다

**NFR6:** 백엔드 시스템은 전혀 변경하지 않고 프론트엔드에서만 구현해야 한다

### Compatibility Requirements

**CR1:** 기존 API 엔드포인트(`/api/events`)와의 호환성 유지
**CR2:** 기존 이벤트 데이터 스키마와의 호환성 유지
**CR3:** 기존 UI/UX 패턴과의 일관성 유지
**CR4:** 기존 테스트 코드와의 호환성 유지
**CR5:** 기존 JSON 파일 기반 데이터 저장 방식 유지

---

## User Interface Enhancement Goals

### Integration with Existing UI
새로운 반복 일정 기능은 기존 Material-UI 컴포넌트와 일관된 디자인을 유지하며, 기존 일정 관리 화면의 레이아웃과 스타일을 그대로 활용합니다.

### Modified/New Screens and Views
- **기존 일정 생성/수정 모달**: 반복 설정 옵션의 실제 동작 구현
- **캘린더 뷰**: 반복 일정 시각적 구분 표시 추가
- **일정 목록**: 반복 일정 관리 옵션 추가

### UI Consistency Requirements
- Material-UI 디자인 시스템 준수
- 기존 색상 팔레트와 아이콘 사용
- 기존 폼 검증 및 에러 처리 패턴 유지

---

## Technical Constraints and Integration Requirements

### Existing Technology Stack
**Languages**: TypeScript, JavaScript  
**Frameworks**: React 19.1.0, Express.js  
**Database**: JSON 파일 기반 (src/__mocks__/response/realEvents.json) - **변경 없음**  
**Infrastructure**: Vite 개발 서버, Node.js 서버 - **변경 없음**  
**External Dependencies**: Material-UI, Framer Motion, Notistack, MSW

### Integration Approach
**Database Integration Strategy**: **기존 JSON 파일 구조를 그대로 활용**하여 반복 일정 정보 저장 - 데이터베이스 마이그레이션 없음  
**API Integration Strategy**: **기존 Express.js 서버 구조를 그대로 유지**하여 반복 일정 관련 로직은 프론트엔드에서만 처리  
**Frontend Integration Strategy**: 기존 React 컴포넌트와 훅을 확장하여 반복 일정 기능 통합  
**Testing Integration Strategy**: 기존 Vitest 테스트 환경을 활용하여 TDD 방식으로 개발

### Code Organization and Standards
**File Structure Approach**: 기존 src/hooks, src/utils, src/types 구조를 유지하며 확장  
**Naming Conventions**: 기존 camelCase 네이밍 컨벤션 준수  
**Coding Standards**: ESLint, Prettier 설정 준수  
**Documentation Standards**: TypeScript 타입 정의를 통한 문서화

### Deployment and Operations
**Build Process Integration**: 기존 Vite 빌드 프로세스 활용 - **변경 없음**  
**Deployment Strategy**: 개발 환경에서의 로컬 서버 실행 방식 유지 - **변경 없음**  
**Monitoring and Logging**: 기존 콘솔 로깅 방식 유지 - **변경 없음**  
**Configuration Management**: 기존 환경 변수 및 설정 파일 구조 활용 - **변경 없음**

### Risk Assessment and Mitigation
**Technical Risks**: 반복 일정 로직의 복잡성으로 인한 버그 발생 가능성  
**Integration Risks**: 기존 기능과의 충돌 및 성능 저하  
**Deployment Risks**: **백엔드 변경이 없어 배포 관련 위험 최소화**  
**Mitigation Strategies**: 단계적 구현, 철저한 테스트, 기존 기능 검증, **백엔드 변경 없음으로 인한 위험 최소화**

---

## Epic and Story Structure

현재 애플리케이션 분석을 바탕으로, 이 개선사항은 **단일 Epic**으로 구성하는 것이 적절합니다. 그 이유는:

1. **기존 UI 기반**: 반복 일정 UI가 이미 구현되어 있어 새로운 화면 설계가 불필요
2. **로직 중심**: 실제 반복 일정 생성 및 관리 로직만 구현하면 됨
3. **점진적 통합**: 기존 시스템에 단계적으로 통합 가능
4. **위험 최소화**: **백엔드 변경이 없어** 기존 기능에 미치는 영향을 최소화
5. **프론트엔드 전용**: 복잡한 백엔드 통합 없이 프론트엔드 로직만 구현

**Epic Structure Decision**: 단일 Epic으로 구성하여 기존 시스템의 안정성을 유지하면서 반복 일정 기능을 점진적으로 통합

---

## Epic 1: 반복 일정 기능 완전 구현

### Epic Goal
기존 UI로만 구현되어 있는 반복 일정 기능을 **프론트엔드에서만** 실제로 동작하는 로직으로 구현하여, 사용자가 설정한 반복 패턴에 따라 실제 반복 일정을 생성하고 관리할 수 있도록 합니다.

### Integration Requirements
- 기존 일정 관리 기능과의 완벽한 통합
- 기존 데이터 구조와의 호환성 유지
- 기존 UI/UX 패턴과의 일관성 유지
- 기존 테스트 코드와의 호환성 유지
- **백엔드 시스템 변경 없음**

### Story 1.1: 반복 일정 생성 로직 구현

**As a** 사용자,  
**I want** 반복 일정 설정 시 실제로 반복되는 일정들이 생성되도록,  
**so that** 설정한 패턴에 따라 자동으로 일정이 생성된다.

#### Acceptance Criteria
1. 반복 유형(매일, 매주, 매월, 매년) 선택 시 해당 패턴에 맞는 일정들이 생성되어야 한다
2. 반복 간격 설정이 정확히 적용되어야 한다 (1일마다, 2주마다 등)
3. 반복 종료 조건(특정 날짜까지, 최대 10회)이 정확히 처리되어야 한다
4. 생성된 반복 일정들은 **기존 JSON 파일 구조에 저장**되어야 한다
5. 반복 일정 생성 후 성공 메시지가 표시되어야 한다

#### Integration Verification
**IV1:** 기존 단일 일정 생성 기능이 정상적으로 동작하는지 확인
**IV2:** 기존 일정 수정/삭제 기능이 반복 일정과 충돌하지 않는지 확인
**IV3:** 기존 검색 및 필터링 기능이 반복 일정을 포함하여 정상 동작하는지 확인

### Story 1.2: 반복 일정 시각적 구분 구현

**As a** 사용자,  
**I want** 캘린더에서 반복 일정을 일반 일정과 구분하여 볼 수 있도록,  
**so that** 반복 일정을 쉽게 식별할 수 있다.

#### Acceptance Criteria
1. 캘린더 뷰에서 반복 일정이 아이콘과 함께 표시되어야 한다
2. 반복 일정의 반복 패턴이 시각적으로 명확하게 표시되어야 한다
3. 반복 일정과 일반 일정의 구분이 명확해야 한다
4. 반복 일정 클릭 시 상세 정보가 표시되어야 한다

#### Integration Verification
**IV1:** 기존 캘린더 뷰의 레이아웃과 스타일이 유지되는지 확인
**IV2:** 기존 일정 표시 기능이 정상적으로 동작하는지 확인
**IV3:** 기존 일정 클릭 이벤트가 반복 일정에서도 정상 동작하는지 확인

### Story 1.3: 반복 일정 수정 기능 구현

**As a** 사용자,  
**I want** 반복 일정을 수정할 수 있도록,  
**so that** 특정 일정만 변경할 수 있다.

#### Acceptance Criteria
1. 반복 일정 수정 시 해당 일정만 단일 일정으로 변경되어야 한다
2. 수정된 일정은 반복 일정 아이콘이 사라져야 한다
3. 수정된 일정은 **기존 JSON 파일에 저장**되어야 한다
4. 수정 후 성공 메시지가 표시되어야 한다

#### Integration Verification
**IV1:** 기존 일정 수정 기능이 정상적으로 동작하는지 확인
**IV2:** 기존 일정 저장 API가 반복 일정 수정을 정상 처리하는지 확인
**IV3:** 기존 폼 검증 로직이 반복 일정 수정에서도 정상 동작하는지 확인

### Story 1.4: 반복 일정 삭제 기능 구현

**As a** 사용자,  
**I want** 반복 일정을 삭제할 수 있도록,  
**so that** 특정 일정만 제거할 수 있다.

#### Acceptance Criteria
1. 반복 일정 삭제 시 해당 일정만 삭제되어야 한다
2. 삭제된 일정은 **기존 JSON 파일에서 제거**되어야 한다
3. 삭제 후 성공 메시지가 표시되어야 한다
4. 다른 반복 일정은 영향을 받지 않아야 한다

#### Integration Verification
**IV1:** 기존 일정 삭제 기능이 정상적으로 동작하는지 확인
**IV2:** 기존 일정 삭제 API가 반복 일정 삭제를 정상 처리하는지 확인
**IV3:** 기존 일정 목록 업데이트가 정상적으로 동작하는지 확인

### Story 1.5: 반복 일정 고급 기능 구현

**As a** 사용자,  
**I want** 반복 일정의 예외 날짜와 요일 지정 기능을 사용할 수 있도록,  
**so that** 더욱 세밀한 반복 패턴을 설정할 수 있다.

#### Acceptance Criteria
1. 반복 일정에서 특정 날짜를 제외할 수 있어야 한다
2. 주간 반복 시 특정 요일만 선택하여 반복되도록 설정할 수 있어야 한다
3. 예외 설정 정보는 **기존 JSON 파일 구조에 저장**되어야 한다
4. 예외 설정이 적용된 반복 일정이 정확히 표시되어야 한다

#### Integration Verification
**IV1:** 기존 반복 일정 생성 로직이 예외 설정을 정상 처리하는지 확인
**IV2:** 기존 캘린더 표시 기능이 예외 설정을 반영하여 정상 동작하는지 확인
**IV3:** 기존 데이터 저장 구조가 예외 설정 정보를 포함할 수 있는지 확인

### Story 1.6: 반복 일정 일괄 관리 기능 구현

**As a** 사용자,  
**I want** 반복 일정의 모든 일정을 일괄적으로 수정하거나 삭제할 수 있도록,  
**so that** 반복 패턴을 효율적으로 관리할 수 있다.

#### Acceptance Criteria
1. 반복 일정의 모든 일정을 선택하여 일괄 수정할 수 있어야 한다
2. 반복 일정의 모든 일정을 선택하여 일괄 삭제할 수 있어야 한다
3. 일괄 작업은 **기존 API를 통해 처리**되어야 한다
4. 일괄 작업 후 성공 메시지가 표시되어야 한다

#### Integration Verification
**IV1:** 기존 일정 수정/삭제 API가 일괄 작업을 정상 처리하는지 확인
**IV2:** 기존 일정 목록 업데이트가 일괄 작업 후 정상 동작하는지 확인
**IV3:** 기존 캘린더 뷰가 일괄 작업 결과를 정상 반영하는지 확인

---

## Checklist Results Report

PRD 작성이 완료되었습니다. 이제 pm-checklist를 실행하여 문서의 품질을 검증하고 결과를 보고하겠습니다.

---

## Next Steps

### UX Expert Prompt
UX Expert에게 이 PRD를 전달하여 기존 UI와의 통합 방안을 검토하고 사용자 경험을 개선하도록 합니다.

### Architect Prompt
Architect에게 이 PRD를 전달하여 **프론트엔드 전용** 기술적 아키텍처 설계를 진행하도록 합니다.

이 PRD는 기존 일정 관리 애플리케이션에 **백엔드 변경 없이** 반복 일정 기능을 추가하는 브라운필드 개선사항을 정의합니다. 기존 시스템의 안정성을 유지하면서 새로운 기능을 점진적으로 통합하는 방안을 제시하며, 각 Story는 기존 기능과의 호환성을 검증하는 단계를 포함하고 있습니다.

**중요한 제약사항**: 모든 반복 일정 기능은 프론트엔드에서만 구현되며, 백엔드 시스템(데이터베이스, 인증, API 구조 등)은 전혀 변경하지 않습니다.
