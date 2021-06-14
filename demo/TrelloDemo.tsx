import * as React from 'react'
import { useWindowedList } from '../src'

import { Dict } from './Dict'
import { useResizeObserver } from './useResizeObserver'
import { createStore, shallowEqual } from './store'

const uuid = (): string => {
  return `id-${Date.now()}-${uuid.next++}`
}

uuid.next = 0

const TICKET_LINE_HEIGHT = 20

interface Ticket {
  id: string
  title: string
  columnId: string
}

interface Column {
  id: string
  title: string
  tickets: ReadonlyArray<string>
}

interface GenerateBoardOptions {
  minTickets: number
  maxTickets: number
  columnsCount: number
}

abstract class Board {
  public abstract readonly flow: ReadonlyArray<string>
  public abstract readonly columns: Dict<Column>
  public abstract readonly tickets: Dict<Ticket>

  public static empty: Board = {
    flow: [],
    columns: Dict.empty,
    tickets: Dict.empty
  }

  public static generate({
    minTickets,
    maxTickets,
    columnsCount
  }: GenerateBoardOptions): Board {
    const ticketText = [
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten'
    ]
    const flow: Array<string> = []
    const columnsAcc: Record<string, Column> = {}
    const ticketsAcc: Record<string, Ticket> = {}

    for (let col = 0; col < columnsCount; col++) {
      const columnId = col.toString()
      const ticketsN =
        minTickets + Math.floor(Math.random() * (maxTickets - minTickets))
      const tickets: Array<string> = []

      for (let tic = 0; tic < ticketsN; tic++) {
        const ticketId = `${columnId}-${tic}`
        const textLinesAmount = Math.floor(Math.random() * ticketText.length)

        tickets.push(ticketId)
        ticketsAcc[ticketId] = {
          id: ticketId,
          title: [
            `Ticket #${ticketId}`,
            ...ticketText.slice(0, textLinesAmount)
          ].join('\n'),
          columnId
        }
      }

      columnsAcc[columnId] = {
        id: columnId,
        title: `Column #${columnId}`,
        tickets
      }

      flow.push(columnId)
    }

    return {
      flow,
      columns: Dict.fromRecord(columnsAcc),
      tickets: Dict.fromRecord(ticketsAcc)
    }
  }
}
// S T O R E

const useIsWindowed = createStore<{
  isWindowed: boolean
  setIsWindowed(isWindowed: boolean): void
}>(setState => ({
  isWindowed: true,
  setIsWindowed: isWindowed => setState(state => ({ ...state, isWindowed }))
}))

const useBoardStore = createStore<{
  board: Board
  setBoard(board: Board): void
  addColumn(column: Column): void
  addTicket(columnId: string, ticket: Ticket): void
  removeTicket(ticketId: string): void
  setTicketTitle(ticketId: string, title: string): void
  estimateTicketHeight(ticketId: string): number
}>((setState, getState) => ({
  board: Board.empty,

  setBoard(board) {
    setState(state => ({ ...state, board }))
  },

  addColumn(column) {
    setState(state => ({
      ...state,
      board: {
        ...state.board,
        flow: [...state.board.flow, column.id],
        columns: state.board.columns.insert(column.id, column)
      }
    }))
  },

  addTicket(columnId, ticket) {
    setState(state => ({
      ...state,
      board: {
        ...state.board,
        tickets: state.board.tickets.insert(ticket.id, ticket),
        columns: state.board.columns.update(columnId, column => ({
          ...column,
          tickets: [...column.tickets, ticket.id]
        }))
      }
    }))
  },

  removeTicket(ticketId) {
    setState(state => {
      const ticket = state.board.tickets.get(ticketId)

      if (ticket == null) {
        return state
      }

      return {
        ...state,
        board: {
          ...state.board,
          tickets: state.board.tickets.remove(ticketId),
          columns: state.board.columns.update(ticket.columnId, column => ({
            ...column,
            tickets: column.tickets.filter(id => id !== ticketId)
          }))
        }
      }
    })
  },

  setTicketTitle(ticketId, title) {
    setState(state => ({
      ...state,
      board: {
        ...state.board,
        tickets: state.board.tickets.update(ticketId, ticket => ({
          ...ticket,
          title
        }))
      }
    }))
  },

  estimateTicketHeight(ticketId) {
    const { board } = getState()
    const ticket = board.tickets.get(ticketId)

    if (ticket == null) {
      return 20 // margin + paddings
    }

    // (margin + paddings) + line-height * N-lines
    return 20 + TICKET_LINE_HEIGHT * ticket.title.split('\n').length
  }
}))

