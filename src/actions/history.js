// @flow
import { CALL_HISTORY } from '../types'

export const push = (path: string, state: ?Object, basename: ?string) => ({
  type: CALL_HISTORY,
  payload: {
    method: 'push',
    args: [path, state, basename]
  }
})

export const replace = (path: string, state: ?Object, basename: ?string) => ({
  type: CALL_HISTORY,
  payload: {
    method: 'replace',
    args: [path, state, basename]
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

export const setState = (state: Object | Function, n: ?(number | string), byIndex: ?boolean) => ({
  type: CALL_HISTORY,
  payload: {
    method: 'setState',
    args: [state, n, byIndex]
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


// NOTE: see `src/utils/formatRoutes.js` for implemenation of corresponding pathlessRouteThunks
