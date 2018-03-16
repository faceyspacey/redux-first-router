import { typeToScene, isNotFound } from '../../../utils'

export default (req, originalAction, prevState, history, fromAction) => {
  const { kind: k, entries, index, length, location: action } = history
  const { pathname, search, url, key } = action.location
  const { type, hash = '', basename: bn = '' } = action
  const { params = {}, query = {}, state = {} } = originalAction || action

  const prev = createPrev(prevState)
  const from = createFrom(fromAction)
  const scene = typeToScene(type)
  const pop = !!req.tmp.revertPop
  const kind = req.tmp.load ? 'load' : (from ? k.replace('push', 'replace') : k)
  const direction = getDirection(kind, index, prevState)

  const basename = bn.substr(1)
  const status = (kind === 'replace' || fromAction)
    ? ((originalAction && originalAction.location && originalAction.location.status) || 302)
    : (isNotFound(type) ? 404 : 200)

  return {
    ...originalAction,
    type,
    params,
    query,
    hash,
    state,
    basename,
    location: {
      ...(originalAction && originalAction.location),
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

const getDirection = (kind, currIndex, prevState) =>
  /replace|setState/.test(kind)
    ? prevState.direction
    : currIndex < prevState.index ? 'backward' : 'forward'

