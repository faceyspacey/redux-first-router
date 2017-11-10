import isLoadSSR from '../utils/isClientLoadSSR'
import isServer from '../utils/isServer'

const noop = () => Promise.resolve()
const isFalse = (a, b) => a === false || b === false

export default (name, config = {}) => (api) => async (req, next = noop) => {
  const shouldCall = req.options.shouldCall || defaultShouldCall
  if (!shouldCall(req, name, config)) return next()

  const { prev } = config
  const route = prev ? req.prevRoute : req.route
  const routeCb = (route && route[name]) || noop
  const globalCb = req.options[name] || noop
  const proms = [routeCb(req), globalCb(req)]

  return Promise.all(proms).then(([a, b]) => {
    if (isFalse(a, b)) return false
    const retrn = a || b

    if (retrn && typeof retrn === 'object' && !req.manuallyDispatched) {
      const action = retrn.type || retrn.payload ? retrn : { payload: retrn }
      action.type = action.type || req.action.type + '_COMPLETE'

      delete req.manuallyDispatched

      return Promise.resolve(req.dispatch(action))
        .then(res => next().then(() => res))
    }

    return next().then(() => retrn)
  })
}

const defaultShouldCall = (req, name, config) => {
  const state = req.locationState()

  if (isLoadSSR(state, 'init') && /beforeLeave|beforeEnter/.test(name)) return false
  if (isServer() && /onLeave|onEnter/.test(name)) return false
  if (isLoadSSR(state) && name === 'thunk') return false
  if (name === 'beforeLeave' && state.kind === 'init') return false
  if (name === 'onLeave' && state.kind === 'load') return false

  return true
}

