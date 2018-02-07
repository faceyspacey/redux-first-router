import { typeToScene, isNotFound } from '../../../utils'

export default (action, { prev: p, hasSSR, from: f, ...prev }, history, { prev: p2, hasSSR: h2, from: f2, ...fromState } = {}) => {
  const { kind, entries, index, length, location } = history
  const { pathname, search, basename: bn, url: u, state = {} } = location
  const { type, params = {}, query = {}, hash = '' } = action
  const from = fromState.pathname ? fromState : null
  const scene = typeToScene(type)
  const basename = bn.substr(1)
  const url = bn + u
  const status = kind === 'redirect'
    ? ((action.location && action.location.status) || 302)
    : (isNotFound(type) ? 404 : 200)

  return {
    ...action,
    type,
    params,
    query,
    hash,
    state,
    basename,
    location: {
      ...action.location,
      url,
      pathname,
      search,
      scene,
      status,

      prev,
      from,

      kind,
      entries,
      index,
      length
    }
  }
}
