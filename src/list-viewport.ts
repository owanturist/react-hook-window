import { ListBoundaries } from './list-boundaries'

export interface ListViewport {
  getSpaceBefore(index: number): number
  getSpaceAfter(index: number): number
  getItemSize(index: number): number
  calcBoundaries(containerSize: number, scrollStart: number): ListBoundaries
}

class FixedSizeListViewport implements ListViewport {
  public constructor(
    private readonly itemSize: number,
    private readonly itemCount: number
  ) {}

  public getSpaceBefore(index: number): number {
    return this.itemSize * index
  }

  public getSpaceAfter(index: number): number {
    const lastIndex = this.itemCount - 1

    if (index >= lastIndex) {
      return 0
    }

    return this.getSpaceBefore(lastIndex) - this.getSpaceBefore(index)
  }

  public getItemSize(): number {
    return this.itemSize
  }

  public calcBoundaries(
    containerSize: number,
    scrollStart: number
  ): ListBoundaries {
    const start = Math.floor(scrollStart / this.itemSize)
    const stop = Math.ceil((scrollStart + containerSize) / this.itemSize)

    return { start, stop }
  }
}

class VariableSizeListViewport implements ListViewport {
  public constructor(
    private readonly itemSizeByIndex: (index: number) => number,
    private readonly itemsStartPositions: ReadonlyArray<number>
  ) {}

  public getSpaceBefore(index: number): number {
    return this.itemsStartPositions[index]
  }

  public getSpaceAfter(index: number): number {
    const lastIndex = this.itemsStartPositions.length - 1

    if (index >= lastIndex) {
      return 0
    }

    return this.getSpaceBefore(lastIndex) - this.getSpaceBefore(index)
  }

  public getItemSize(index: number): number {
    return this.itemSizeByIndex(index)
  }

  public calcBoundaries(
    containerSize: number,
    scrollStart: number
  ): ListBoundaries {
    const start = this.findBoundariesStart(scrollStart)
    const stop = this.findBoundariesStop(scrollStart + containerSize)

    return { start, stop }
  }

  // #TODO use bindary search
  private findBoundariesStart(scrollStart: number): number {
    for (let index = 0; index < this.itemsStartPositions.length; index++) {
      if (this.itemsStartPositions[index] >= scrollStart) {
        return Math.max(0, index - 1)
      }
    }

    return this.itemsStartPositions.length
  }

  // #TODO use bindary search
  private findBoundariesStop(scrollStart: number): number {
    for (let index = 0; index < this.itemsStartPositions.length; index++) {
      if (this.itemsStartPositions[index] >= scrollStart) {
        return index
      }
    }

    return this.itemsStartPositions.length
  }
}

export const initListViewport = (
  itemSize: number | ((index: number) => number),
  itemCount: number
): ListViewport => {
  if (typeof itemSize === 'number') {
    return new FixedSizeListViewport(itemSize, itemCount)
  }

  if (itemCount <= 0) {
    return new FixedSizeListViewport(0, 0)
  }

  const itemsStartPositions = new Array<number>(itemCount)

  itemsStartPositions[0] = 0

  for (let index = 1; index < itemCount; index++) {
    const prev = itemsStartPositions[index - 1]

    itemsStartPositions[index] = prev + itemSize(index - 1)
  }

  return new VariableSizeListViewport(itemSize, itemsStartPositions)
}
