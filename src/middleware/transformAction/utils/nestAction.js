import { typeToScene, isNotFound } from '../../../utils'

export default (action, prevState, fromAction, statusCode, tmp = {}) => {
  const { location, type, params = {}, query = {}, state = {}, hash = '', basename: bn = '' } = action
  const { kind: k, entries, index, length, pathname, search, url, key, n } = location

  const prev = createPrev(prevState)
  const from = createFrom(fromAction)
  const scene = typeToScene(type)
  const pop = !!tmp.revertPop
  const kind = tmp.load ? 'load' : (from ? k.replace('push', 'replace') : k)
  const direction = n === -1 ? 'backward' : 'forward'
  const basename = bn.substr(1)
  const status = from ? (statusCode || 302) : (isNotFound(type) ? 404 : 200)

  return {
    type,
    params,
    query,
    hash,
    state,
    basename,
    location: {
      url,
      pathname,
      search,
      key,
      scene,
      direction,
      status,

      prev,
      from,

      kind: /jump|reset/.test(k) ? k : kind,
      entries,
      index,
      length,
      pop
    }
  }
}

const createPrev = (prevState) => createStateReference(prevState)

// create `state.from` + `state.blocked` values as idiomatic full-information rudy actions that can be re-dispatched
export const createFrom = (fromAction) => {
  if (!fromAction) return null

  // if redirect(action) from outside of pipeline, we receive the state instead (see ./reduxAction.js)
  if (!fromAction.location) {
    const { type, params, query, state, hash, basename, ...location } = fromAction
    const from = { type, params, query, state, hash, basename }
    from.location = createStateReference(location)
    return from
  }

  // if redirect occurred during pipeline, we receive an action representing the previous state
  return {
    ...fromAction,
    location: createStateReference(fromAction.location)
  }
}

const createStateReference = (location) => {
  const ref = { ...location }

  delete ref.prev
  delete ref.universal
  delete ref.from
  delete ref.blocked
  delete ref.location

  return ref
}
