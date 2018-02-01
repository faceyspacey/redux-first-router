// @flow
import { actionToUrl, isAction } from '../utils'
import { createLocation } from '../history/utils/location'

export const push = (path: string, state: ?Object) => ({ history }) =>
  history.push(path, state, false)

export const replace = (path: string, state: ?Object) => ({ history }) =>
  history.replace(path, state, false)

export const jump = (n: number | string, state: ?Object, byIndex: ?boolean, kind: ?string) => ({ history }) =>
  history.jump(n, state, byIndex, kind, false)

export const reset = (entries: Array<string | Object>, index: ?number, kind: ?string) => ({ history, routes, options }) => {
  if (typeof entries[0] === 'object' && entries[0].type) {
    const locations = entries.map(action => {
      const url = actionToUrl(action, routes, options)
      return createLocation(url, action.state, undefined, undefined, action.basename)
    })

    return history.reset(locations, index, kind, false)
  }

  return history.reset(entries, index, kind, false)
}

export const setState = (state: Object | Function, n: ?(number | string), byIndex: ?boolean) => ({ history }) =>
  history.setState(state, n, byIndex, false)

export const back = (state: ?(Object | Function)) => ({ history }) =>
  history.back(state, false)

export const next = (state: ?(Object | Function)) => ({ history }) =>
  history.next(state, false)

