import { typeToScene, isNotFound } from '../../../utils'

const nestAction = (action, prevState, fromAction, statusCode, tmp = {}) => {
  const { location, type, params = {}, query = {}, state = {}, hash = '', basename: bn = '' } = action
  const { kind: k, entries, index, length, pathname, search, url, key, n } = location

  const prev = createPrev(prevState)
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

export default nestAction

const createPrev = (prevState) => createStateRef(prevState)

// create `state.from` + `state.blocked` values as idiomatic full-information rudy actions that can be re-dispatched
export const createActionRef = (actionOrState) => {
  if (!actionOrState) return null

  // if redirect action from outside of pipeline, we receive the state instead (see ./formatAction.js)
  if (!actionOrState.location) {
    const { type, params, query, state, hash, basename, ...rest } = actionOrState
    const location = createStateRef(rest)
    const action = { type, params, query, state, hash, basename, location }
    return action
  }

  // if redirect occurred during pipeline, we receive an action representing the previous state
  return {
    ...actionOrState,
    location: createStateRef(actionOrState.location)
  }
}

export const createStateRef = (actionOrState, shouldNest = false) => {
  actionOrState = shouldNest ? nestAction(actionOrState) : actionOrState // history.jump/reset requires creating an entire action from primary action key/vals

  const location = actionOrState && actionOrState.location
  const state = { ...location, ...actionOrState }

  delete state.prev
  delete state.universal
  delete state.from
  delete state.blocked
  delete state.location

  return state
}
