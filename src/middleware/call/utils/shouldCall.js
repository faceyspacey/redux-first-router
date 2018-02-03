import { isHydrate, isServer } from '../../../utils'

const regularReturn = { route: true, options: true }
const errorReturn = { route: true, options: false }

export default (name, route, req, config) => {
  if (!route[name] && !req.options[name]) return false

  const state = req.getLocation()
  const kind = req.action.location && req.action.location.kind

  if (/setState|reset/.test(kind)) return false
  if (isHydrate(state, 'init') && /before/.test(name)) return false
  if (isServer() && /onLeave|onEnter/.test(name)) return false
  if (isHydrate(state, 'load') && name === 'thunk') return false
  if (name === 'beforeLeave' && state.kind === 'init') return false
  if (name === 'onLeave' && state.kind === 'load') return false

  return name === 'onError' && route.onError ? errorReturn : regularReturn
}

// If for instance, you wanted to allow each route to decide
// whether to skip options callbacks, here's a simple way to do it:
//
// return {
//   options: !route.skipOpts, // if true, don't make those calls
//   route: true
// }
//
// You also could choose to automatically trigger option callbacks only as a fallback:
//
// return {
//   options: !route[name],
//   route: !!route[name]
// }
