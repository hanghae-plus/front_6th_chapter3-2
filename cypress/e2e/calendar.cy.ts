describe('단일 일정 생성 E2E 테스트', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('사용자가 반복 일정 체크박스를 해제하고 단일 일정을 생성한다', () => {
    it('반복 일정 체크박스가 체크되어 있을 때 해제하고 하루만 일정을 생성한다', () => {
      // 기본 일정 정보 입력
      cy.get('#title').type('회의');
      cy.get('#date').type('2025-08-25');
      cy.get('#start-time').type('14:00');
      cy.get('#end-time').type('15:00');
      cy.get('#description').type('팀 회의');
      cy.get('#location').type('회의실 A');
      cy.get('#category').click();
      cy.get('[aria-label="업무-option"]').click();

      // 반복 일정 체크박스가 체크되어 있는지 확인하고 해제
      cy.get('input[type="checkbox"]').should('be.checked');
      cy.contains('반복 일정').click();
      cy.get('input[type="checkbox"]').should('not.be.checked');

      // 일정 추가 버튼 클릭
      cy.get('[data-testid="event-submit-button"]').click();

      // 일정 겹침 경고 모달이 나타나면 계속 진행 버튼 클릭
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="overlap-continue-button"]').length > 0) {
          cy.get('[data-testid="overlap-continue-button"]').click();
        }
      });

      // 성공 메시지 확인
      cy.contains('일정이 추가되었습니다.').should('be.visible');

      // 일정 목록에 단일 일정만 표시되는지 확인
      cy.get('[data-testid="event-list"]').should('contain', '회의');
      cy.get('[data-testid="event-list"]').should('contain', '2025-08-25');
      cy.get('[data-testid="event-list"]').should('contain', '14:00 - 15:00');

      // 월간 뷰에서 해당 날짜에만 일정이 표시되는지 확인
      cy.get('[data-testid="month-view"]').contains('25').parent().should('contain', '회의');

      // 다른 날짜에는 일정이 표시되지 않는지 확인
      cy.get('[data-testid="month-view"]').contains('26').parent().should('not.contain', '회의');

      // 반복 아이콘이 표시되지 않는지 확인
      cy.get('[data-testid="month-view"]').find('[data-testid="repeat-icon"]').should('not.exist');

      // 일정 목록에서 반복 정보가 표시되지 않는지 확인
      cy.get('[data-testid="event-list"]').should('not.contain', '반복:');
    });
  });
});
