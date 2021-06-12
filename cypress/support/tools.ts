const visibilityOffAndOn = (): void => {
  cy.findByTestId('container').should('be.visible')
  cy.findByTestId('visibility-checkbox').click().click()
  cy.findByTestId('container').should('be.visible')
}

export const setContainerSize = (height: number): void => {
  cy.findByTestId('container-size-input').fill(height.toString())
}

export const setItemSize = (height: number): void => {
  cy.findByTestId('item-size-input').fill(height.toString())
}

export const doubleItemSize = (): void => {
  cy.findByTestId('item-size-double').click()
}

export const halfItemSize = (): void => {
  cy.findByTestId('item-size-half').click()
}

export const setItemCount = (count: number): void => {
  cy.findByTestId('item-count-input').fill(count.toString())
}

export const setOverscanCount = (count: number): void => {
  cy.findByTestId('overscan-count-input').fill(count.toString())
}

export const setInitialScrollTo = (px: number): void => {
  cy.findByTestId('initial-scroll-px-input').fill(px.toString())
  visibilityOffAndOn()
}

export const setInitialScrollToItem = (
  index: number,
  position: string
): void => {
  cy.findByTestId('initial-scroll-index-input').fill(index.toString())
  cy.findByTestId('initial-scroll-position-select').select(position)
  visibilityOffAndOn()
}

export const setDynamicScrollTo = (px: number): void => {
  cy.findByTestId('scrolling').should('not.be.checked')
  cy.findByTestId('dynamic-scroll-px-input').fill(px.toString())
  cy.findByTestId('scrolling').should('be.checked')
  cy.findByTestId('scrolling').should('not.be.checked')
}

export const setDynamicScrollToItem = (
  index: number,
  position: string
): void => {
  cy.findByTestId('scrolling').should('not.be.checked')
  cy.findByTestId('dynamic-scroll-index-input').fill(index.toString())
  cy.findByTestId('dynamic-scroll-position-select').select(position)
  cy.findByTestId('scrolling').should('not.be.checked')
}

export const getItemByIndex = (
  index: number
): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.findByText(`#${index}`)
}

export const checkRenderedItemsCount = (count: number): void => {
  cy.findAllByTestId('item').should('have.length', count)
}

export const checkContainerSize = ({
  height,
  scrollHeight
}: {
  height: number
  scrollHeight: number
}): void => {
  cy.findByTestId('scrolling').should('not.be.checked')
  cy.findByTestId('container').as('container').should('be.visible')
  cy.get('@container').getClientHeight().should('eq', height)
  cy.get('@container').getScrollHeight().should('eq', scrollHeight)
}

export const scrollContainer = ({
  x = 0,
  y = 0
}: {
  x?: number
  y?: number
}): void => {
  cy.findByTestId('container').scrollTo(x, y, { duration: 30 })
}
