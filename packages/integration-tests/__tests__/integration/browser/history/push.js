import { locationToUrl } from '@respond-framework/rudy/src/utils'
import { push } from '@respond-framework/rudy/src/actions'
import createTest from '../../../../__helpers__/createTest'

createTest(
  'set(action, n)',
  {
    FIRST: '/',
    SECOND: '/second',
  },
  {
    testBrowser: true,
  },
  [],
  async ({ snap, pop }) => {
    expect(locationToUrl(window.location)).toEqual('/')

    await snap(push('/second', { foo: 'bar' }))
    expect(locationToUrl(window.location)).toEqual('/second')

    await pop('back')
    expect(locationToUrl(window.location)).toEqual('/')
  },
)
