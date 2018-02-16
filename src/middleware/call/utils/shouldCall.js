// @flow
import type { LocationState } from '../../../flow-types'
import { isHydrate, isServer } from '../../../utils'

export default (name, route, req) => {
  if (!route[name] && !req.options[name]) return false

  // skip callbacks (beforeEnter, thunk, etc) called on server, which produced initialState
  if (isHydrate(req) && !/onEnter|onError/.test(name)) return false

  // dont allow these client-centric callbacks on the server
  if (isServer() && /onEnter|Leave/.test(name)) return false

  return allowBoth
}

const allowBoth = { route: true, options: true }

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
