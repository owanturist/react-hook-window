import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom'
import { WindowedListDemo } from './WindowedListDemo'

const dynamicItemSizes = `
  48 84 78 86 46 44 76 78 88 56 _684px
  76 50 62 60 50 64 96 56 80 52 _1330px
  53 56 70 89 87 74 42 58 64 55 _1978px
  91 84 97 87 85 89 52 53 54 53 _2723px
  59 55 74 57 57 42 55 40 75 50 _3287px
  50 81 96 80 47 93 62 89 59 74 _4018px
  93 79 49 69 72 46 78 63 70 57 _4694px
  90 89 67 52 42 61 51 49 80 81 _5356px
  91 81 93 74 78 64 75 48 42 60 _6062px
  83 53 49 54 46 79 41 90 81 46 _6684px
`
  .split(/\s+/)
  .map(Number)
  .filter(Boolean)

const getItemSize = (index: number): number => dynamicItemSizes[index] ?? 0

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Switch>
        <Route exact strict path="/fixed-size-list">
          <WindowedListDemo itemSize={50} />
        </Route>

        <Route exact strict path="/fixed-size-list/horizontal">
          <WindowedListDemo itemSize={50} layout="horizontal" />
        </Route>

        <Route exact strict path="/dynamic-size-list">
          <WindowedListDemo itemSize={getItemSize} />
        </Route>

        <Route exact strict path="/dynamic-size-list/horizontal">
          <WindowedListDemo itemSize={getItemSize} layout="horizontal" />
        </Route>

        <Route>
          <ul>
            <li>
              <Link to="/fixed-size-list">Fixed Size List</Link>
            </li>

            <li>
              <Link to="/fixed-size-list/horizontal">
                Horizontal Fixed Size List
              </Link>
            </li>

            <li>
              <Link to="/dynamic-size-list">Dynamic Size List</Link>
            </li>

            <li>
              <Link to="/dynamic-size-list/horizontal">
                Horizontal Dynamic Size List
              </Link>
            </li>
          </ul>
        </Route>
      </Switch>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)
