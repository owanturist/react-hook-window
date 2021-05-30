beforeEach(() => {
  cy.visit('/')
})

it('handles scrolling correctly', () => {
  cy.findByTestId('container').as('container').should('be.visible')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 1000) // 50px * 20

  cy.findByText('Item #12').should('not.exist')
  cy.findByText('Item #11').should('not.be.visible')
  cy.findByText('Item #10').should('be.visible')
  cy.findByText('Item #0').should('be.visible')
  cy.findAllByTestId('item').should('have.length', 12)

  // scroll one item down
  cy.get('@container').scrollTo(0, 55, { duration: 100 })

  cy.findByText('Item #12').should('not.be.visible')
  cy.findByText('Item #11').should('be.visible')
  cy.findByText('Item #0').should('not.be.visible')
  cy.findAllByTestId('item').should('have.length', 13)

  // scroll some items down
  cy.get('@container').scrollTo(0, 151, { duration: 100 })

  cy.findByText('Item #14').should('not.be.visible')
  cy.findByText('Item #13').should('be.visible')
  cy.findByText('Item #3').should('be.visible')
  cy.findByText('Item #2').should('not.be.visible')
  cy.findByText('Item #0').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 13)

  // scroll to the very bottom
  cy.get('@container').scrollTo(0, 490, { duration: 100 })

  cy.findByText('Item #19').should('be.visible')
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
  cy.findByText('Item #17').should('not.be.visible')
  cy.findByText('Item #16').should('be.visible')
  cy.findByText('Item #0').should('be.visible')
  cy.findAllByTestId('item').should('have.length', 18)

  // shrink container
  cy.findByTestId('container-size-input').fill('210')
  cy.get('@container').getClientHeight().should('eq', 210)
  cy.get('@container').getScrollHeight().should('eq', 1000) // 50px * 20

  cy.findByText('Item #6').should('not.exist')
  cy.findByText('Item #5').should('not.be.visible')
  cy.findByText('Item #4').should('be.visible')
  cy.findByText('Item #0').should('be.visible')
  cy.findAllByTestId('item').should('have.length', 6)

  // scroll to the very bottom
  cy.get('@container').scrollTo(0, 790, { duration: 100 })
  cy.findByText('Item #19').should('be.visible')
  cy.findByText('Item #15').should('be.visible')
  cy.findByText('Item #14').should('not.be.visible')
  cy.findByText('Item #13').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 6)
})

it('handles item resizing', () => {
  cy.findByTestId('container').as('container').should('be.visible')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 1000) // 50px * 20

  // expand items
  cy.findByTestId('item-size-input').fill('90')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 1800) // 90px * 20

  cy.findByText('Item #7').should('not.exist')
  cy.findByText('Item #6').should('not.be.visible')
  cy.findByText('Item #5').should('be.visible')
  cy.findByText('Item #0').should('be.visible')
  cy.findAllByTestId('item').should('have.length', 7)

  // shrink items
  cy.findByTestId('item-size-input').fill('30')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 600) // 30px * 20

  cy.findByText('Item #18').should('not.exist')
  cy.findByText('Item #17').should('be.visible') // visible because in the 510 border
  cy.findByText('Item #0').should('be.visible')
  cy.findAllByTestId('item').should('have.length', 18)

  // scroll to the very bottom
  cy.get('@container').scrollTo(0, 90, { duration: 100 })
  cy.findByText('Item #19').should('be.visible')
  cy.findByText('Item #3').should('be.visible')
  cy.findByText('Item #2').should('be.visible')
  cy.findByText('Item #1').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 18)
})

it('handle item count change', () => {
  cy.findByTestId('container').as('container').should('be.visible')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 1000) // 50px * 20

  // decrease item count
  cy.findByTestId('item-count-input').fill('15')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 750) // 50px * 15

  cy.findByText('Item #12').should('not.exist')
  cy.findByText('Item #11').should('not.be.visible')
  cy.findByText('Item #10').should('be.visible')
  cy.findByText('Item #0').should('be.visible')
  cy.findAllByTestId('item').should('have.length', 12)

  // scroll to the very bottom
  cy.get('@container').scrollTo(0, 240, { duration: 100 })
  cy.findByText('Item #14').should('be.visible')
  cy.findByText('Item #4').should('be.visible')
  cy.findByText('Item #3').should('not.be.visible')
  cy.findByText('Item #2').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 12)

  // scroll top and increase item count
  cy.get('@container').scrollTo(0, 0, { duration: 100 })
  cy.findByTestId('item-count-input').fill('1000')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 50000) // 50px * 1000

  // scroll to the very bottom
  cy.get('@container').scrollTo(0, 49490, { duration: 300 })
  cy.findByText('Item #999').should('be.visible')
  cy.findByText('Item #989').should('be.visible')
  cy.findByText('Item #988').should('not.be.visible')
  cy.findByText('Item #987').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 12)

  // cause overscroll
  cy.findByTestId('item-count-input').fill('100')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 5000) // 50px * 100

  cy.findByText('Item #99').should('be.visible')
  cy.findByText('Item #89').should('be.visible')
  cy.findByText('Item #88').should('not.be.visible')
  cy.findByText('Item #87').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 12)

  // cause overscroll again
  cy.findByTestId('item-count-input').fill('10')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 510) // 50px * 10 < 510

  cy.findByText('Item #9').should('be.visible')
  cy.findByText('Item #9').should('be.visible')
  cy.findByText('Item #0').should('be.visible')
  cy.findAllByTestId('item').should('have.length', 10)
})
