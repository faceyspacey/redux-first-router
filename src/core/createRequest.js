// @flow
import { UPDATE_HISTORY } from '../types'
import { noOp } from '../utils'
import { createDispatch } from './index'

export default (
  action,
  api,
  tmp,
  next
) => {
  const { store, routes, options, getLocation } = api
  tmp.startAction = tmp.startAction || action // stays consistent across redirects (see core/createDispatch.js)

  const req = {
    ...options.extra,
    ...api,
    tmp,
    action,
    initialState: store.getState(),
    initialLocation: getLocation(),
    getState: store.getState,
    dispatch: createDispatch(() => req),
    prevRoute: routes[getLocation().type],
    route: routes[action.type] || {},
    commitHistory: action.type === UPDATE_HISTORY ? action.commit : noOp,
    commitDispatch: next,
    completed: false,
    error: null
  }

  return req
}

