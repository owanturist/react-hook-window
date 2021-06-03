import {
  setContainerSize,
  setItemSize,
  setItemCount,
  setOverscanCount,
  setInitialScrollTo,
  setInitialScrollToItem,
  setDynamicScrollTo,
  setDynamicScrollToItem,
  getItemByIndex,
  checkRenderedItemsCount,
  checkContainerSize,
  scrollContainer
} from '../support/tools'

beforeEach(() => {
  cy.visit('/fixed-size-list')

  checkContainerSize({
    height: 510,
    scrollHeight: 1000 // 50px * 20
  })
})

it('handles scrolling correctly', () => {
  getItemByIndex(0).should('be.visible')
  getItemByIndex(10).should('be.visible')
  getItemByIndex(11).should('not.be.visible')
  getItemByIndex(12).should('not.exist')
  checkRenderedItemsCount(12)

  // scroll one item down
  scrollContainer({ y: 55 })

  getItemByIndex(0).should('not.be.visible')
  getItemByIndex(11).should('be.visible')
  getItemByIndex(12).should('not.be.visible')
  getItemByIndex(13).should('not.exist')
  checkRenderedItemsCount(13)

  // scroll some items down
  scrollContainer({ y: 151 })

  getItemByIndex(0).should('not.exist')
  getItemByIndex(2).should('not.be.visible')
  getItemByIndex(3).should('be.visible')
  getItemByIndex(13).should('be.visible')
  getItemByIndex(14).should('not.be.visible')
  getItemByIndex(15).should('not.exist')
  checkRenderedItemsCount(13)

  // scroll to the down
  scrollContainer({ y: 490 })

  getItemByIndex(7).should('not.exist')
  getItemByIndex(8).should('not.be.visible')
  getItemByIndex(9).should('be.visible')
  getItemByIndex(19).should('be.visible')
  checkRenderedItemsCount(12)
})

it('handles container resizing', () => {
  // expand container
  setContainerSize(810)
  checkContainerSize({
    height: 810,
    scrollHeight: 1000 // 50px * 20
  })

  getItemByIndex(0).should('be.visible')
  getItemByIndex(16).should('be.visible')
  getItemByIndex(17).should('not.be.visible')
  getItemByIndex(18).should('not.exist')
  checkRenderedItemsCount(18)

  // shrink container
  setContainerSize(210)
  checkContainerSize({
    height: 210,
    scrollHeight: 1000 // 50px * 20
  })

  getItemByIndex(0).should('be.visible')
  getItemByIndex(4).should('be.visible')
  getItemByIndex(5).should('not.be.visible')
  getItemByIndex(6).should('not.exist')
  checkRenderedItemsCount(6)

  // scroll to the down
  scrollContainer({ y: 790 })
  getItemByIndex(13).should('not.exist')
  getItemByIndex(14).should('not.be.visible')
  getItemByIndex(15).should('be.visible')
  getItemByIndex(19).should('be.visible')
  checkRenderedItemsCount(6)

  // double size
  setContainerSize(420)
  checkContainerSize({
    height: 420,
    scrollHeight: 1000 // 50px * 20
  })

  getItemByIndex(9).should('not.exist')
  getItemByIndex(10).should('not.be.visible')
  getItemByIndex(11).should('be.visible')
  getItemByIndex(19).should('be.visible')
  checkRenderedItemsCount(10)
})

it('handles item resizing', () => {
  // expand items
  setItemSize(90)
  checkContainerSize({
    height: 510,
    scrollHeight: 1800 // 90px * 20
  })

  getItemByIndex(0).should('be.visible')
  getItemByIndex(5).should('be.visible')
  getItemByIndex(6).should('not.be.visible')
  getItemByIndex(7).should('not.exist')
  checkRenderedItemsCount(7)

  // shrink items
  setItemSize(30)
  checkContainerSize({
    height: 510,
    scrollHeight: 600 // 30px * 20
  })

  getItemByIndex(0).should('be.visible')
  getItemByIndex(17).should('be.visible') // visible because in the 510 border
  getItemByIndex(18).should('not.exist')
  checkRenderedItemsCount(18)

  // scroll to the down
  scrollContainer({ y: 90 })
  getItemByIndex(1).should('not.exist')
  getItemByIndex(2).should('be.visible')
  getItemByIndex(3).should('be.visible')
  getItemByIndex(19).should('be.visible')
  checkRenderedItemsCount(18)

  // double size
  setItemSize(60)
  checkContainerSize({
    height: 510,
    scrollHeight: 1200 // 60px * 20
  })

  getItemByIndex(0).should('not.be.visible')
  getItemByIndex(1).should('be.visible')
  getItemByIndex(9).should('be.visible')
  getItemByIndex(10).should('be.visible')
  getItemByIndex(11).should('not.exist')
  checkRenderedItemsCount(11)
})

