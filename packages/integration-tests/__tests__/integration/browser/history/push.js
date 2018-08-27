import createTest from '../../../../__helpers__/createTest'
import { locationToUrl } from '../../../../src/utils'
import { push } from '../../../../src/actions'

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
