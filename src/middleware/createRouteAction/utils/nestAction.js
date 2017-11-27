import typeToScene from '../../../utils/typeToScene'

export default (action, { prev: p, ...prev }, history, basename) => {
  const { kind, entries, index, length, location } = history
  const { url, pathname, search } = location
  const { type, payload = {}, query = {}, state = {}, hash = '' } = action
  const scene = typeToScene(type)

  return {
    ...action,
    type,
    payload,
    query,
    state,
    hash,
    location: {
      ...action.location,
      url,
      pathname,
      search,
      basename,
      scene,

      prev,

      kind,
      entries,
      index,
      length
    }
  }
}
