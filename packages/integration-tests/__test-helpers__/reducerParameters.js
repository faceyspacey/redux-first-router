import createSmartHistory from '@respond-framework/rudy/src/history'
import { createInitialState } from '@respond-framework/rudy/src/core/createReducer'
import { NOT_FOUND } from '@respond-framework/rudy/src/types'

export default async (type, pathname) => {
  // eslint-disable-line import/prefer-default-export
  const history = createSmartHistory({ initialEntries: ['/first'] })
  history.firstRoute.commit()

  const current = { pathname, url: pathname, type, params: { param: 'bar' } }
  const prev = { pathname: '/first', type: 'FIRST', params: {} }
  const routesMap = {
    FIRST: { path: '/first' },
    SECOND: { path: '/second/:param' },
    [NOT_FOUND]: { path: '/not-found' },
  }

  return {
    type,
    pathname,
    current,
    prev,

    initialState: createInitialState(routesMap, history, {}),

    routesMap,
    history,

    action: {
      type,
      params: { param: 'bar' },
      location: {
        url: pathname,
        pathname,
        prev,
        kind: 'load',
        entries: history.entries.slice(0), // history.entries.map(entry => entry.pathname)
        index: history.index,
        length: history.length,
      },
    },

    expectState(state) {
      expect(state.pathname).toEqual(pathname)
      expect(state.type).toEqual(type)
      expect(state.params).toEqual({ param: 'bar' })
      expect(state.prev).toEqual(prev)
      expect(state.kind).toEqual('load')

      expect(state).toMatchSnapshot()
    },
  }
}
