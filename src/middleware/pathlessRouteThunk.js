import { call } from './index'
import composePromise from '../core/composePromise'

export default (api) => {
  const middlewares = [
    call('thunk', { skipOpts: true }),
    call('onComplete', { skipOpts: true })
  ]

  const pipelineBranch = composePromise(middlewares, api)

  return (req, next) => {
    if (req.route && !req.route.path && typeof req.route.thunk === 'function') {
      req.action = req.commitDispatch(req.action)

      const res = pipelineBranch(req)
      return Promise.resolve(res)
        .then(res => res || req.action)
    }

    return next()
  }
}
