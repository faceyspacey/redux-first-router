// @flow
import type { LocationState } from '../../../flow-types'
import { isHydrate, isServer } from '../../../utils'

const regularReturn = { route: true, options: true }
const errorReturn = { route: true, options: false }

export default (name, route, req) => {
  if (!route[name] && !req.options[name]) return false

  if (isHydrate(req) && name !== 'onEnter') return false
  if (isServer() && /beforeLeave|onLeave|onEnter/.test(name)) return false

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
