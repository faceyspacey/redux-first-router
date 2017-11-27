import {
  enhanceRoutes,
  shouldCall as defaultShouldCall,
  isGlobalSkip,
  isAutoDispatch,
  complete,
  onError
} from './utils'

const noOp = () => Promise.resolve()
const isFalse = (a, b) => a === false || b === false

export default (name, config = {}) => (api) => {
  enhanceRoutes(name, api.routes)

  return (req, next = noOp) => {
    const shouldCall = req.options.shouldCall || defaultShouldCall
    if (!shouldCall(req, name, config)) return next()

    const { prevRoute, dispatch, options: opts } = req
    const { prev } = config
    const route = prev ? prevRoute : req.route
    const routeCb = (route && route[name]) || noOp
    const optsCb = isGlobalSkip(name, req, routeCb) ? noOp : opts[name] || noOp
    const needsErr = name === 'onError' && routeCb === noOp && optsCb === noOp
    const proms = needsErr ? onError(req) : [routeCb(req), optsCb(req)]

    req._dispatched = false                                 // `dispatch` used by callbacks will set this to `true` (see utils/createDispatch.js)

    return Promise.all(proms).then(([a, b]) => {
      if (isFalse(a, b)) return false
      const res = a || b

      if (res && !req._dispatched && isAutoDispatch(req)) { // if no dispatch was detected, and a result was returned, dispatch it automatically
        const action = res.type || res.payload ? res : { payload: res }
        action.type = action.type || `${req.action.type}_COMPLETE`

        return Promise.resolve(dispatch(action))
          .then(complete(next))
      }

      return complete(next)(res)
    })
  }
}
