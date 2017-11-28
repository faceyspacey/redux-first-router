import { call } from './index'
import composePromise from '../core/composePromise'

export default (api) => {
  const middlewares = [call('thunk'), call('onComplete')]
  const pipelineBranch = composePromise(middlewares, api)

  return (req, next) => {
    if (req.route && !req.route.path && typeof req.route.thunk === 'function') {
      if (req.route.skipGlobalCallbacks === undefined) {
        req.route.skipGlobalCallbacks = true // by default don't call global callbacks like we would for thunks on real routes
      }

      req.action = req.commitDispatch(req.action)

      const res = pipelineBranch(req)
      return Promise.resolve(res)
        .then(res => res || req.action)
    }

    return next()
  }
}
