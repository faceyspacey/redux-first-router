// @flow

export const push = (path: string, state: ?Object) => ({ history }) =>
  history.push(path, state, false)

export const replace = (path: string, state: ?Object) => ({ history }) =>
  history.replace(path, state, false)

export const jump = (n: number | string, state: ?Object, kind: ?string, byIndex: ?boolean) => ({ history }) =>
  history.jump(n, state, kind, byIndex, false)

export const reset = (entries: Array<string | Object>, index: ?number, kind: ?string) => ({ history }) =>
  history.reset(entries, index, kind, false)

export const setState = (state: Object | Function, n: ?(number | string), byIndex: ?boolean) => ({ history }) =>
  history.setState(state, n, byIndex, false)

export const back = (state: ?(Object | Function)) => ({ history }) =>
  history.back(state, false)

export const next = (state: ?(Object | Function)) => ({ history }) =>
  history.next(state, false)
