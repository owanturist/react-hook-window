import {
  setContainerSize,
  doubleItemSize,
  halfItemSize,
  setItemCount,
  setOverscanCount,
  getItemByIndex,
  checkRenderedItemsCount,
  checkContainerSize,
  scrollContainer
} from '../support/tools'

beforeEach(() => {
  cy.visit('/dynamic-size-list')

  checkContainerSize({
    height: 510,
    scrollHeight: 1330 // [0, 20)
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
  scrollContainer({ y: 821 }) // 1330 - 510

  getItemByIndex(10).should('not.exist')
  getItemByIndex(11).should('not.be.visible')
  getItemByIndex(12).should('be.visible')
  getItemByIndex(19).should('be.visible')
  checkRenderedItemsCount(9)
})

it('handles container resizing', () => {
  // expand container
  setContainerSize(800)
  checkContainerSize({
    height: 800,
    scrollHeight: 1330 // [0, 20)
  })

  getItemByIndex(0).should('be.visible')
  getItemByIndex(11).should('be.visible')
  getItemByIndex(12).should('not.be.visible')
  getItemByIndex(13).should('not.exist')
  checkRenderedItemsCount(13)

  // shrink container
  setContainerSize(250)
  checkContainerSize({
    height: 250,
    scrollHeight: 1330 // [0, 20)
  })

  getItemByIndex(0).should('be.visible')
  getItemByIndex(3).should('be.visible')
  getItemByIndex(4).should('not.be.visible')
  getItemByIndex(5).should('not.exist')
  checkRenderedItemsCount(5)

  // scroll to the down
  scrollContainer({ y: 1081 }) // 1330 - 250
  getItemByIndex(14).should('not.exist')
  getItemByIndex(15).should('not.be.visible')
  getItemByIndex(16).should('be.visible')
  getItemByIndex(19).should('be.visible')
  checkRenderedItemsCount(5)

  // double size
  setContainerSize(500)
  checkContainerSize({
    height: 500,
    scrollHeight: 1330 // [0, 20)
  })

  getItemByIndex(10).should('not.exist')
  getItemByIndex(11).should('not.be.visible')
  getItemByIndex(12).should('be.visible')
  getItemByIndex(19).should('be.visible')
  checkRenderedItemsCount(9)
})

it('handles item resizing', () => {
  // expand items
  doubleItemSize()
  checkContainerSize({
    height: 510,
    scrollHeight: 2660 // 1330 * 2
  })

  getItemByIndex(0).should('be.visible')
  getItemByIndex(3).should('be.visible')
  getItemByIndex(4).should('not.be.visible')
  getItemByIndex(5).should('not.exist')
  checkRenderedItemsCount(5)

  // shrink items
  halfItemSize()
  checkContainerSize({
    height: 510,
    scrollHeight: 1330 // [0, 20)
  })
  halfItemSize()
  checkContainerSize({
    height: 510,
    scrollHeight: 665 // 1330 / 2
  })

  getItemByIndex(0).should('be.visible')
  getItemByIndex(15).should('be.visible')
  getItemByIndex(16).should('not.be.visible')
  getItemByIndex(17).should('not.exist')
  checkRenderedItemsCount(17)

  // scroll to the down
  scrollContainer({ y: 155 }) // 665 - 510
  getItemByIndex(2).should('not.exist')
  getItemByIndex(3).should('not.be.visible')
  getItemByIndex(4).should('be.visible')
  getItemByIndex(19).should('be.visible')
  checkRenderedItemsCount(17)

  // double size
  doubleItemSize()
  checkContainerSize({
    height: 510,
    scrollHeight: 1330 // [0, 20)
  })

  getItemByIndex(0).should('not.exist')
  getItemByIndex(1).should('not.be.visible')
  getItemByIndex(2).should('be.visible')
  getItemByIndex(9).should('be.visible')
  getItemByIndex(10).should('not.be.visible')
  getItemByIndex(11).should('not.exist')
  checkRenderedItemsCount(10)
})

it('handles item count change', () => {
  // decrease item count
  setItemCount(10)
  checkContainerSize({
    height: 510,
    scrollHeight: 684 // [0, 10)
  })

  getItemByIndex(0).should('be.visible')
  getItemByIndex(7).should('be.visible')
  getItemByIndex(8).should('not.be.visible')
  getItemByIndex(9).should('not.exist')
  checkRenderedItemsCount(9)

  // scroll to the down
  scrollContainer({ y: 174 }) // 684 - 510
  getItemByIndex(0).should('not.exist')
  getItemByIndex(1).should('not.be.visible')
  getItemByIndex(2).should('be.visible')
  getItemByIndex(9).should('be.visible')
  checkRenderedItemsCount(9)

  // scroll up and increase item count
  scrollContainer({ y: 0 })
  setItemCount(100)
  checkContainerSize({
    height: 510,
    scrollHeight: 6684 // [0, 100)
  })

  // scroll to the down
  scrollContainer({ y: 6174 }) // 6684 - 510
  getItemByIndex(89).should('not.exist')
  getItemByIndex(90).should('not.be.visible')
  getItemByIndex(91).should('be.visible')
  getItemByIndex(99).should('be.visible')
  checkRenderedItemsCount(10)

  // cause overscroll
  setItemCount(50)
  checkContainerSize({
    height: 510,
    scrollHeight: 3287 // [0, 50]
  })

  getItemByIndex(38).should('not.exist')
  getItemByIndex(39).should('not.be.visible')
  getItemByIndex(40).should('be.visible')
  getItemByIndex(49).should('be.visible')
  checkRenderedItemsCount(11)

  // cause overscroll again
  setItemCount(30)
  checkContainerSize({
    height: 510,
    scrollHeight: 1978 // [0, 30)
  })

  getItemByIndex(20).should('not.exist')
  getItemByIndex(21).should('not.be.visible')
  getItemByIndex(22).should('be.visible')
  getItemByIndex(29).should('be.visible')
  checkRenderedItemsCount(9)

  // cause overscroll again
  setItemCount(0)
  checkContainerSize({
    height: 510,
    scrollHeight: 510 // [0, 0) < 510
  })

  getItemByIndex(0).should('not.exist')
  checkRenderedItemsCount(0)
})

it('handles overscan count change', () => {
  // increase overscan count
  setOverscanCount(3)
  checkContainerSize({
    height: 510,
    scrollHeight: 1330 // [0, 20)
  })

  getItemByIndex(0).should('be.visible')
  getItemByIndex(7).should('be.visible')
  getItemByIndex(8).should('not.be.visible')
  getItemByIndex(9).should('not.be.visible')
  getItemByIndex(10).should('not.be.visible')
  getItemByIndex(11).should('not.exist')
  checkRenderedItemsCount(11)

  // scroll some items down
  scrollContainer({ y: 297 }) // [0, 4)

  getItemByIndex(0).should('not.exist')
  getItemByIndex(1).should('not.be.visible')
  getItemByIndex(2).should('not.be.visible')
  getItemByIndex(3).should('not.be.visible')
  getItemByIndex(4).should('be.visible')
  getItemByIndex(11).should('be.visible')
  getItemByIndex(12).should('not.be.visible')
  getItemByIndex(13).should('not.be.visible')
  getItemByIndex(14).should('not.be.visible')
  getItemByIndex(15).should('not.exist')
  checkRenderedItemsCount(14)

  // scroll to the down
  scrollContainer({ y: 820 }) // 1330 - 510

  getItemByIndex(8).should('not.exist')
  getItemByIndex(9).should('not.be.visible')
  getItemByIndex(10).should('not.be.visible')
  getItemByIndex(11).should('not.be.visible')
  getItemByIndex(12).should('be.visible')
  getItemByIndex(19).should('be.visible')
  checkRenderedItemsCount(11)

  // set overscan count to 0
  setOverscanCount(0)
  checkContainerSize({
    height: 510,
    scrollHeight: 1330 // [0, 20)
  })

  getItemByIndex(11).should('not.exist')
  getItemByIndex(12).should('be.visible')
  getItemByIndex(19).should('be.visible')
  checkRenderedItemsCount(8)

  // scroll some items up
  scrollContainer({ y: 297 }) // [0, 4)

  getItemByIndex(3).should('not.exist')
  getItemByIndex(4).should('be.visible')
  getItemByIndex(11).should('be.visible')
  getItemByIndex(12).should('not.exist')
  checkRenderedItemsCount(8)

  // scroll up
  scrollContainer({ y: 0 })

  getItemByIndex(0).should('be.visible')
  getItemByIndex(7).should('be.visible')
  getItemByIndex(8).should('not.exist')
  checkRenderedItemsCount(8)
})
