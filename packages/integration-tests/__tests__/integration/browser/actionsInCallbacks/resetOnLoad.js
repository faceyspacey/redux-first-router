import { locationToUrl } from '@respond-framework/rudy/src/utils'
import { reset } from '@respond-framework/rudy/src/actions'
import createTest, {
  resetBrowser,
  setupStore,
} from '../../../../__helpers__/createTest'

beforeEach(async () => {
  await resetBrowser()

  const routesMap = {
    FIRST: '/',
    SECOND: '/second',
    MAIN: '/main',
  }

  const { store, firstRoute, history } = setupStore(routesMap)

  const firstAction = firstRoute(false)
  await store.dispatch(firstAction)

  await store.dispatch({ type: 'SECOND' })
  await store.dispatch({ type: 'MAIN' })

  history.unlisten()
})

const routes = {
  SECOND: '/second',
  THIRD: '/third',
  FOURTH: '/fourth',
  FIFTH: '/fifth',
  SIXTH: '/sixth',
  SEVENTH: '/seventh',
  EIGHTH: '/eighth',
  NINTH: '/ninth',
  TENTH: '/tenth',
  ELEVENTH: {
    path: '/eleventh',
    thunk() {},
  },
  MAIN: {
    path: '/main',
    thunk: () => {
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

      return reset(actions)
    },
  },
  FIRST: '/:foo?',
}

const sniper = async ({ snapPop }) => {
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
}

createTest(
  'reset(actions) afterEnter on load',
  routes,
  {
    testBrowser: true,
    basenames: ['/base'],
  },
  [],
  sniper,
)

createTest(
  'reset(actions) beforeEnter  on load',
  {
    ...routes,
    MAIN: {
      path: '/main',
      beforeEnter: routes.MAIN.thunk,
    },
  },
  {
    testBrowser: true,
    basenames: ['/base'],
  },
  [],
  sniper,
)
