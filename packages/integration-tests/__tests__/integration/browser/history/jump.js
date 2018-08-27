import createTest from '../../../../__helpers__/createTest'
import { locationToUrl } from '../../../../src/utils'
import { jump } from '../../../../src/actions'

createTest(
  'set(action, n)',
  {
    SECOND: '/second',
    FIRST: '/:foo?',
  },
  {
    testBrowser: true,
  },
  [],
  async ({ dispatch, snap, snapPop }) => {
    expect(locationToUrl(window.location)).toEqual('/')

    await dispatch({ type: 'SECOND' })

    await snap(jump(-1))
    expect(locationToUrl(window.location)).toEqual('/')

    await snapPop('forward')
    expect(locationToUrl(window.location)).toEqual('/second')

    await snapPop('back')

    await snap(jump(1))
    expect(locationToUrl(window.location)).toEqual('/second')
  },
)
