import { isHydrate, isServer } from '../../../utils'

export default (req, name, config) => {
  const state = req.getLocation()
  const kind = req.action.location && req.action.location.kind

  if (/setState|reset/.test(kind)) return false
  if (isHydrate(state, 'init') && /before/.test(name)) return false
  if (isServer() && /onLeave|onEnter/.test(name)) return false
  if (isHydrate(state) && name === 'thunk') return false
  if (name === 'beforeLeave' && state.kind === 'init') return false
  if (name === 'onLeave' && state.kind === 'load') return false

  return true
}
