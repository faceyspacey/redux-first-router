// @flow
import { CALL_HISTORY } from '../types'
import type { HistoryRouteAction } from '../flow-types'

export const push = (path: string, state: ?Object): HistoryRouteAction => ({
  type: CALL_HISTORY,
  payload: {
    method: 'push',
    args: [path, state],
  },
})

export const replace = (path: string, state: ?Object): HistoryRouteAction => ({
  type: CALL_HISTORY,
  payload: {
    method: 'replace',
    args: [path, state],
  },
})

export const jump = (
  delta: number | string,
  state: ?Object,
  byIndex: ?boolean,
  n: ?number,
): HistoryRouteAction => ({
  type: CALL_HISTORY,
  payload: {
    method: 'jump',
    args: [delta, state, byIndex, n],
  },
})

export const reset = (
  entries: Array<string | Object>,
  index: ?number,
  n: ?number,
): HistoryRouteAction => ({
  type: CALL_HISTORY,
  payload: {
    method: 'reset',
    args: [entries, index, n],
  },
})

export const back = (state: ?(Object | Function)): HistoryRouteAction => ({
  type: CALL_HISTORY,
  payload: {
    method: 'back',
    args: [state],
  },
})

export const next = (state: ?(Object | Function)): HistoryRouteAction => ({
  type: CALL_HISTORY,
  payload: {
    method: 'next',
    args: [state],
  },
})

export const set = (
  action: Object | Function,
  n: ?(number | string),
  byIndex: ?boolean,
): HistoryRouteAction => ({
  type: CALL_HISTORY,
  payload: {
    method: 'set',
    args: [action, n, byIndex],
  },
})

export const setParams = (
  params: Object | Function,
  n: ?(number | string),
  byIndex: ?boolean,
): HistoryRouteAction => ({
  type: CALL_HISTORY,
  payload: {
    method: 'set',
    args: [{ params }, n, byIndex],
  },
})

export const setQuery = (
  query: Object | Function,
  n: ?(number | string),
  byIndex: ?boolean,
): HistoryRouteAction => ({
  type: CALL_HISTORY,
  payload: {
    method: 'set',
    args: [{ query }, n, byIndex],
  },
})

export const setState = (
  state: Object | Function,
  n: ?(number | string),
  byIndex: ?boolean,
): HistoryRouteAction => ({
  type: CALL_HISTORY,
  payload: {
    method: 'set',
    args: [{ state }, n, byIndex],
  },
})

export const setHash = (
  hash: Object | Function,
  n: ?(number | string),
  byIndex: ?boolean,
): HistoryRouteAction => ({
  type: CALL_HISTORY,
  payload: {
    method: 'set',
    args: [{ hash }, n, byIndex],
  },
})

export const setBasename = (
  basename: Object | Function,
  n: ?(number | string),
  byIndex: ?boolean,
): HistoryRouteAction => ({
  type: CALL_HISTORY,
  payload: {
    method: 'set',
    args: [{ basename }, n, byIndex],
  },
})

// NOTE: see `src/utils/formatRoutes.js` for implementation of corresponding pathlessRoute
