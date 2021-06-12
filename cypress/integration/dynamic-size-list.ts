import {
  LIST_LAYOUTS,
  setContainerSize,
  doubleItemSize,
  halfItemSize,
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

for (const layout of LIST_LAYOUTS) {
  describe(`Dynamic size ${layout} list`, () => {
    beforeEach(() => {
      if (layout === 'horizontal') {
        cy.visit('/dynamic-size-list/horizontal')
      } else if (layout === 'horizontal-rtl') {
        cy.visit('/dynamic-size-list/horizontal-rtl')
      } else {
        cy.visit('/dynamic-size-list')
      }

      checkContainerSize({
        layout,
        size: 510,
        scrollSize: 1330 // [0, 20)
      })
    })

    it('handles scrolling correctly', () => {
      getItemByIndex(0).should('be.visible')
      getItemByIndex(7).should('be.visible')
      getItemByIndex(8).should('not.be.visible')
      getItemByIndex(9).should('not.exist')
      checkRenderedItemsCount(9)

      // scroll one item down
      scrollContainer({ layout, scroll: 100 })

      getItemByIndex(0).should('not.be.visible')
      getItemByIndex(8).should('be.visible')
      getItemByIndex(9).should('not.be.visible')
      getItemByIndex(10).should('not.exist')
      checkRenderedItemsCount(10)

      // scroll some items down
      scrollContainer({ layout, scroll: 350 })

      getItemByIndex(3).should('not.exist')
      getItemByIndex(4).should('not.be.visible')
      getItemByIndex(5).should('be.visible')
      getItemByIndex(12).should('be.visible')
      getItemByIndex(13).should('not.be.visible')
      getItemByIndex(14).should('not.exist')
      checkRenderedItemsCount(10)

      // scroll to the down
      scrollContainer({ layout, scroll: 820 }) // 1330 - 510

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
        layout,
        size: 800,
        scrollSize: 1330 // [0, 20)
      })

      getItemByIndex(0).should('be.visible')
      getItemByIndex(11).should('be.visible')
      getItemByIndex(12).should('not.be.visible')
      getItemByIndex(13).should('not.exist')
      checkRenderedItemsCount(13)

      // shrink container
      setContainerSize(250)
      checkContainerSize({
        layout,
        size: 250,
        scrollSize: 1330 // [0, 20)
      })

      getItemByIndex(0).should('be.visible')
      getItemByIndex(3).should('be.visible')
      getItemByIndex(4).should('not.be.visible')
      getItemByIndex(5).should('not.exist')
      checkRenderedItemsCount(5)

      // scroll to the down
      scrollContainer({ layout, scroll: 1081 }) // 1330 - 250
      getItemByIndex(14).should('not.exist')
      getItemByIndex(15).should('not.be.visible')
      getItemByIndex(16).should('be.visible')
      getItemByIndex(19).should('be.visible')
      checkRenderedItemsCount(5)

      // double size
      setContainerSize(500)
      checkContainerSize({
        layout,
        size: 500,
        scrollSize: 1330 // [0, 20)
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
        layout,
        size: 510,
        scrollSize: 2660 // 1330 * 2
      })

      getItemByIndex(0).should('be.visible')
      getItemByIndex(3).should('be.visible')
      getItemByIndex(4).should('not.be.visible')
      getItemByIndex(5).should('not.exist')
      checkRenderedItemsCount(5)

      // shrink items
      halfItemSize()
      checkContainerSize({
        layout,
        size: 510,
        scrollSize: 1330 // [0, 20)
      })
      halfItemSize()
      checkContainerSize({
        layout,
        size: 510,
        scrollSize: 665 // 1330 / 2
      })

      getItemByIndex(0).should('be.visible')
      getItemByIndex(15).should('be.visible')
      getItemByIndex(16).should('not.be.visible')
      getItemByIndex(17).should('not.exist')
      checkRenderedItemsCount(17)

      // scroll to the down
      scrollContainer({ layout, scroll: 155 }) // 665 - 510
      getItemByIndex(2).should('not.exist')
      getItemByIndex(3).should('not.be.visible')
      getItemByIndex(4).should('be.visible')
      getItemByIndex(19).should('be.visible')
      checkRenderedItemsCount(17)

      // double size
      doubleItemSize()
      checkContainerSize({
        layout,
        size: 510,
        scrollSize: 1330 // [0, 20)
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
        layout,
        size: 510,
        scrollSize: 684 // [0, 10)
      })

      getItemByIndex(0).should('be.visible')
      getItemByIndex(7).should('be.visible')
      getItemByIndex(8).should('not.be.visible')
      getItemByIndex(9).should('not.exist')
      checkRenderedItemsCount(9)

      // scroll to the down
      scrollContainer({ layout, scroll: 174 }) // 684 - 510
      getItemByIndex(0).should('not.exist')
      getItemByIndex(1).should('not.be.visible')
      getItemByIndex(2).should('be.visible')
      getItemByIndex(9).should('be.visible')
      checkRenderedItemsCount(9)

      // scroll up and increase item count
      scrollContainer({ layout, scroll: 0 })
      setItemCount(100)
      checkContainerSize({
        layout,
        size: 510,
        scrollSize: 6684 // [0, 100)
      })

      // scroll to the down
      scrollContainer({ layout, scroll: 6174 }) // 6684 - 510
      getItemByIndex(89).should('not.exist')
      getItemByIndex(90).should('not.be.visible')
      getItemByIndex(91).should('be.visible')
      getItemByIndex(99).should('be.visible')
      checkRenderedItemsCount(10)

      // cause overscroll
      setItemCount(50)
      checkContainerSize({
        layout,
        size: 510,
        scrollSize: 3287 // [0, 50]
      })

      getItemByIndex(38).should('not.exist')
      getItemByIndex(39).should('not.be.visible')
      getItemByIndex(40).should('be.visible')
      getItemByIndex(49).should('be.visible')
      checkRenderedItemsCount(11)

      // cause overscroll again
      setItemCount(30)
      checkContainerSize({
        layout,
        size: 510,
        scrollSize: 1978 // [0, 30)
      })

      getItemByIndex(20).should('not.exist')
      getItemByIndex(21).should('not.be.visible')
      getItemByIndex(22).should('be.visible')
      getItemByIndex(29).should('be.visible')
      checkRenderedItemsCount(9)

      // cause overscroll again
      setItemCount(0)
      checkContainerSize({
        layout,
        size: 510,
        scrollSize: 510 // [0, 0) < 510
      })

      getItemByIndex(0).should('not.exist')
      checkRenderedItemsCount(0)
    })

    it('handles overscan count change', () => {
      // increase overscan count
      setOverscanCount(3)
      checkContainerSize({
        layout,
        size: 510,
        scrollSize: 1330 // [0, 20)
      })

      getItemByIndex(0).should('be.visible')
      getItemByIndex(7).should('be.visible')
      getItemByIndex(8).should('not.be.visible')
      getItemByIndex(9).should('not.be.visible')
      getItemByIndex(10).should('not.be.visible')
      getItemByIndex(11).should('not.exist')
      checkRenderedItemsCount(11)

      // scroll some items down
      scrollContainer({ layout, scroll: 297 }) // [0, 4)

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
      scrollContainer({ layout, scroll: 820 }) // 1330 - 510

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
        layout,
        size: 510,
        scrollSize: 1330 // [0, 20)
      })

      getItemByIndex(11).should('not.exist')
      getItemByIndex(12).should('be.visible')
      getItemByIndex(19).should('be.visible')
      checkRenderedItemsCount(8)

      // scroll some items up
      scrollContainer({ layout, scroll: 297 }) // [0, 4)

      getItemByIndex(3).should('not.exist')
      getItemByIndex(4).should('be.visible')
      getItemByIndex(11).should('be.visible')
      getItemByIndex(12).should('not.exist')
      checkRenderedItemsCount(8)

      // scroll up
      scrollContainer({ layout, scroll: 0 })

      getItemByIndex(0).should('be.visible')
      getItemByIndex(7).should('be.visible')
      getItemByIndex(8).should('not.exist')
      checkRenderedItemsCount(8)
    })

    describe('initial position', () => {
      it('scrolls to px', () => {
        setInitialScrollTo(387) // [0, 6)

        getItemByIndex(4).should('not.exist')
        getItemByIndex(5).should('not.be.visible')
        getItemByIndex(6).should('be.visible')
        getItemByIndex(13).should('be.visible')
        getItemByIndex(14).should('not.be.visible')
        getItemByIndex(15).should('not.exist')
        checkRenderedItemsCount(10)

        setInitialScrollTo(820) // 1330 - 510

        getItemByIndex(10).should('not.exist')
        getItemByIndex(11).should('not.be.visible')
        getItemByIndex(12).should('be.visible')
        getItemByIndex(19).should('be.visible')
        checkRenderedItemsCount(9)
      })

      describe('scrolls to item', () => {
        it('position: start', () => {
          setInitialScrollToItem(6, 'start')

          getItemByIndex(4).should('not.exist')
          getItemByIndex(5).should('be.visible') // visible because in the border
          getItemByIndex(6).should('be.visible')
          getItemByIndex(13).should('be.visible')
          getItemByIndex(14).should('not.be.visible')
          getItemByIndex(15).should('not.exist')
          checkRenderedItemsCount(10)
        })

        it('position: end', () => {
          setInitialScrollToItem(17, 'end')

          getItemByIndex(8).should('not.exist')
          getItemByIndex(9).should('not.be.visible')
          getItemByIndex(10).should('be.visible')
          getItemByIndex(17).should('be.visible')
          getItemByIndex(18).should('be.visible') // visible because in the border
          getItemByIndex(19).should('not.exist')
          checkRenderedItemsCount(10)
        })

        it('position: center', () => {
          setInitialScrollToItem(13, 'center')

          getItemByIndex(7).should('not.exist')
          getItemByIndex(8).should('not.be.visible')
          getItemByIndex(9).should('be.visible')
          getItemByIndex(17).should('be.visible')
          getItemByIndex(18).should('not.be.visible')
          getItemByIndex(19).should('not.exist')
          checkRenderedItemsCount(11)
        })
      })
    })

    describe('dynamic position', () => {
      it('scrolls to px', () => {
        setDynamicScrollTo(387) // [0, 6)

        getItemByIndex(4).should('not.exist')
        getItemByIndex(5).should('not.be.visible')
        getItemByIndex(6).should('be.visible')
        getItemByIndex(13).should('be.visible')
        getItemByIndex(14).should('not.be.visible')
        getItemByIndex(15).should('not.exist')
        checkRenderedItemsCount(10)

        setDynamicScrollTo(820) // 1330 - 510

        getItemByIndex(10).should('not.exist')
        getItemByIndex(11).should('not.be.visible')
        getItemByIndex(12).should('be.visible')
        getItemByIndex(19).should('be.visible')
        checkRenderedItemsCount(9)
      })

      describe('scrolls to item', () => {
        it('position: start', () => {
          setDynamicScrollToItem(6, 'start')

          getItemByIndex(4).should('not.exist')
          getItemByIndex(5).should('be.visible') // visible because in the border
          getItemByIndex(6).should('be.visible')
          getItemByIndex(13).should('be.visible')
          getItemByIndex(14).should('not.be.visible')
          getItemByIndex(15).should('not.exist')
          checkRenderedItemsCount(10)
        })

        it('position: end', () => {
          setDynamicScrollToItem(17, 'end')

          getItemByIndex(8).should('not.exist')
          getItemByIndex(9).should('not.be.visible')
          getItemByIndex(10).should('be.visible')
          getItemByIndex(17).should('be.visible')
          getItemByIndex(18).should('be.visible') // visible because in the border
          getItemByIndex(19).should('not.exist')
          checkRenderedItemsCount(10)
        })

        it('position: center', () => {
          setDynamicScrollToItem(13, 'center')

          getItemByIndex(7).should('not.exist')
          getItemByIndex(8).should('not.be.visible')
          getItemByIndex(9).should('be.visible')
          getItemByIndex(17).should('be.visible')
          getItemByIndex(18).should('not.be.visible')
          getItemByIndex(19).should('not.exist')
          checkRenderedItemsCount(11)
        })

        it('position: auto', () => {
          // not scroll, already visible
          setDynamicScrollToItem(4, 'auto')

          getItemByIndex(0).should('be.visible')
          getItemByIndex(7).should('be.visible')
          getItemByIndex(8).should('not.be.visible')
          getItemByIndex(9).should('not.exist')
          checkRenderedItemsCount(9)

          // move down a little bit untill almost fully visible item appears
          setDynamicScrollToItem(7, 'auto')

          getItemByIndex(0).should('be.visible')
          getItemByIndex(7).should('be.visible')
          getItemByIndex(8).should('be.visible') // visible because in the border
          getItemByIndex(9).should('not.exist')
          checkRenderedItemsCount(9)

          // move down far
          setDynamicScrollToItem(15, 'auto')

          getItemByIndex(5).should('not.exist')
          getItemByIndex(6).should('not.be.visible')
          getItemByIndex(7).should('be.visible')
          getItemByIndex(15).should('be.visible')
          getItemByIndex(16).should('be.visible') // visible because in the border
          getItemByIndex(17).should('not.exist')
          checkRenderedItemsCount(11)

          // no scroll, already visible
          setDynamicScrollToItem(13, 'auto')

          getItemByIndex(5).should('not.exist')
          getItemByIndex(6).should('not.be.visible')
          getItemByIndex(7).should('be.visible')
          getItemByIndex(15).should('be.visible')
          getItemByIndex(16).should('be.visible') // visible because in the border
          getItemByIndex(17).should('not.exist')
          checkRenderedItemsCount(11)

          // move back up
          setDynamicScrollToItem(4, 'auto')

          getItemByIndex(2).should('not.exist')
          getItemByIndex(3).should('be.visible') // visible because in the border
          getItemByIndex(4).should('be.visible')
          getItemByIndex(11).should('be.visible')
          getItemByIndex(12).should('not.be.visible')
          getItemByIndex(13).should('not.exist')
          checkRenderedItemsCount(10)
        })

        it('position: smart', () => {
          setItemCount(100)
          checkContainerSize({
            layout,
            size: 510,
            scrollSize: 6684 // [0, 100)
          })

          // not scroll, already visible
          setDynamicScrollToItem(4, 'smart')

          getItemByIndex(0).should('be.visible')
          getItemByIndex(7).should('be.visible')
          getItemByIndex(8).should('not.be.visible')
          getItemByIndex(9).should('not.exist')
          checkRenderedItemsCount(9)

          // move down a little bit untill almost fully visible item appears
          setDynamicScrollToItem(7, 'smart')

          getItemByIndex(0).should('be.visible')
          getItemByIndex(7).should('be.visible')
          getItemByIndex(8).should('be.visible') // visible because in the border
          getItemByIndex(9).should('not.exist')
          checkRenderedItemsCount(9)

          // move down to item closer than 1 viewport
          setDynamicScrollToItem(15, 'smart')

          getItemByIndex(5).should('not.exist')
          getItemByIndex(6).should('not.be.visible')
          getItemByIndex(7).should('be.visible')
          getItemByIndex(15).should('be.visible')
          getItemByIndex(16).should('be.visible') // visible because in the border
          getItemByIndex(17).should('not.exist')
          checkRenderedItemsCount(11)

          // move down to item further than 1 viewport
          setDynamicScrollToItem(23, 'smart')

          getItemByIndex(17).should('not.exist')
          getItemByIndex(18).should('not.be.visible')
          getItemByIndex(19).should('be.visible')
          getItemByIndex(27).should('be.visible')
          getItemByIndex(28).should('not.be.visible')
          getItemByIndex(29).should('not.exist')
          checkRenderedItemsCount(11)

          // move up to item closer than 1 viewport
          setDynamicScrollToItem(12, 'smart')

          getItemByIndex(10).should('not.exist')
          getItemByIndex(11).should('be.visible') // visible because in the border
          getItemByIndex(12).should('be.visible')
          getItemByIndex(19).should('be.visible')
          getItemByIndex(20).should('not.be.visible')
          getItemByIndex(21).should('not.exist')
          checkRenderedItemsCount(10)

          // move up to item further than 1 viewport
          setDynamicScrollToItem(4, 'smart')

          getItemByIndex(0).should('not.be.visible')
          getItemByIndex(1).should('be.visible')
          getItemByIndex(8).should('be.visible')
          getItemByIndex(9).should('not.be.visible')
          getItemByIndex(10).should('not.exist')
          checkRenderedItemsCount(10)
        })
      })
    })
  })
}