// V I E W

const ViewTicket = React.memo<{
  ticketId: string
  onChangeTitle(ticketId: string, title: string): void
  onRemove(ticketId: string): void
}>(({ ticketId, onChangeTitle, onRemove }) => {
  const ticket = useBoardStore(
    React.useCallback(({ board }) => board.tickets.get(ticketId), [ticketId])
  )
  const [editingTitle, setEditingTitle] = React.useState<null | string>(null)

  if (ticket === null) {
    return <div>Unknown ticket #{ticketId}</div>
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        borderRadius: 3,
        margin: '4px 0',
        padding: '6px 8px',
        lineHeight: `${TICKET_LINE_HEIGHT}px`,
        background: '#fff',
        boxShadow: '0 1px 0 rgb(9 30 66 / 25%)'
      }}
    >
      <div
        style={{ flex: '1 1 auto' }}
        onDoubleClick={() => {
          if (editingTitle == null) {
            setEditingTitle(ticket.title)
          }
        }}
      >
        {editingTitle == null ? (
          ticket.title.split('\n').map((fragment, i) => (
            <React.Fragment key={i}>
              {fragment}
              <br />
            </React.Fragment>
          ))
        ) : (
          <form
            onSubmit={event => {
              onChangeTitle(ticketId, editingTitle)
              setEditingTitle(null)

              event.preventDefault()
            }}
          >
            <textarea
              style={{
                resize: 'none'
              }}
              rows={4}
              value={editingTitle}
              onChange={event => setEditingTitle(event.target.value)}
            />
            <div style={{ marginTop: 4 }}>
              <button type="button" onClick={() => setEditingTitle(null)}>
                Cancel
              </button>
              <button style={{ marginLeft: 4 }} type="submit">
                Save
              </button>
            </div>
          </form>
        )}
      </div>

      <button
        type="button"
        style={{
          border: 'none',
          background: '#c99'
        }}
        onClick={() => onRemove(ticketId)}
      >
        &times;
      </button>
    </div>
  )
})

const ViewCreateTicket = React.memo<{
  columnId: string
}>(({ columnId }) => {
  const createTicket = useBoardStore(({ addTicket }) => addTicket)
  const [title, setTitle] = React.useState('')

  return (
    <form
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        width: '100%'
      }}
      onSubmit={event => {
        createTicket(columnId, { id: uuid(), title, columnId })
        setTitle('')

        event.preventDefault()
      }}
    >
      <textarea
        style={{
          flex: '1 0 auto',
          resize: 'none'
        }}
        rows={4}
        value={title}
        onChange={event => setTitle(event.target.value)}
      />
      <button style={{ marginLeft: 4 }} type="submit">
        Add
      </button>
    </form>
  )
})

const StyledColumn: React.FC = ({ children }) => (
  <div
    style={{
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      padding: 8,
      borderRadius: 3,
      maxHeight: '100%',
      background: '#ebecf0'
    }}
  >
    {children}
  </div>
)

const ObservedTicket: React.FC<{
  ticketId: string
  height: number
  setHeight(ticketId: string, height: number): void
}> = ({ ticketId, height, setHeight, children }) => {
  const nodeRef = React.useRef<HTMLDivElement>(null)
  const [nodeHeight, setNodeHeight] = React.useState(0)

  useResizeObserver(
    React.useCallback(node => setNodeHeight(node.clientHeight), []),
    nodeRef.current
  )
  const shouldSetHeight = nodeHeight > 0 && nodeHeight !== height

  React.useEffect(() => {
    if (shouldSetHeight) {
      setHeight(ticketId, nodeHeight)
    }
  }, [shouldSetHeight, nodeHeight, setHeight, ticketId])

  return <div ref={nodeRef}>{children}</div>
}

const StyledTicketsScroller = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode }
>(({ children }, ref) => (
  <div
    ref={ref}
    style={{
      flex: '1 1 auto',
      overflowX: 'hidden',
      overflowY: 'auto',
      minHeight: 0
    }}
  >
    {children}
  </div>
))

const ViewFullColumn = React.memo<{
  columnId: string
}>(({ columnId }) => {
  const { column, removeTicket, setTicketTitle } = useBoardStore(
    React.useCallback(
      store => ({
        column: store.board.columns.get(columnId),
        removeTicket: store.removeTicket,
        setTicketTitle: store.setTicketTitle
      }),
      [columnId]
    ),
    shallowEqual
  )

  if (column == null) {
    return <div>Unknown column #{columnId}</div>
  }

  return (
    <StyledColumn>
      <div>{column.title}</div>

      <StyledTicketsScroller>
        {column.tickets.map(ticketId => (
          <ViewTicket
            key={ticketId}
            ticketId={ticketId}
            onRemove={removeTicket}
            onChangeTitle={setTicketTitle}
          />
        ))}
      </StyledTicketsScroller>

      <div style={{ padding: 8 }}>
        <ViewCreateTicket columnId={columnId} />
      </div>
    </StyledColumn>
  )
})

