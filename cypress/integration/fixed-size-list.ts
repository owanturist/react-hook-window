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
  cy.get('@container').scrollTo(0, 55, { duration: 300, easing: 'swing' })

  cy.findByText('Item #13').should('not.exist')
  cy.findByText('Item #12').should('not.be.visible')
  cy.findByText('Item #11').should('be.visible')
  cy.findByText('Item #0').should('not.be.visible')
  cy.findAllByTestId('item').should('have.length', 13)

  // scroll some items down
  cy.get('@container').scrollTo(0, 151, { duration: 300, easing: 'swing' })

  cy.findByText('Item #15').should('not.exist')
  cy.findByText('Item #14').should('not.be.visible')
  cy.findByText('Item #13').should('be.visible')
  cy.findByText('Item #3').should('be.visible')
  cy.findByText('Item #2').should('not.be.visible')
  cy.findByText('Item #0').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 13)

  // scroll to the down
  cy.get('@container').scrollTo(0, 490, { duration: 300, easing: 'swing' })

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

  // scroll to the down
  cy.get('@container').scrollTo(0, 790, { duration: 300, easing: 'swing' })
  cy.findByText('Item #19').should('be.visible')
  cy.findByText('Item #15').should('be.visible')
  cy.findByText('Item #14').should('not.be.visible')
  cy.findByText('Item #13').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 6)

  // double size
  cy.findByTestId('container-size-input').fill('420')
  cy.get('@container').getClientHeight().should('eq', 420)
  cy.get('@container').getScrollHeight().should('eq', 1000) // 50px * 20

  cy.findByText('Item #19').should('be.visible')
  cy.findByText('Item #11').should('be.visible')
  cy.findByText('Item #10').should('not.be.visible')
  cy.findByText('Item #9').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 10)
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

  // scroll to the down
  cy.get('@container').scrollTo(0, 90, { duration: 300, easing: 'swing' })
  cy.findByText('Item #19').should('be.visible')
  cy.findByText('Item #3').should('be.visible')
  cy.findByText('Item #2').should('be.visible')
  cy.findByText('Item #1').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 18)

  // double size
  cy.findByTestId('item-size-input').fill('60')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 1200) // 60px * 20

  cy.findByText('Item #11').should('not.exist')
  cy.findByText('Item #10').should('be.visible')
  cy.findByText('Item #9').should('be.visible')
  cy.findByText('Item #1').should('be.visible')
  cy.findByText('Item #0').should('not.be.visible')
  cy.findAllByTestId('item').should('have.length', 11)
})

it('handles item count change', () => {
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

  // scroll to the down
  cy.get('@container').scrollTo(0, 240, { duration: 300, easing: 'swing' })
  cy.findByText('Item #14').should('be.visible')
  cy.findByText('Item #4').should('be.visible')
  cy.findByText('Item #3').should('not.be.visible')
  cy.findByText('Item #2').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 12)

  // scroll up and increase item count
  cy.get('@container').scrollTo(0, 0, { duration: 300, easing: 'swing' })
  cy.findByTestId('item-count-input').fill('1000')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 50000) // 50px * 1000

  // scroll to the down
  cy.get('@container').scrollTo(0, 49490, { duration: 300, easing: 'swing' })
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

