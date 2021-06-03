import {
  getItemByIndex,
  checkRenderedItemsCount,
  checkContainerSize,
  scrollContainer
} from '../support/tools'

beforeEach(() => {
  cy.visit('/dynamic-size-list')

  checkContainerSize({
    height: 510,
    scrollHeight: 1331 // [0, 20)
  })
})

it('handles scrolling correctly', () => {
  getItemByIndex(0).should('be.visible')
  getItemByIndex(7).should('be.visible')
  getItemByIndex(8).should('not.be.visible')
  getItemByIndex(9).should('not.exist')
  checkRenderedItemsCount(9)

  // scroll one item down
  scrollContainer({ y: 100 })

  getItemByIndex(0).should('not.be.visible')
  getItemByIndex(8).should('be.visible')
  getItemByIndex(9).should('not.be.visible')
  getItemByIndex(10).should('not.exist')
  checkRenderedItemsCount(10)

  // scroll some items down
  scrollContainer({ y: 350 })

  getItemByIndex(3).should('not.exist')
  getItemByIndex(4).should('not.be.visible')
  getItemByIndex(5).should('be.visible')
  getItemByIndex(12).should('be.visible')
  getItemByIndex(13).should('not.be.visible')
  getItemByIndex(14).should('not.exist')
  checkRenderedItemsCount(10)

  // scroll to the down
  scrollContainer({ y: 821 }) // 1331 - 510

  getItemByIndex(10).should('not.exist')
  getItemByIndex(11).should('not.be.visible')
  getItemByIndex(12).should('be.visible')
  getItemByIndex(19).should('be.visible')
  checkRenderedItemsCount(9)
})
