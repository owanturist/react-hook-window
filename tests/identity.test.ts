import test from 'ava'

import { identity } from '../src'

test('Blank', t => {
  t.is(identity(1), 1)
})
