// @flow
import { CALL_HISTORY } from '../types'

export const push = (path: string, state: ?Object) => ({
  type: CALL_HISTORY,
  payload: {
    method: 'push',
    args: [path, state]
  }
})

export const replace = (path: string, state: ?Object) => ({
  type: CALL_HISTORY,
  payload: {
    method: 'replace',
    args: [path, state]
  }
})

export const jump = (n: number | string, state: ?Object, byIndex: ?boolean, kind: ?string) => ({
  type: CALL_HISTORY,
  payload: {
    method: 'jump',
    args: [n, state, byIndex, kind]
  }
})

export const reset = (entries: Array<string | Object>, index: ?number, kind: ?string) => ({
  type: CALL_HISTORY,
  payload: {
    method: 'reset',
    args: [entries, index, kind]
  }
})

export const back = (state: ?(Object | Function)) => ({
  type: CALL_HISTORY,
  payload: {
    method: 'back',
    args: [state]
  }
})

export const next = (state: ?(Object | Function)) => ({
  type: CALL_HISTORY,
  payload: {
    method: 'next',
    args: [state]
  }
})

export const set = (action: Object | Function, n: ?(number | string), byIndex: ?boolean) => ({
  type: CALL_HISTORY,
  payload: {
    method: 'set',
    args: [action, n, byIndex]
  }
})

export const setParams = (params: Object | Function, n: ?(number | string), byIndex: ?boolean) => ({
  type: CALL_HISTORY,
  payload: {
    method: 'setParams',
    args: [params, n, byIndex]
  }
})

export const setQuery = (query: Object | Function, n: ?(number | string), byIndex: ?boolean) => ({
  type: CALL_HISTORY,
  payload: {
    method: 'setQuery',
    args: [query, n, byIndex]
  }
})

export const setState = (state: Object | Function, n: ?(number | string), byIndex: ?boolean) => ({
  type: CALL_HISTORY,
  payload: {
    method: 'setState',
    args: [state, n, byIndex]
  }
})

export const setHash = (hash: Object | Function, n: ?(number | string), byIndex: ?boolean) => ({
  type: CALL_HISTORY,
  payload: {
    method: 'setHash',
    args: [hash, n, byIndex]
  }
})

export const setBasename = (basename: Object | Function, n: ?(number | string), byIndex: ?boolean) => ({
  type: CALL_HISTORY,
  payload: {
    method: 'setBasename',
    args: [basename, n, byIndex]
  }
})

// NOTE: see `src/utils/formatRoutes.js` for implemenation of corresponding pathlessRoute
