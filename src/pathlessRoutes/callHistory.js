import { actionToUrl } from '../utils'
import { createLocation } from '../history/utils/location'

export default ({ action, history, routes, options, has, dispatch }) => {
  const env = process.env.NODE_ENV

  if (env === 'development' && !has('pathlessRoute')) {
    throw new Error('[rudy] "pathlessRoute" middleware is required to use history action creators.')
  }

  const { method, args } = action.payload
  const act = method !== 'reset'
    ? history[method](...args, false)
    : createResetAction(args, history, routes, options)

  return dispatch(act)
}

const createResetAction = (args, history, routes, options) => {
  const [entries, index, kind] = args

  if (typeof entries[0] === 'object' && entries[0].type) {
    if (entries.length === 1) {
      const entry = findResetFirstAction(entries[0], routes, options)
      entries.unshift(entry)
    }

    const locations = entries.map(action => {
      const url = actionToUrl(action, routes, options)
      return createLocation(url, action.state, undefined, undefined, action.basename)
    })

    return history.reset(locations, index, kind, false)
  }

  if (entries.length === 1) {
    const entry = findResetFirstEntry(entries[0], routes, options)
    entries.unshift(entry)
  }

  return history.reset(entries, index, kind, false)
}

const findResetFirstAction = (action, routes, options) => {
  if (options.resetFirstEntry) {
    return typeof options.resetFirstEntry === 'function'
      ? options.resetFirstEntry(action)
      : options.resetFirstEntry
  }

  if (routes[action.type].path !== '/') {
    const homeType = Object.keys(routes).find(type => routes[type].path === '/')
    return homeType ? { type: homeType } : { type: 'NOT_FOUND' }
  }

  return { type: 'NOT_FOUND' }
}

const findResetFirstEntry = (entry, routes, options) => {
  if (options.resetFirstEntry) {
    return typeof options.resetFirstEntry === 'function'
      ? options.resetFirstEntry(action)
      : options.resetFirstEntry
  }

  const notFoundPath = routes.NOT_FOUND.path

  if (entry !== '/' || entry.url !== '/') {
    const homeRoute = Object.keys(routes).find(type => routes[type].path === '/')
    return homeRoute ? '/' : notFoundPath
  }

  return notFoundPath
}
