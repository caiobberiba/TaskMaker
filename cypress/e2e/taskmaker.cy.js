describe('TaskMaker - Tela Principal', () => {
  it('Deve exibir o botão de adicionar tarefa', () => {
    cy.visit('/index.html')
    cy.contains('Adicionar').should('be.visible')
  })
})