it('handles item count change', () => {
  // decrease item count
  setItemCount(15)
  checkContainerSize({
    height: 510,
    scrollHeight: 750 // 50px * 15
  })

  getItemByIndex(0).should('be.visible')
  getItemByIndex(10).should('be.visible')
  getItemByIndex(11).should('not.be.visible')
  getItemByIndex(12).should('not.exist')
  checkRenderedItemsCount(12)

  // scroll to the down
  scrollContainer({ y: 240 })
  getItemByIndex(2).should('not.exist')
  getItemByIndex(3).should('not.be.visible')
  getItemByIndex(4).should('be.visible')
  getItemByIndex(14).should('be.visible')
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
  getItemByIndex(987).should('not.exist')
  getItemByIndex(988).should('not.be.visible')
  getItemByIndex(989).should('be.visible')
  getItemByIndex(999).should('be.visible')
  checkRenderedItemsCount(12)

  // cause overscroll
  setItemCount(100)
  checkContainerSize({
    height: 510,
    scrollHeight: 5000 // 50px * 100
  })

  getItemByIndex(87).should('not.exist')
  getItemByIndex(88).should('not.be.visible')
  getItemByIndex(89).should('be.visible')
  getItemByIndex(99).should('be.visible')
  checkRenderedItemsCount(12)

  // cause overscroll again
  setItemCount(10)
  checkContainerSize({
    height: 510,
    scrollHeight: 510 // 50px * 10 < 510
  })

  getItemByIndex(0).should('be.visible')
  getItemByIndex(9).should('be.visible')
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

  getItemByIndex(0).should('be.visible')
  getItemByIndex(10).should('be.visible')
  getItemByIndex(11).should('not.be.visible')
  getItemByIndex(12).should('not.be.visible')
  getItemByIndex(13).should('not.be.visible')
  getItemByIndex(14).should('not.exist')
  checkRenderedItemsCount(14)

  // scroll some items down
  scrollContainer({ y: 201 })

  getItemByIndex(0).should('not.exist')
  getItemByIndex(1).should('not.be.visible')
  getItemByIndex(2).should('not.be.visible')
  getItemByIndex(3).should('not.be.visible')
  getItemByIndex(4).should('be.visible')
  getItemByIndex(13).should('be.visible')
  getItemByIndex(14).should('be.visible')
  getItemByIndex(15).should('not.be.visible')
  getItemByIndex(16).should('not.be.visible')
  getItemByIndex(17).should('not.be.visible')
  getItemByIndex(18).should('not.exist')
  checkRenderedItemsCount(17)

  // scroll to the down
  scrollContainer({ y: 490 })

  getItemByIndex(5).should('not.exist')
  getItemByIndex(6).should('not.be.visible')
  getItemByIndex(7).should('not.be.visible')
  getItemByIndex(8).should('not.be.visible')
  getItemByIndex(9).should('be.visible')
  getItemByIndex(19).should('be.visible')
  checkRenderedItemsCount(14)

  // set overscan count to 0
  setOverscanCount(0)
  checkContainerSize({
    height: 510,
    scrollHeight: 1000 // 50px * 20
  })

  getItemByIndex(8).should('not.exist')
  getItemByIndex(9).should('be.visible')
  getItemByIndex(19).should('be.visible')
  checkRenderedItemsCount(11)

  // scroll some items up
  scrollContainer({ y: 201 })

  getItemByIndex(3).should('not.exist')
  getItemByIndex(4).should('be.visible')
  getItemByIndex(13).should('be.visible')
  getItemByIndex(14).should('be.visible')
  getItemByIndex(15).should('not.exist')
  checkRenderedItemsCount(11)

  // scroll up
  scrollContainer({ y: 0 })

  getItemByIndex(0).should('be.visible')
  getItemByIndex(10).should('be.visible')
  getItemByIndex(11).should('not.exist')
  checkRenderedItemsCount(11)
})

