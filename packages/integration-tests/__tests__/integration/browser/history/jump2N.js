import { locationToUrl } from '@respond-framework/rudy/src/utils'
import { jump } from '@respond-framework/rudy/src/actions'
import createTest from '../../../../__helpers__/createTest'

createTest(
  'set(action, n)',
  {
    SECOND: '/second',
    THIRD: '/third',
    FIRST: '/:foo?',
  },
  {
    testBrowser: true,
  },
  [],
  async ({ dispatch, snap, snapPop }) => {
    expect(locationToUrl(window.location)).toEqual('/')

    await dispatch({ type: 'SECOND' })
    await dispatch({ type: 'THIRD' })

    expect(locationToUrl(window.location)).toEqual('/third')

    await snap(jump(-2))

    expect(locationToUrl(window.location)).toEqual('/')

    await snapPop('forward')
    expect(locationToUrl(window.location)).toEqual('/second')

    await snapPop('back')

    await dispatch(jump(2))
    expect(locationToUrl(window.location)).toEqual('/third')
  },
)