const useItemsSize = (
  ticketIds?: ReadonlyArray<string>
): [(index: number) => number, (ticketId: string, height: number) => void] => {
  const [itemsHeight, setItemsHeight] = React.useState<Dict<number>>(Dict.empty)
  const estimateTicketHeight = useBoardStore(
    React.useCallback(state => state.estimateTicketHeight, [])
  )

  return [
    React.useCallback(
      (index: number): number => {
        const ticketId = ticketIds?.[index] ?? ''

        return itemsHeight.get(ticketId) ?? estimateTicketHeight(ticketId)
      },
      [itemsHeight, ticketIds, estimateTicketHeight]
    ),

    React.useCallback((ticketId, height) => {
      setItemsHeight(current => current.insert(ticketId, height))
    }, [])
  ]
}
const ViewWindowedColumn = React.memo<{
  columnId: string
  initialScroll: number
  saveScrollPosition(columnId: string, scroll: number): void
}>(({ columnId, initialScroll, saveScrollPosition }) => {
  const { column, removeTicket, setTicketTitle } = useBoardStore(
    React.useCallback(
      store => ({
        column: store.board.columns.get(columnId),
        removeTicket: store.removeTicket,
        setTicketTitle: store.setTicketTitle
      }),
      [columnId]
    ),
    shallowEqual
  )
  const [getItemSize, setItemSize] = useItemsSize(column?.tickets)
  const [containerHeight, setContainerHeight] = React.useState(0)

  const { container, setRef, indexes, startSpace, endSpace } = useWindowedList({
    overscanCount: 3,
    containerSize: containerHeight,
    itemSize: getItemSize,
    itemCount: column?.tickets.length ?? 0,
    initialScroll
  })

  useResizeObserver(
    React.useCallback(node => setContainerHeight(node.clientHeight), []),
    container
  )

  React.useLayoutEffect(() => {
    if (container == null) {
      return
    }

    return () => {
      saveScrollPosition(columnId, container.scrollTop)
    }
  }, [container, columnId, saveScrollPosition])

  if (column == null) {
    return <div>Unknown column #{columnId}</div>
  }

  return (
    <StyledColumn>
      <div>{column.title}</div>

      <StyledTicketsScroller ref={setRef}>
        <div style={{ height: startSpace }} />

        {indexes.map(index => (
          <ObservedTicket
            key={column.tickets[index]}
            height={getItemSize(index)}
            ticketId={column.tickets[index]}
            setHeight={setItemSize}
          >
            <ViewTicket
              ticketId={column.tickets[index]}
              onRemove={removeTicket}
              onChangeTitle={setTicketTitle}
            />
          </ObservedTicket>
        ))}

        <div style={{ height: endSpace }} />
      </StyledTicketsScroller>

      <div style={{ padding: 8 }}>
        <ViewCreateTicket columnId={columnId} />
      </div>
    </StyledColumn>
  )
})

const ViewCreateColumn = React.memo(() => {
  const createColumn = useBoardStore(({ addColumn }) => addColumn)
  const [title, setTitle] = React.useState('')

  return (
    <form
      onSubmit={event => {
        createColumn({ id: uuid(), title, tickets: [] })
        setTitle('')

        event.preventDefault()
      }}
    >
      <input
        type="text"
        value={title}
        onChange={event => setTitle(event.target.value)}
      />
      <button type="submit">Add column</button>
    </form>
  )
})

const parsePositiveInt = (defaults: number, input: string): number => {
  return Math.max(0, Math.round(Number(input))) || defaults
}

