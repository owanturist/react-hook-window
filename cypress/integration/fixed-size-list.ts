const toggleVisibility = (): void => {
  cy.findByTestId('container').should('be.visible')
  cy.findByTestId('visibility-checkbox').click().click()
  cy.findByTestId('container').should('be.visible')
}

const setContainerSize = (height: number): void => {
  cy.findByTestId('container-size-input').fill(height.toString())
}

const setItemSize = (height: number): void => {
  cy.findByTestId('item-size-input').fill(height.toString())
}

const setItemCount = (count: number): void => {
  cy.findByTestId('item-count-input').fill(count.toString())
}

const setOverscanCount = (count: number): void => {
  cy.findByTestId('overscan-count-input').fill(count.toString())
}

const setInitialScrollTo = (px: number): void => {
  cy.findByTestId('initial-scroll-px-input').fill(px.toString())
  toggleVisibility()
}

const setInitialScrollToItem = (index: number, position: string): void => {
  cy.findByTestId('initial-scroll-index-input').fill(index.toString())
  cy.findByTestId('initial-scroll-position-select').select(position)
  toggleVisibility()
}

const getItemByIndex = (
  index: number
): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.findByText(`Item #${index}`)
}

const checkRenderedItemsCount = (count: number): void => {
  cy.findAllByTestId('item').should('have.length', count)
}

const checkContainerSize = ({
  height,
  scrollHeight
}: {
  height: number
  scrollHeight: number
}): void => {
  cy.findByTestId('container').as('container').should('be.visible')
  cy.get('@container').getClientHeight().should('eq', height)
  cy.get('@container').getScrollHeight().should('eq', scrollHeight)
}

const scrollContainer = ({
  x = 0,
  y = 0
}: {
  x?: number
  y?: number
}): void => {
  cy.findByTestId('container').scrollTo(x, y, { duration: 30 })
}

beforeEach(() => {
  cy.visit('/')

  checkContainerSize({
    height: 510,
    scrollHeight: 1000 // 50px * 20
  })
})

it('handles scrolling correctly', () => {
  getItemByIndex(12).should('not.exist')
  getItemByIndex(11).should('not.be.visible')
  getItemByIndex(10).should('be.visible')
  getItemByIndex(0).should('be.visible')
  checkRenderedItemsCount(12)

  // scroll one item down
  scrollContainer({ y: 55 })

  getItemByIndex(13).should('not.exist')
  getItemByIndex(12).should('not.be.visible')
  getItemByIndex(11).should('be.visible')
  getItemByIndex(0).should('not.be.visible')
  checkRenderedItemsCount(13)

  // scroll some items down
  scrollContainer({ y: 151 })

  getItemByIndex(15).should('not.exist')
  getItemByIndex(14).should('not.be.visible')
  getItemByIndex(13).should('be.visible')
  getItemByIndex(3).should('be.visible')
  getItemByIndex(2).should('not.be.visible')
  getItemByIndex(0).should('not.exist')
  checkRenderedItemsCount(13)

  // scroll to the down
  scrollContainer({ y: 490 })

  getItemByIndex(19).should('be.visible')
  getItemByIndex(9).should('be.visible')
  getItemByIndex(8).should('not.be.visible')
  getItemByIndex(7).should('not.exist')
  checkRenderedItemsCount(12)
})

it('handles container resizing', () => {
  // expand container
  setContainerSize(810)
  checkContainerSize({
    height: 810,
    scrollHeight: 1000 // 50px * 20
  })

  getItemByIndex(18).should('not.exist')
  getItemByIndex(17).should('not.be.visible')
  getItemByIndex(16).should('be.visible')
  getItemByIndex(0).should('be.visible')
  checkRenderedItemsCount(18)

  // shrink container
  setContainerSize(210)
  checkContainerSize({
    height: 210,
    scrollHeight: 1000 // 50px * 20
  })

  getItemByIndex(6).should('not.exist')
  getItemByIndex(5).should('not.be.visible')
  getItemByIndex(4).should('be.visible')
  getItemByIndex(0).should('be.visible')
  checkRenderedItemsCount(6)

  // scroll to the down
  scrollContainer({ y: 790 })
  getItemByIndex(19).should('be.visible')
  getItemByIndex(15).should('be.visible')
  getItemByIndex(14).should('not.be.visible')
  getItemByIndex(13).should('not.exist')
  checkRenderedItemsCount(6)

  // double size
  setContainerSize(420)
  checkContainerSize({
    height: 420,
    scrollHeight: 1000 // 50px * 20
  })

  getItemByIndex(19).should('be.visible')
  getItemByIndex(11).should('be.visible')
  getItemByIndex(10).should('not.be.visible')
  getItemByIndex(9).should('not.exist')
  checkRenderedItemsCount(10)
})