describe('initial position', () => {
  it('scrolls to px', () => {
    setInitialScrollTo(55)

    getItemByIndex(0).should('not.be.visible')
    getItemByIndex(11).should('be.visible')
    getItemByIndex(12).should('not.be.visible')
    getItemByIndex(13).should('not.exist')
    checkRenderedItemsCount(13)

    setInitialScrollTo(490)

    getItemByIndex(7).should('not.exist')
    getItemByIndex(8).should('not.be.visible')
    getItemByIndex(9).should('be.visible')
    getItemByIndex(19).should('be.visible')
    checkRenderedItemsCount(12)
  })

  describe('scrolls to item', () => {
    it('position: start', () => {
      setInitialScrollToItem(4, 'start')

      getItemByIndex(2).should('not.exist')
      getItemByIndex(3).should('be.visible') // visible because in the border
      getItemByIndex(4).should('be.visible')
      getItemByIndex(14).should('be.visible')
      getItemByIndex(15).should('not.be.visible')
      getItemByIndex(16).should('not.exist')
      checkRenderedItemsCount(13)
    })

    it('position: end', () => {
      setInitialScrollToItem(17, 'end')

      getItemByIndex(5).should('not.exist')
      getItemByIndex(6).should('not.be.visible')
      getItemByIndex(7).should('be.visible')
      getItemByIndex(17).should('be.visible')
      getItemByIndex(18).should('be.visible')
      getItemByIndex(19).should('not.exist')
      checkRenderedItemsCount(13)
    })

    it('position: center', () => {
      setInitialScrollToItem(11, 'center')

      getItemByIndex(4).should('not.exist')
      getItemByIndex(5).should('not.be.visible')
      getItemByIndex(6).should('be.visible')
      getItemByIndex(16).should('be.visible')
      getItemByIndex(17).should('not.be.visible')
      getItemByIndex(18).should('not.exist')
      checkRenderedItemsCount(13)
    })
  })
})

