import { typeToScene, isNotFound } from '../../../utils'

export default (action, { prev: p, ...prev }, history, basename) => {
  const { kind, entries, index, length, location } = history
  const { url, pathname, search } = location
  const { type, params = {}, query = {}, state = {}, hash = '' } = action
  const scene = typeToScene(type)
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
    location: {
      ...action.location,
      url,
      pathname,
      search,
      basename,
      scene,
      status,

      prev,

      kind,
      entries,
      index,
      length
    }
  }
}
