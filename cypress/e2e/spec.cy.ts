describe('📅 캘린더 앱 - 사용자 시나리오 기반 E2E', () => {
  beforeEach(() => {
    // 서버 시작 및 앱 방문
    cy.visit('/');
  });

  describe('🌅 아침 출근 전 - 하루 일정 확인 및 계획', () => {
    it('1. 오늘 일정을 추가하고 확인할 수 있다', () => {
      const today = new Date().toISOString().split('T')[0];

      // 아침 회의 추가
      cy.get('#title').type('팀 스탠드업');
      cy.get('#date').type(today);
      cy.get('#start-time').type('09:00');
      cy.get('#end-time').type('10:00');
      cy.get('#description').type('개발 3팀 스탠드업 미팅');
      cy.get('#location').type('개발 3팀 회의실');
      cy.get('[data-testid="event-submit-button"]').click();

      // 점심 약속 추가
      cy.get('#title').type('가족 저녁 식사');
      cy.get('#date').type(today);
      cy.get('#start-time').type('17:00');
      cy.get('#end-time').type('18:00');
      cy.get('#description').type('부모님과의 저녁 식사');
      cy.get('#location').type('강남역 레스토랑');
      cy.get('#category').click();
      cy.get('[aria-label="가족-option"]').click();
      cy.get('[data-testid="event-submit-button"]').click();

      cy.get('#viewType').click();
      cy.get('[aria-label="week-option"]').click();

      cy.get('[data-testid="event-list"]').should('contain', '팀 스탠드업');
      cy.get('[data-testid="event-list"]').should('contain', '가족 저녁 식사');
      cy.get('[data-testid="week-view"]').should('contain', '팀 스탠드업');
      cy.get('[data-testid="week-view"]').should('contain', '가족 저녁 식사');
    });

    it('2. 주간 반복 일정을 추가하고 확인할 수 있다', () => {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstDayString = firstDayOfMonth.toISOString().split('T')[0];

      cy.get('#title').type('주간 정기 보고');
      cy.get('#date').type(firstDayString);
      cy.get('#start-time').type('10:30');
      cy.get('#end-time').type('11:30');
      cy.get('#description').type('주간 팀별 정기 보고');
      cy.get('#location').type('회의실');
      cy.get('#repeatType').click();
      cy.get('[aria-label="weekly-option"]').click();
      cy.get('[data-testid="event-submit-button"]').click();

      cy.get('[data-testid="event-list"]').should('contain', '주간 정기 보고');
      cy.get('[data-testid="event-list"]').should('contain', '10:00 - 11:00');
      cy.get('[data-testid="event-list"]').should('contain', '주간 팀별 정기 보고');
      cy.get('[data-testid="event-list"]').should('contain', '회의실');
      cy.get('[data-testid="event-list"]').should('contain', '카테고리: 업무');
    });
  });

  describe('💼 업무 중 - 일정 변경 및 삭제', () => {
    it('1. 기존 일정을 수정할 수 있다', () => {
      cy.contains('[data-testid="event-list"] > div', '가족 저녁 식사').within(() => {
        cy.get('[aria-label="Edit event"]').click();
      });

      cy.get('#location').clear();
      cy.get('#location').type('삼성역 레스토랑');
      cy.get('[data-testid="event-submit-button"]').click();

      cy.get('[data-testid="event-list"]').should('contain', '삼성역 레스토랑');
    });

    it('2. 반복 일정 수정 시 일반 일정으로 변경된다.', () => {
      cy.contains('[data-testid="event-list"] > div', '주간 정기 보고')
        .first()
        .within(() => {
          cy.get('[aria-label="Edit event"]').click();
        });

      cy.get('#title').clear();
      cy.get('#title').type('긴급 임시 회의');

      cy.get('[data-testid="event-submit-button"]').click();

      cy.contains('[data-testid="event-list"] > div', '긴급 임시 회의')
        .should('not.contain', '반복:')
        .and('not.contain', '주마다');
    });

    it('3. 일정을 삭제할 수 있다.', () => {
      cy.contains('[data-testid="event-list"] > div', '팀 스탠드업').within(() => {
        cy.get('[aria-label="Delete event"]').click();
      });
    });

    it('4. 반복 일정 삭제 시 다른 반복 일정은 삭제되지 않는다.', () => {
      cy.contains('[data-testid="event-list"] > div', '주간 정기 보고')
        .first()
        .within(() => {
          cy.get('[aria-label="Delete event"]').click();
        });

      cy.get('[data-testid="event-list"]').contains('주간 정기 보고');
    });
  });
});
