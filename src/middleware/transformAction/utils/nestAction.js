import { typeToScene, isNotFound } from '../../../utils'

export default (action, { prev: p, ...prev }, history) => {
  const { kind, entries, index, length, location } = history
  const { url, pathname, search, basename, state = {} } = location
  const { type, params = {}, query = {}, hash = '' } = action
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
    basename: basename.substr(1),
    location: {
      ...action.location,
      url: basename + url,
      pathname,
      search,
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