describe('dynamic position', () => {
  it('scrolls to px', () => {
    setDynamicScrollTo(55)

    getItemByIndex(0).should('not.be.visible')
    getItemByIndex(11).should('be.visible')
    getItemByIndex(12).should('not.be.visible')
    getItemByIndex(13).should('not.exist')
    checkRenderedItemsCount(13)

    setDynamicScrollTo(490)

    getItemByIndex(7).should('not.exist')
    getItemByIndex(8).should('not.be.visible')
    getItemByIndex(9).should('be.visible')
    getItemByIndex(19).should('be.visible')
    checkRenderedItemsCount(12)
  })

  describe('scrolls to item', () => {
    it('position: start', () => {
      setDynamicScrollToItem(4, 'start')

      getItemByIndex(2).should('not.exist')
      getItemByIndex(3).should('be.visible') // visible because in the border
      getItemByIndex(4).should('be.visible')
      getItemByIndex(14).should('be.visible')
      getItemByIndex(15).should('not.be.visible')
      getItemByIndex(16).should('not.exist')
      checkRenderedItemsCount(13)
    })

    it('position: end', () => {
      setDynamicScrollToItem(17, 'end')

      getItemByIndex(5).should('not.exist')
      getItemByIndex(6).should('not.be.visible')
      getItemByIndex(7).should('be.visible')
      getItemByIndex(17).should('be.visible')
      getItemByIndex(18).should('be.visible')
      getItemByIndex(19).should('not.exist')
      checkRenderedItemsCount(13)
    })

    it('position: center', () => {
      setDynamicScrollToItem(11, 'center')

      getItemByIndex(4).should('not.exist')
      getItemByIndex(5).should('not.be.visible')
      getItemByIndex(6).should('be.visible')
      getItemByIndex(16).should('be.visible')
      getItemByIndex(17).should('not.be.visible')
      getItemByIndex(18).should('not.exist')
      checkRenderedItemsCount(13)
    })

    it('position: auto', () => {
      // not scroll, already visible
      setDynamicScrollToItem(4, 'auto')

      getItemByIndex(0).should('be.visible')
      getItemByIndex(10).should('be.visible')
      getItemByIndex(11).should('not.be.visible')
      getItemByIndex(12).should('not.exist')
      checkRenderedItemsCount(12)

      // move down a little bit untill almost fully visible item appears
      setDynamicScrollToItem(10, 'auto')

      getItemByIndex(0).should('be.visible')
      getItemByIndex(10).should('be.visible')
      getItemByIndex(11).should('be.visible')
      getItemByIndex(12).should('not.exist')
      checkRenderedItemsCount(12)

      // move down far
      setDynamicScrollToItem(17, 'auto')

      getItemByIndex(5).should('not.exist')
      getItemByIndex(6).should('not.be.visible')
      getItemByIndex(7).should('be.visible')
      getItemByIndex(17).should('be.visible')
      getItemByIndex(18).should('be.visible')
      getItemByIndex(19).should('not.exist')
      checkRenderedItemsCount(13)

      // no scroll, already visible
      setDynamicScrollToItem(13, 'auto')

      getItemByIndex(5).should('not.exist')
      getItemByIndex(6).should('not.be.visible')
      getItemByIndex(7).should('be.visible')
      getItemByIndex(17).should('be.visible')
      getItemByIndex(18).should('be.visible')
      getItemByIndex(19).should('not.exist')
      checkRenderedItemsCount(13)

      // move back up
      setDynamicScrollToItem(4, 'auto')

      getItemByIndex(2).should('not.exist')
      getItemByIndex(3).should('be.visible') // visible because in the border
      getItemByIndex(4).should('be.visible')
      getItemByIndex(14).should('be.visible')
      getItemByIndex(15).should('not.be.visible')
      getItemByIndex(16).should('not.exist')
      checkRenderedItemsCount(13)
    })

    it('position: smart', () => {
      setItemCount(100)
      checkContainerSize({
        height: 510,
        scrollHeight: 5000 // 50px * 100
      })

      // not scroll, already visible
      setDynamicScrollToItem(4, 'smart')

      getItemByIndex(0).should('be.visible')
      getItemByIndex(10).should('be.visible')
      getItemByIndex(11).should('not.be.visible')
      getItemByIndex(12).should('not.exist')
      checkRenderedItemsCount(12)

      // move down a little bit untill almost fully visible item appears
      setDynamicScrollToItem(10, 'smart')

      getItemByIndex(0).should('be.visible')
      getItemByIndex(10).should('be.visible')
      getItemByIndex(11).should('be.visible')
      getItemByIndex(12).should('not.exist')
      checkRenderedItemsCount(12)

      // move down to item closer than 1 viewport (20 - 10) * 50px < 510px
      setDynamicScrollToItem(20, 'smart')

      getItemByIndex(8).should('not.exist')
      getItemByIndex(9).should('not.be.visible')
      getItemByIndex(10).should('be.visible')
      getItemByIndex(20).should('be.visible')
      getItemByIndex(21).should('be.visible')
      getItemByIndex(22).should('not.exist')
      checkRenderedItemsCount(13)

      // move down to item further than 1 viewport (31 - 20) * 50px > 510px
      setDynamicScrollToItem(31, 'smart')

      getItemByIndex(24).should('not.exist')
      getItemByIndex(25).should('not.be.visible')
      getItemByIndex(26).should('be.visible')
      getItemByIndex(36).should('be.visible')
      getItemByIndex(37).should('not.be.visible')
      getItemByIndex(38).should('not.exist')
      checkRenderedItemsCount(13)

      // move up to item closer than 1 viewport (31 - 21) * 50px < 510px
      setDynamicScrollToItem(21, 'smart')

      getItemByIndex(19).should('not.exist')
      getItemByIndex(20).should('be.visible') // visible because in the border
      getItemByIndex(21).should('be.visible')
      getItemByIndex(31).should('be.visible')
      getItemByIndex(32).should('not.be.visible')
      getItemByIndex(33).should('not.exist')
      checkRenderedItemsCount(13)

      // move up to item further than 1 viewport (21 - 10) * 50px > 510px
      setDynamicScrollToItem(10, 'smart')

      getItemByIndex(3).should('not.exist')
      getItemByIndex(4).should('not.be.visible')
      getItemByIndex(5).should('be.visible')
      getItemByIndex(15).should('be.visible')
      getItemByIndex(16).should('not.be.visible')
      getItemByIndex(17).should('not.exist')
      checkRenderedItemsCount(13)
    })
  })
})
