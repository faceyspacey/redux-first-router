import createSmartHistory from '../src/smart-history'
import { createInitialState } from '../src/createLocationReducer'
import { NOT_FOUND } from '../src/index'

export default async (type, pathname) => {
  // eslint-disable-line import/prefer-default-export
  const history = createSmartHistory({ initialEntries: ['/first'] })
  history.listen(function() {})
  await history.push(pathname)

  const current = { pathname, url: pathname, type, payload: { param: 'bar' } }
  const prev = { pathname: '/first', type: 'FIRST', payload: {} }
  const routesMap = {
    FIRST: { path: '/first' },
    SECOND: { path: '/second/:param' },
    [NOT_FOUND]: {
      path: '/not-found'
    }
  }

  return {
    type,
    pathname,
    current,
    prev,

    initialState: createInitialState(
      routesMap,
      history,
      {}
    ),

    routesMap,
    history,

    action: {
      type,
      payload: { param: 'bar' },
      location: {
        url: pathname,
        pathname,
        prev,
        kind: 'load',
        entries: history.entries.slice(0), // history.entries.map(entry => entry.pathname)
        index: history.index,
        length: history.length
      }
    },

    expectState(state) {
      expect(state.pathname).toEqual(pathname)
      expect(state.type).toEqual(type)
      expect(state.payload).toEqual({ param: 'bar' })
      expect(state.prev).toEqual(prev)
      expect(state.kind).toEqual('load')

      expect(state).toMatchSnapshot()
    }
  }
}
