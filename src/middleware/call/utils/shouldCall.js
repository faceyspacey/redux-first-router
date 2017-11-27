import { isClientLoadSSR as isLoadSSR, isServer } from '../../../utils'

export default (req, name, config) => {
  const state = req.getLocation()

  if (req.action.location && /setState|reset/.test(req.action.location.kind)) return false
  if (isLoadSSR(state, 'init') && /beforeLeave|beforeEnter/.test(name)) return false
  if (isServer() && /onLeave|onEnter/.test(name)) return false
  if (isLoadSSR(state) && name === 'thunk') return false
  if (name === 'beforeLeave' && state.kind === 'init') return false
  if (name === 'onLeave' && state.kind === 'load') return false

  return true
}
