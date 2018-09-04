import { changeBasename } from '@respond-framework/rudy/src/actions'
import createTest from '../../../__helpers__/createTest'

createTest(
  'dispatch(changeBasename(name))',
  {},
  {
    basenames: ['/foo'],
  },
  [changeBasename('/foo')],
)

createTest(
  'dispatch(changeBasename(name, action))',
  {},
  {
    basenames: ['/foo'],
  },
  [changeBasename('/foo', { type: 'REDIRECTED' })],
)

createTest(
  'dispatch(changeBasename(name)) with existing basename',
  {},
  {
    basenames: ['/foo', '/bar'],
  },
  ['/foo/first', changeBasename('/bar')],
)

createTest(
  'dispatch(changeBasename(name, action)) with existing basename',
  {},
  {
    basenames: ['/foo', '/bar'],
  },
  ['/foo/first', changeBasename('/bar', { type: 'REDIRECTED' })],
)

createTest(
  'automatically inherit existing basename',
  {},
  {
    basenames: ['/bar'],
  },
  ['/bar/first', { type: 'REDIRECTED' }],
)

createTest(
  'basenames without leading slashes are treated the same',
  {},
  {
    basenames: ['foo', 'bar'],
  },
  ['/foo/first', changeBasename('bar', { type: 'REDIRECTED' })],
)

createTest(
  'incorrect basename dispatches NOT_FOUND',
  {},
  {
    basenames: ['/foo', '/bar'],
  },
  ['/foo/first', changeBasename('/wrong')],
)

createTest(
  'support setting basename back to empty string',
  {},
  {
    basenames: ['/bar'],
  },
  ['/bar/first', { type: 'REDIRECTED', basename: '' }],
)
