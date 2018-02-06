// @flow
import { CALL_HISTORY } from '../types'
import { actionToUrl } from '../utils'
import { createLocation } from '../history/utils/location'

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


// Below is a pathless route thunk added to your routes by `utils/formatRoutes.js`:
// NOTE: it's here for convenient reference

export const callHistoryThunk = ({ action, history, routes, options }) => {
  const { method, args } = action.payload

  if (method !== 'reset') {
    return history[method](...args, false)
  }

  const [entries, index, kind] = args

  if (typeof entries[0] === 'object' && entries[0].type) {
    const locations = entries.map(action => {
      const url = actionToUrl(action, routes, options)
      return createLocation(url, action.state, undefined, undefined, action.basename)
    })

    return history.reset(locations, index, kind, false)
  }

  return history.reset(entries, index, kind, false)
}
