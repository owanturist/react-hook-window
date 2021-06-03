import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { WindowedListDemo } from './WindowedListDemo'

const dynamicItemSizes = `
  49 84 78 86 46 45 73 77 87 59 _684px
  77 49 61 61 50 64 97 56 80 52 _1331px
  53 56 70 89 87 74 42 58 64 55 _1979px
  91 84 97 87 85 89 52 53 54 53 _2724px
  59 55 74 57 57 42 55 40 75 50 _3288px
  50 81 96 80 47 93 62 89 59 74 _4019px
  93 79 49 69 72 46 78 63 70 57 _4695px
  90 89 67 52 42 61 51 49 80 81 _5357px
  91 81 93 74 78 64 75 48 42 60 _6063px
  83 53 49 54 46 79 41 90 81 46 _6685px
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

        <Route exact strict path="/dynamic-size-list">
          <WindowedListDemo itemSize={getItemSize} />
        </Route>
      </Switch>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)
