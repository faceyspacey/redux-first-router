import { locationToUrl } from '@respond-framework/rudy/src/utils'
import { reset } from '@respond-framework/rudy/src/actions'
import createTest from '../../../../__helpers__/createTest'

createTest(
  'reset(actions)',
  {
    SECOND: '/second',
    THIRD: '/third',
    FOURTH: '/fourth',
    FIFTH: '/fifth',
    SIXTH: '/sixth',
    SEVENTH: '/seventh',
    EIGHTH: '/eighth',
    NINTH: '/ninth',
    TENTH: '/tenth',
    ELEVENTH: '/eleventh',
    FIRST: '/:foo?',
  },
  {
    testBrowser: true,
    basenames: ['/base'],
  },
  [],
  async ({ dispatch, snap, snapPop, pop }) => {
    expect(locationToUrl(window.location)).toEqual('/')

    await dispatch({ type: 'SECOND' })
    expect(locationToUrl(window.location)).toEqual('/second')

    const actions = [
      {
        type: 'FIRST',
        params: { foo: 'bar' },
        hash: 'yolo',
        basename: 'base',
        state: { something: 123 },
      },
      {
        type: 'SECOND',
        query: { hell: 'yea' },
        hash: 'works',
        state: { something: 123 },
      },
      { type: 'THIRD' },
      { type: 'FOURTH' },
      { type: 'FIFTH' },
      { type: 'SIXTH' },
      { type: 'SEVENTH' },
      { type: 'EIGHTH' },
      { type: 'NINTH' },
      { type: 'TENTH' },
      { type: 'ELEVENTH' },
    ]

    await snap(reset(actions))

    expect(locationToUrl(window.location)).toEqual('/eleventh')

    await snapPop('back')
    expect(locationToUrl(window.location)).toEqual('/tenth')

    await snapPop('back')
    expect(locationToUrl(window.location)).toEqual('/ninth')

    await snapPop('back')
    expect(locationToUrl(window.location)).toEqual('/eighth')

    await snapPop('back')
    expect(locationToUrl(window.location)).toEqual('/seventh')

    await snapPop('back')
    expect(locationToUrl(window.location)).toEqual('/sixth')

    await snapPop('back')
    expect(locationToUrl(window.location)).toEqual('/fifth')

    await snapPop('back')
    expect(locationToUrl(window.location)).toEqual('/fourth')

    await snapPop('back')
    expect(locationToUrl(window.location)).toEqual('/third')

    await snapPop('back')
    expect(locationToUrl(window.location)).toEqual('/second?hell=yea#works')

    await snapPop('back')
    expect(locationToUrl(window.location)).toEqual('/base/bar#yolo')
  },
)
