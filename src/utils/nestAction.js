import { typeToScene, isNotFound } from './index'

const nestAction = (action, prevState, fromAction, statusCode, tmp = {}) => {
  const { location, type, params = {}, query = {}, state = {}, hash = '', basename: bn = '' } = action
  const { kind: k, entries, index, length, pathname, search, url, key, n } = location

  const prev = createActionRef(prevState)
  const from = createActionRef(fromAction)
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
    state,
    hash,
    basename,
    location: {
      kind: /jump|reset/.test(k) ? k : kind,
      direction,

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

export default nestAction

// create `state.prev/from/blocked`  values as idiomatic full-information rudy actions that can be re-dispatched
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
  delete loc.universal

  return loc
}
