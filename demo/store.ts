import { useState, useEffect, useRef } from 'react'

const identity = <T extends unknown>(value: T): T => value

export const shallowEqual = <T>(objA: T, objB: T): boolean => {
  if (Object.is(objA, objB)) {
    return true
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  const keysA = Object.keys(objA)

  if (keysA.length !== Object.keys(objB).length) {
    return false
  }

  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      !Object.is(objA[key as keyof T], objB[key as keyof T])
    ) {
      return false
    }
  }

  return true
}

const strictEqual = <T>(left: T, right: T): boolean => left === right

export type StoreFabric<S> = (
  setState: (
    update: (prevState: S) => S,
    compare?: (prev: S, next: S) => boolean
  ) => void,
  getState: () => S
) => S

class Store<S> {
  private state: S
  private readonly subscribers = new Set<(prev: S, next: S) => void>()

  public constructor(fabric: StoreFabric<S>) {
    this.state = fabric(
      (update, compare = strictEqual) => this.setState(update, compare),
      () => this.getState()
    )
  }

  public getState(): S {
    return this.state
  }

  public setState(
    update: (prevState: S) => S,
    compare: (prev: S, next: S) => boolean
  ): void {
    const nextState = update(this.state)

    if (!compare(this.state, nextState)) {
      for (const subscriber of Array.from(this.subscribers)) {
        subscriber(this.state, nextState)
      }

      this.state = nextState
    }
  }

  public subscribe(listener: (prev: S, next: S) => void): VoidFunction {
    this.subscribers.add(listener)

    return () => {
      this.subscribers.delete(listener)
    }
  }
}

export interface UseStoreHook<S> {
  (): S
  <T>(selector: (state: S) => T): T
  <T>(selector: (state: S) => T, compare: (prev: T, next: T) => boolean): T
}

export const createStore = <S>(fabric: StoreFabric<S>): UseStoreHook<S> => {
  const store = new Store(fabric)

  const useStoreHook: UseStoreHook<S> = <T extends unknown>(
    ...args:
      | []
      | [(state: S) => T]
      | [(state: S) => T, (prev: T, next: T) => boolean]
  ): T => {
    const [selector, compare] =
      args.length === 0
        ? [identity as (state: S) => T, strictEqual]
        : args.length === 1
        ? [args[0], strictEqual]
        : [args[0], args[1]]

    const [selection, setSelection] = useState(() => selector(store.getState()))

    const selectorRef = useRef(selector)
    const compareRef = useRef(compare)

    useEffect(() => {
      return store.subscribe((prev, next) => {
        const prevSlice = selectorRef.current(prev)
        const nextSlice = selectorRef.current(next)

        if (!compareRef.current(prevSlice, nextSlice)) {
          setSelection(nextSlice)
        }
      })
    }, [])

    useEffect(() => {
      const state = store.getState()
      const oldSlice = selectorRef.current(state)
      const newSlice = selector(state)

      if (!compare(oldSlice, newSlice)) {
        setSelection(newSlice)
      }

      selectorRef.current = selector
      compareRef.current = compare
    }, [selector, compare])

    return selection
  }

  return useStoreHook
}

// P E R S I T

interface PersistStorage {
  getItem(key: string): null | string | Promise<null | string>
  setItem(key: string, value: string): void | Promise<void>
}

interface PersistConfig<S> {
  key: string
  serialize(state: S): string | Promise<string>
  deserialize(input: string, initial: S): S | Promise<S>
  version?: number
  getStorage?(): PersistStorage
  migrate?(persistState: string, version: number): S | Promise<S>
}

const storageRegex = /(^\d+)\|(.*)/

const savePersistState = (
  storage: PersistStorage,
  key: string,
  version: number,
  serializedState: string | Promise<string>
): Promise<void> => {
  return Promise.resolve(serializedState).then(state => {
    return storage.setItem(key, `${version}|${state}`)
  })
}

const decodePersistState = (input: null | string): null | [number, string] => {
  if (input === null) {
    return null
  }

  try {
    const version = Number(input.replace(storageRegex, '$1'))
    const state = input.replace(storageRegex, '$2')

    if (typeof version === 'number') {
      return [version, state]
    }

    return null
  } catch {
    return null
  }
}

const unchain = <S>(
  valueOrPromise: S | Promise<S>,
  callback: (value: S) => void
): void => {
  if (valueOrPromise instanceof Promise) {
    valueOrPromise.then(callback)
  } else {
    callback(valueOrPromise)
  }
}

const readPersistState = (
  storage: PersistStorage,
  key: string,
  callback: (version: number, state: string) => void
): void => {
  unchain(storage.getItem(key), json => {
    const result = decodePersistState(json)

    if (result !== null) {
      callback(...result)
    }
  })
}

export const persist = <S>(
  fabric: StoreFabric<S>,
  {
    key: rawKey,
    serialize,
    deserialize,
    version = 1,
    getStorage = () => localStorage,
    migrate
  }: PersistConfig<S>
): StoreFabric<S> => {
  const key = `@secret-persist-store__${rawKey}`

  let storage: PersistStorage = {
    getItem: () => null,
    setItem: () => {
      // do nothing
    }
  }

  try {
    storage = getStorage()
  } catch {
    return fabric
  }

  return ($setState, $getState) => {
    const setState = (
      update: (prevState: S) => S,
      compare?: (prev: S, next: S) => boolean
    ): void => {
      const currentState = $getState()

      $setState(update, compare)

      const nextState = $getState()

      if (currentState !== nextState) {
        savePersistState(storage, key, version, serialize(nextState))
      }
    }

    let initial = fabric(setState, $getState)

    readPersistState(storage, key, (storedVersion, serializedState) => {
      if (storedVersion === version) {
        unchain(deserialize(serializedState, initial), initialState => {
          initial = initialState
        })
      } else if (typeof migrate === 'function') {
        unchain(migrate(serializedState, storedVersion), initialState => {
          initial = initialState
        })
      }
    })

    return initial
  }
}
