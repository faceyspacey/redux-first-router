import { createMemoryHistory } from 'history'

import { getInitialState } from '../src/reducer/createLocationReducer'

export default (type, pathname) => {
  // eslint-disable-line import/prefer-default-export
  const history = createMemoryHistory({ initialEntries: ['/first'] })
  history.push(pathname)

  const current = { pathname, type, payload: { param: 'bar' } }
  const prev = { pathname: '/first', type: 'FIRST', payload: {} }
  const routesMap = {
    FIRST: '/first',
    SECOND: '/second/:param'
  }

  return {
    type,
    pathname,
    current,
    prev,

    initialState: getInitialState(
      prev.pathname,
      {},
      prev.type,
      prev.payload,
      routesMap,
      history
    ),

    routesMap,

    action: {
      type,
      payload: { param: 'bar' },
      meta: {
        location: {
          current,
          prev,
          kind: 'load',
          history: {
            entries: history.entries.slice(0), // history.entries.map(entry => entry.pathname)
            index: history.index,
            length: history.length
          }
        }
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