it('handles item resizing', () => {
  // expand items
  setItemSize(90)
  checkContainerSize({
    height: 510,
    scrollHeight: 1800 // 90px * 20
  })

  getItemByIndex(7).should('not.exist')
  getItemByIndex(6).should('not.be.visible')
  getItemByIndex(5).should('be.visible')
  getItemByIndex(0).should('be.visible')
  checkRenderedItemsCount(7)

  // shrink items
  setItemSize(30)
  checkContainerSize({
    height: 510,
    scrollHeight: 600 // 30px * 20
  })

  getItemByIndex(18).should('not.exist')
  getItemByIndex(17).should('be.visible') // visible because in the 510 border
  getItemByIndex(0).should('be.visible')
  checkRenderedItemsCount(18)

  // scroll to the down
  scrollContainer({ y: 90 })
  getItemByIndex(19).should('be.visible')
  getItemByIndex(3).should('be.visible')
  getItemByIndex(2).should('be.visible')
  getItemByIndex(1).should('not.exist')
  checkRenderedItemsCount(18)

  // double size
  setItemSize(60)
  checkContainerSize({
    height: 510,
    scrollHeight: 1200 // 60px * 20
  })

  getItemByIndex(11).should('not.exist')
  getItemByIndex(10).should('be.visible')
  getItemByIndex(9).should('be.visible')
  getItemByIndex(1).should('be.visible')
  getItemByIndex(0).should('not.be.visible')
  checkRenderedItemsCount(11)
})

it('handles item count change', () => {
  // decrease item count
  setItemCount(15)
  checkContainerSize({
    height: 510,
    scrollHeight: 750 // 50px * 15
  })

  getItemByIndex(12).should('not.exist')
  getItemByIndex(11).should('not.be.visible')
  getItemByIndex(10).should('be.visible')
  getItemByIndex(0).should('be.visible')
  checkRenderedItemsCount(12)

  // scroll to the down
  scrollContainer({ y: 240 })
  getItemByIndex(14).should('be.visible')
  getItemByIndex(4).should('be.visible')
  getItemByIndex(3).should('not.be.visible')
  getItemByIndex(2).should('not.exist')
  checkRenderedItemsCount(12)

  // scroll up and increase item count
  scrollContainer({ y: 0 })
  setItemCount(1000)
  checkContainerSize({
    height: 510,
    scrollHeight: 50000 // 50px * 1000
  })

  // scroll to the down
  scrollContainer({ y: 49490 })
  getItemByIndex(999).should('be.visible')
  getItemByIndex(989).should('be.visible')
  getItemByIndex(988).should('not.be.visible')
  getItemByIndex(987).should('not.exist')
  checkRenderedItemsCount(12)

  // cause overscroll
  setItemCount(100)
  checkContainerSize({
    height: 510,
    scrollHeight: 5000 // 50px * 100
  })

  getItemByIndex(99).should('be.visible')
  getItemByIndex(89).should('be.visible')
  getItemByIndex(88).should('not.be.visible')
  getItemByIndex(87).should('not.exist')
  checkRenderedItemsCount(12)

  // cause overscroll again
  setItemCount(10)
  checkContainerSize({
    height: 510,
    scrollHeight: 510 // 50px * 10 < 510
  })

  getItemByIndex(9).should('be.visible')
  getItemByIndex(0).should('be.visible')
  checkRenderedItemsCount(10)

  // cause overscroll again
  setItemCount(0)
  checkContainerSize({
    height: 510,
    scrollHeight: 510 // 50px * 0 < 510
  })

  getItemByIndex(0).should('not.exist')
  checkRenderedItemsCount(0)
})

