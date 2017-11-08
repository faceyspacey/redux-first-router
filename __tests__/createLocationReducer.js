import createSmartHistory from '../src/smart-history'
import createLocationReducer, {
  createInitialState
} from '../src/createLocationReducer'
import { NOT_FOUND } from '../src/index'
import reducerParameters from '../__test-helpers__/reducerParameters'

it('createLocationReducer() - maintains address bar pathname state and current + previous matched location-aware actions', async () => {
  const { history, routesMap, action, expectState } = await reducerParameters(
    'SECOND',
    '/second/bar'
  )

  const reducer = createLocationReducer(routesMap, history, {})
  const state = reducer(undefined, action) /*? */

  expectState(state)
})

it('locationReducer() reduces action.type === NOT_FOUND', async () => {
  const { history, routesMap, action } = await reducerParameters(
    NOT_FOUND,
    '/foo'
  )

  const reducer = createLocationReducer(routesMap, history, {})
  const state = reducer(undefined, action) /*? */

  expect(state.type).toEqual(NOT_FOUND)
  expect(state.pathname).toEqual('/foo')
})

it('locationReducer() reduces non matched action.type and returns initialState', async () => {
  const { initialState, history, routesMap, action } = await reducerParameters(
    'THIRD',
    '/third'
  )

  const reducer = createLocationReducer(routesMap, history, {})
  const state = reducer(undefined, action) /*? */

  expect(state).toEqual(initialState)
})

it('getInitialState() returns state.history === undefined when using createBrowserHistory', async () => {
  const pathname = '/first'
  const history = createSmartHistory({ initialEntries: ['/first'] })
  history.listen(function() {})
  const current = { pathname, type: 'FIRST', payload: {} }
  const routesMap = {
    FIRST: '/first'
  }

  history.entries = undefined
  const initialState = createInitialState(routesMap, history, {})

  expect(initialState.history).not.toBeDefined()
  expect(initialState).toMatchSnapshot()
})