it('handles overscan count change', () => {
  cy.findByTestId('container').as('container').should('be.visible')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 1000) // 50px * 20

  // increase overscan count
  cy.findByTestId('overscan-count-input').fill('3')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 1000) // 50px * 20

  cy.findByText('Item #14').should('not.exist')
  cy.findByText('Item #13').should('not.be.visible')
  cy.findByText('Item #12').should('not.be.visible')
  cy.findByText('Item #11').should('not.be.visible')
  cy.findByText('Item #10').should('be.visible')
  cy.findByText('Item #0').should('be.visible')
  cy.findAllByTestId('item').should('have.length', 14)

  // scroll some items down
  cy.get('@container').scrollTo(0, 201, { duration: 300, easing: 'swing' })

  cy.findByText('Item #18').should('not.exist')
  cy.findByText('Item #17').should('not.be.visible')
  cy.findByText('Item #16').should('not.be.visible')
  cy.findByText('Item #15').should('not.be.visible')
  cy.findByText('Item #14').should('be.visible')
  cy.findByText('Item #13').should('be.visible')
  cy.findByText('Item #4').should('be.visible')
  cy.findByText('Item #3').should('not.be.visible')
  cy.findByText('Item #2').should('not.be.visible')
  cy.findByText('Item #1').should('not.be.visible')
  cy.findByText('Item #0').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 17)

  // scroll to the down
  cy.get('@container').scrollTo(0, 490, { duration: 300, easing: 'swing' })

  cy.findByText('Item #19').should('be.visible')
  cy.findByText('Item #9').should('be.visible')
  cy.findByText('Item #8').should('not.be.visible')
  cy.findByText('Item #7').should('not.be.visible')
  cy.findByText('Item #6').should('not.be.visible')
  cy.findByText('Item #5').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 14)

  // set overscan count to 0
  cy.findByTestId('overscan-count-input').fill('0')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 1000) // 50px * 20

  cy.findByText('Item #19').should('be.visible')
  cy.findByText('Item #9').should('be.visible')
  cy.findByText('Item #8').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 11)

  // scroll some items up
  cy.get('@container').scrollTo(0, 201, { duration: 300, easing: 'swing' })

  cy.findByText('Item #15').should('not.exist')
  cy.findByText('Item #14').should('be.visible')
  cy.findByText('Item #13').should('be.visible')
  cy.findByText('Item #4').should('be.visible')
  cy.findByText('Item #3').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 11)

  // scroll up
  cy.get('@container').scrollTo(0, 0, { duration: 300, easing: 'swing' })

  cy.findByText('Item #11').should('not.exist')
  cy.findByText('Item #10').should('be.visible')
  cy.findByText('Item #0').should('be.visible')
  cy.findAllByTestId('item').should('have.length', 11)
})

it('scrolls to initial position', () => {
  cy.findByTestId('container').should('be.visible')

  // change initial scroll and toggle visibility twise
  cy.findByTestId('initial-scroll-px-input').fill('55')
  cy.findByTestId('visibility-checkbox').click()
  cy.findByTestId('container').should('not.exist')
  cy.findByTestId('visibility-checkbox').click()
  cy.findByTestId('container').as('container').should('be.visible')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 1000) // 50px * 20

  cy.findByText('Item #13').should('not.exist')
  cy.findByText('Item #12').should('not.be.visible')
  cy.findByText('Item #11').should('be.visible')
  cy.findByText('Item #0').should('not.be.visible')
  cy.findAllByTestId('item').should('have.length', 13)

  // change initial scroll and toggle visibility twise
  cy.findByTestId('initial-scroll-px-input').fill('490')
  cy.findByTestId('visibility-checkbox').click()
  cy.findByTestId('container').should('not.exist')
  cy.findByTestId('visibility-checkbox').click()
  cy.findByTestId('container').as('container').should('be.visible')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 1000) // 50px * 20

  cy.findByText('Item #19').should('be.visible')
  cy.findByText('Item #9').should('be.visible')
  cy.findByText('Item #8').should('not.be.visible')
  cy.findByText('Item #7').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 12)
})

it('scrolls to initial position by item index', () => {
  cy.findByTestId('container').should('be.visible')

  // change to start position
  cy.findByTestId('initial-scroll-index-input').fill('4')
  cy.findByTestId('initial-scroll-position-select').select('start')
  cy.findByTestId('visibility-checkbox').click()
  cy.findByTestId('container').should('not.exist')
  cy.findByTestId('visibility-checkbox').click()
  cy.findByTestId('container').as('container').should('be.visible')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 1000) // 50px * 20

  cy.findByText('Item #16').should('not.exist')
  cy.findByText('Item #15').should('not.be.visible')
  cy.findByText('Item #14').should('be.visible')
  cy.findByText('Item #4').should('be.visible')
  cy.findByText('Item #3').should('be.visible') // visible because in the border
  cy.findByText('Item #2').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 13)

  // change to end position
  cy.findByTestId('initial-scroll-index-input').fill('17')
  cy.findByTestId('initial-scroll-position-select').select('end')
  cy.findByTestId('visibility-checkbox').click()
  cy.findByTestId('container').should('not.exist')
  cy.findByTestId('visibility-checkbox').click()
  cy.findByTestId('container').as('container').should('be.visible')
  cy.get('@container').getClientHeight().should('eq', 510)
  cy.get('@container').getScrollHeight().should('eq', 1000) // 50px * 20

  cy.findByText('Item #19').should('not.exist')
  cy.findByText('Item #18').should('be.visible')
  cy.findByText('Item #17').should('be.visible')
  cy.findByText('Item #7').should('be.visible')
  cy.findByText('Item #6').should('not.be.visible')
  cy.findByText('Item #5').should('not.exist')
  cy.findAllByTestId('item').should('have.length', 13)
})
