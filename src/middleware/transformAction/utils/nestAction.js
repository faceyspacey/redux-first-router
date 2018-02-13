import { typeToScene, isNotFound } from '../../../utils'

export default (action, prevState, history, fromAction) => {
  const { kind, entries, index, length, location } = history
  const { pathname, search, basename: bn, url: u, state = {} } = location
  const { type, params = {}, query = {}, hash = '' } = action
  const prev = createPrev(prevState)
  const from = createFrom(fromAction)
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

const createPrev = (prevState) => {
  const prev = { ...prevState }

  delete prev.prev
  delete prev.hasSSR
  delete prev.from
  delete prev.location

  return prev
}

const createFrom = (fromAction) => {
  if (!fromAction) return null

  // if redirect(action) from outside of pipeline, we receive the state instead (see ./reduxAction.js)
  if (!fromAction.location) {
    const from = { ...fromAction }

    delete from.prev
    delete from.hasSSR
    delete from.from

    return from
  }

  // if redirect occurred during pipeline, we receive an action representing the previous state
  const { type, params, query, state, hash, basename, location } = fromAction
  const from = { type, params, query, state, hash, basename, ...location }

  delete from.prev
  delete from.hasSSR
  delete from.from

  return from
}