it('handles overscan count change', () => {
  // increase overscan count
  setOverscanCount(3)
  checkContainerSize({
    height: 510,
    scrollHeight: 1000 // 50px * 20
  })

  getItemByIndex(14).should('not.exist')
  getItemByIndex(13).should('not.be.visible')
  getItemByIndex(12).should('not.be.visible')
  getItemByIndex(11).should('not.be.visible')
  getItemByIndex(10).should('be.visible')
  getItemByIndex(0).should('be.visible')
  checkRenderedItemsCount(14)

  // scroll some items down
  scrollContainer({ y: 201 })

  getItemByIndex(18).should('not.exist')
  getItemByIndex(17).should('not.be.visible')
  getItemByIndex(16).should('not.be.visible')
  getItemByIndex(15).should('not.be.visible')
  getItemByIndex(14).should('be.visible')
  getItemByIndex(13).should('be.visible')
  getItemByIndex(4).should('be.visible')
  getItemByIndex(3).should('not.be.visible')
  getItemByIndex(2).should('not.be.visible')
  getItemByIndex(1).should('not.be.visible')
  getItemByIndex(0).should('not.exist')
  checkRenderedItemsCount(17)

  // scroll to the down
  scrollContainer({ y: 490 })

  getItemByIndex(19).should('be.visible')
  getItemByIndex(9).should('be.visible')
  getItemByIndex(8).should('not.be.visible')
  getItemByIndex(7).should('not.be.visible')
  getItemByIndex(6).should('not.be.visible')
  getItemByIndex(5).should('not.exist')
  checkRenderedItemsCount(14)

  // set overscan count to 0
  setOverscanCount(0)
  checkContainerSize({
    height: 510,
    scrollHeight: 1000 // 50px * 20
  })

  getItemByIndex(19).should('be.visible')
  getItemByIndex(9).should('be.visible')
  getItemByIndex(8).should('not.exist')
  checkRenderedItemsCount(11)

  // scroll some items up
  scrollContainer({ y: 201 })

  getItemByIndex(15).should('not.exist')
  getItemByIndex(14).should('be.visible')
  getItemByIndex(13).should('be.visible')
  getItemByIndex(4).should('be.visible')
  getItemByIndex(3).should('not.exist')
  checkRenderedItemsCount(11)

  // scroll up
  scrollContainer({ y: 0 })

  getItemByIndex(11).should('not.exist')
  getItemByIndex(10).should('be.visible')
  getItemByIndex(0).should('be.visible')
  checkRenderedItemsCount(11)
})

it('scrolls to initial position', () => {
  setInitialScrollTo(55)

  getItemByIndex(13).should('not.exist')
  getItemByIndex(12).should('not.be.visible')
  getItemByIndex(11).should('be.visible')
  getItemByIndex(0).should('not.be.visible')
  checkRenderedItemsCount(13)

  // change initial scroll and toggle visibility twise
  setInitialScrollTo(490)

  getItemByIndex(19).should('be.visible')
  getItemByIndex(9).should('be.visible')
  getItemByIndex(8).should('not.be.visible')
  getItemByIndex(7).should('not.exist')
  checkRenderedItemsCount(12)
})

describe('scrolls to initial position by item index', () => {
  it('position: start', () => {
    setInitialScrollToItem(4, 'start')

    getItemByIndex(16).should('not.exist')
    getItemByIndex(15).should('not.be.visible')
    getItemByIndex(14).should('be.visible')
    getItemByIndex(4).should('be.visible')
    getItemByIndex(3).should('be.visible') // visible because in the border
    getItemByIndex(2).should('not.exist')
    checkRenderedItemsCount(13)
  })

  it('position: end', () => {
    setInitialScrollToItem(17, 'end')

    getItemByIndex(19).should('not.exist')
    getItemByIndex(18).should('be.visible')
    getItemByIndex(17).should('be.visible')
    getItemByIndex(7).should('be.visible')
    getItemByIndex(6).should('not.be.visible')
    getItemByIndex(5).should('not.exist')
    checkRenderedItemsCount(13)
  })

  it('position: center', () => {
    setInitialScrollToItem(11, 'center')

    getItemByIndex(18).should('not.exist')
    getItemByIndex(17).should('not.be.visible')
    getItemByIndex(16).should('be.visible')
    getItemByIndex(6).should('be.visible')
    getItemByIndex(5).should('not.be.visible')
    getItemByIndex(4).should('not.exist')
    checkRenderedItemsCount(13)
  })
})
