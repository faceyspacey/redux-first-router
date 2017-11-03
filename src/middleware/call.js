import isLoadSSR from '../pure-utils/isClientLoadSSR'
import isServer from '../pure-utils/isServer'

const noop = function () {}
const isFalse = (a, b) => a === false || b === false

export default (name, config = {}) => async (req, next = noop) => {
  const shouldCall = req.options.shouldCall || defaultShouldCall
  if (!shouldCall(req, name, config)) return next()

  const { prev } = config
  const route = prev ? req.prevRoute : req.route
  const routeCb = route[name] || noop
  const globalCb = req.options[name] || noop

  const [a, b] = await Promise.all([routeCb(req), globalCb(req)])

  if (isFalse(a, b)) return false

  await next()

  return a || b
}

const defaultShouldCall = (req, name, config) => {
  const state = req.getLocationState()

  if (isLoadSSR(state) && /beforeLeave|beforeEnter/.test(name)) return false
  if (isServer() && /onLeave|onEnter/.test(name)) return false
  if (isLoadSSR(state) && name === 'thunk') return false
  if (config.prev && req.getLocationState().kind === 'init') return false

  return true
}

// export const callAndForget = (name, { prev } = {}) => async (req, next) => {
//   const route = prev ? req.prevRoute : req.route
//   const routeCb = route[name] || noop
//   const globalCb = req.options[name] || noop

//   const a = routeCb(req)
//   const b = globalCb(req)

//   if (isFalse(a, b)) return false

//   await next()

//   return a || b
// }