const ViewGenerateBoard = React.memo(() => {
  const setBoard = useBoardStore(React.useCallback(state => state.setBoard, []))
  const [options, setOptions] = React.useState({
    columnsCount: '',
    minTickets: '',
    maxTickets: ''
  })

  return (
    <form
      onSubmit={event => {
        setBoard(
          Board.generate({
            columnsCount: parsePositiveInt(20, options.columnsCount),
            minTickets: parsePositiveInt(10, options.minTickets),
            maxTickets: parsePositiveInt(100, options.maxTickets)
          })
        )
        event.preventDefault()
      }}
    >
      <input
        type="number"
        placeholder="columnsCount"
        value={options.columnsCount}
        onChange={event => {
          setOptions(current => ({
            ...current,
            columnsCount: event.target.value
          }))
        }}
      />
      <br />

      <input
        type="number"
        placeholder="minTickets"
        value={options.minTickets}
        onChange={event => {
          setOptions(current => ({
            ...current,
            minTickets: event.target.value
          }))
        }}
      />
      <br />

      <input
        type="number"
        placeholder="maxTickets"
        value={options.maxTickets}
        onChange={event => {
          setOptions(current => ({
            ...current,
            maxTickets: event.target.value
          }))
        }}
      />
      <br />

      <button type="submit">Generate</button>
    </form>
  )
})

const StyledColumnContainer: React.FC = ({ children }) => (
  <div
    style={{
      display: 'inline-block',
      verticalAlign: 'top',
      boxSizing: 'border-box',
      padding: '0 4px',
      width: 300,
      height: '100%',
      minHeight: 0,
      maxHeight: '100%',
      whiteSpace: 'normal'
    }}
  >
    {children}
  </div>
)

const useScrollPositions = (): [
  (columntd: string) => number,
  (columntd: string, position: number) => void
] => {
  const [positions, setPositions] = React.useState<Dict<number>>(Dict.empty)

  return [
    columnId => positions.get(columnId) ?? 0,
    React.useCallback((columntd, scroll) => {
      setPositions(current => current.insert(columntd, scroll))
    }, [])
  ]
}

const ViewControlColumn: React.VFC = React.memo(() => {
  const { isWindowed, setIsWindowed } = useIsWindowed()

  return (
    <StyledColumnContainer>
      <StyledColumn>
        <ViewCreateColumn />
        <br />
        <ViewGenerateBoard />
        <br />
        <label>
          <input
            type="checkbox"
            checked={isWindowed}
            onChange={event => setIsWindowed(event.target.checked)}
          />{' '}
          is windowed
        </label>
      </StyledColumn>
    </StyledColumnContainer>
  )
})

const StyledColumnsScroller = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode }
>(({ children }, ref) => (
  <div
    ref={ref}
    style={{
      position: 'fixed',
      inset: 0,
      padding: '8px 4px',
      whiteSpace: 'nowrap',
      overflowX: 'auto',
      overflowY: 'hidden'
    }}
  >
    {children}
  </div>
))

const ViewWindowedTrello = React.memo<{
  flow: ReadonlyArray<string>
}>(({ flow }) => {
  const [getScrollPosition, setScrollPosition] = useScrollPositions()
  const [containerWidth, setContainerWidth] = React.useState(0)
  const { container, setRef, indexes, startSpace, endSpace } = useWindowedList({
    containerSize: containerWidth,
    itemSize: 300,
    itemCount: flow.length + 1,
    layout: 'horizontal'
  })

  useResizeObserver(
    React.useCallback(node => setContainerWidth(node.clientWidth), []),
    container
  )

  return (
    <StyledColumnsScroller ref={setRef}>
      <div style={{ display: 'inline-block', width: startSpace }} />

      {indexes.map(index => {
        if (index < flow.length) {
          return (
            <StyledColumnContainer key={flow[index]}>
              <ViewWindowedColumn
                columnId={flow[index]}
                initialScroll={getScrollPosition(flow[index])}
                saveScrollPosition={setScrollPosition}
              />
            </StyledColumnContainer>
          )
        }

        return <ViewControlColumn key="control" />
      })}

      <div style={{ display: 'inline-block', width: endSpace }} />
    </StyledColumnsScroller>
  )
})

const ViewFullTrello = React.memo<{
  flow: ReadonlyArray<string>
}>(({ flow }) => (
  <StyledColumnsScroller>
    {flow.map(columnId => (
      <StyledColumnContainer key={columnId}>
        <ViewFullColumn columnId={columnId} />
      </StyledColumnContainer>
    ))}

    <ViewControlColumn />
  </StyledColumnsScroller>
))

export const TrelloDemo = React.memo(() => {
  const flow = useBoardStore(React.useCallback(({ board }) => board.flow, []))
  const { isWindowed } = useIsWindowed()

  return (
    <>
      <GlobalStyles />

      {isWindowed ? (
        <ViewWindowedTrello flow={flow} />
      ) : (
        <ViewFullTrello flow={flow} />
      )}
    </>
  )
})

const GlobalStyles = React.memo(() => (
  <style>
    {`
      body {
        margin: 0;
        padding: 0;
        font: 14px/1.4 sans-serif;
        background: #0079bf;
        color: #172b4d;
      }
    `}
  </style>
))
