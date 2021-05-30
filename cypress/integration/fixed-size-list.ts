beforeEach(() => {
  cy.visit('/')
})

it('handles scrolling correctly', () => {
  cy.findByTestId('container').as('container').should('be.visible')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 1000) // 50px * 20

  cy.findByText('Item #12').should('not.exist')
  cy.findByText('Item #11').should('exist').should('not.be.visible')
  cy.findByText('Item #10').should('be.visible')
  cy.findByText('Item #0').should('be.visible')
  cy.findAllByTestId('item').should('have.length', 12)

  // scroll one item down
  cy.get('@container').scrollTo(0, 55, { duration: 100 })

  cy.findByText('Item #12').should('exist').should('not.be.visible')
  cy.findByText('Item #11').should('be.visible')
  cy.findByText('Item #0').should('not.be.visible')
  cy.findAllByTestId('item').should('have.length', 13)

  // scroll some items down
  cy.get('@container').scrollTo(0, 151, { duration: 100 })

  cy.findByText('Item #14').should('exist').should('not.be.visible')
  cy.findByText('Item #13').should('be.visible')
  cy.findByText('Item #3').should('be.visible')
  cy.findByText('Item #2').should('not.be.visible')
  cy.findByText('Item #0').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 13)

  // scroll to the down
  cy.get('@container').scrollTo(0, 490, { duration: 100 })

  cy.findByText('Item #19').should('exist').should('be.visible')
  cy.findByText('Item #9').should('be.visible')
  cy.findByText('Item #8').should('not.be.visible')
  cy.findByText('Item #7').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 12)
})

it('handles container resizing', () => {
  cy.findByTestId('container').as('container').should('be.visible')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 1000) // 50px * 20

  // expand container
  cy.findByTestId('container-size-input').fill('810')
  cy.get('@container').getClientHeight().should('eq', 810)
  cy.get('@container').getScrollHeight().should('eq', 1000) // 50px * 20

  cy.findByText('Item #18').should('not.exist')
  cy.findByText('Item #17').should('exist').should('not.be.visible')
  cy.findByText('Item #16').should('be.visible')
  cy.findByText('Item #0').should('be.visible')
  cy.findAllByTestId('item').should('have.length', 18)

  // shrink container
  cy.findByTestId('container-size-input').fill('210')
  cy.get('@container').getClientHeight().should('eq', 210)
  cy.get('@container').getScrollHeight().should('eq', 1000) // 50px * 20

  cy.findByText('Item #6').should('not.exist')
  cy.findByText('Item #5').should('exist').should('not.be.visible')
  cy.findByText('Item #4').should('be.visible')
  cy.findByText('Item #0').should('be.visible')
  cy.findAllByTestId('item').should('have.length', 6)

  // scroll to the down
  cy.get('@container').scrollTo(0, 790, { duration: 100 })
  cy.findByText('Item #19').should('exist').should('be.visible')
  cy.findByText('Item #15').should('be.visible')
  cy.findByText('Item #14').should('not.be.visible')
  cy.findByText('Item #13').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 6)
})
