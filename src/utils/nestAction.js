import { isNotFound } from './index'

export default (action, prevState, fromAction, statusCode, tmp = {}) => {
  const { location, type, basename, params, query, state, hash } = action
  const { entries, index, length, pathname, search, url, key, scene, n } = location

  const prev = createActionRef(prevState)
  const from = createActionRef(fromAction)

  const kind = resolveKind(location.kind, tmp.load, from)
  const direction = n === -1 ? 'backward' : 'forward'

  const pop = !!tmp.revertPop
  const status = from ? (statusCode || 302) : (isNotFound(type) ? 404 : 200)

  return {
    type,
    params,
    query,
    state,
    hash,
    basename,
    location: {
      kind,
      direction,
      n,

      url,
      pathname,
      search,
      key,
      scene,

      prev,
      from,
      blocked: null,

      entries,
      index,
      length,

      pop,
      status
    }
  }
}

export const createActionRef = (actionOrState) => {
  if (!actionOrState) return null

  // if `prev` or redirect action from outside of pipeline, we receive the state instead (see ./formatAction.js)
  if (!actionOrState.location) {
    const { type, params, query, state, hash, basename, ...rest } = actionOrState
    const location = createLocationRef(rest)
    const action = { type, params, query, state, hash, basename, location }
    return action
  }

  // if redirect occurred during pipeline, we receive an action representing the previous state
  return {
    ...actionOrState,
    location: createLocationRef({ ...actionOrState.location })
  }
}

const createLocationRef = (loc) => {
  delete loc.prev
  delete loc.from
  delete loc.blocked
  delete loc.universal

  delete loc.length
  delete loc.kind
  delete loc.entries
  delete loc.pop
  delete loc.status
  delete loc.direction
  delete loc.n
  delete loc.universal

  return loc
}

const resolveKind = (kind, isLoad, from) =>
  isLoad
    ? 'load' // insure redirects don't change kind on load
    : !from || /jump|reset/.test(kind)
      ? kind // PRIMARY USE CASE: preverse the standard kind
      : kind.replace('push', 'replace') // pipeline redirects before enter are in fact pushes, but users shouldn't have to think about that
