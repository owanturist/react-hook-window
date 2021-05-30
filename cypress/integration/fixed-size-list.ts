beforeEach(() => {
  cy.visit('/')
})

it('handles scrolling correctly', () => {
  cy.findByTestId('container').as('container').should('be.visible')
  cy.get('@container')
    .then($ => $.get(0).clientHeight)
    .should('eq', 510)
  cy.get('@container')
    .then($ => $.get(0).scrollHeight)
    .should('eq', 1000) // 50px * 20

  cy.findByText('Item #0').should('be.visible')
  cy.findByText('Item #10').should('be.visible')
  cy.findByText('Item #11').should('not.be.visible')
  cy.findAllByTestId('item').should('have.length', 12)

  // scroll one item down
  cy.get('@container').scrollTo(0, 51)

  cy.findByText('Item #0').should('not.be.visible')
  cy.findByText('Item #11').should('be.visible')
  cy.findByText('Item #12').should('not.be.visible')
  cy.findAllByTestId('item').should('have.length', 13)

  // scroll some items down
  cy.get('@container').scrollTo(0, 151)

  cy.findByText('Item #0').should('not.exist')
  cy.findByText('Item #2').should('not.be.visible')
  cy.findByText('Item #3').should('be.visible')
  cy.findByText('Item #13').should('be.visible')
  cy.findByText('Item #14').should('not.be.visible')
  cy.findAllByTestId('item').should('have.length', 13)

  // scroll to the down
  cy.get('@container').scrollTo(0, 490)

  cy.findByText('Item #7').should('not.exist')
  cy.findByText('Item #8').should('not.be.visible')
  cy.findByText('Item #9').should('be.visible')
  cy.findByText('Item #19').should('be.visible')
  cy.findAllByTestId('item').should('have.length', 12)
})
