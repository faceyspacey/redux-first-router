import { typeToScene, isNotFound } from '../../../utils'

export default (req, action, prevState, history, fromAction) => {
  const { kind, entries, index, length, location } = history
  const { pathname, search, basename: bn, url: u, state = {} } = location
  const { type, params = {}, query = {}, hash = '' } = action
  const prev = createPrev(prevState)
  const from = createFrom(fromAction)
  const scene = typeToScene(type)
  const pop = !!req.tmp.revertPop
  const direction = getDirection(kind, index, prevState)

  const basename = bn.substr(1)
  const url = bn + u
  const status = (kind === 'replace' || fromAction)
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
      direction,
      status,

      prev,
      from,

      kind,
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

const getDirection = (kind, currIndex, prevState) =>
  /replace|setState/.test(kind)
    ? prevState.direction
    : currIndex < prevState.index ? 'backward' : 'forward'
