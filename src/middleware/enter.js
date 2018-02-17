import { isServer } from '../utils'

export default (api) => async (req, next) => {
  if (req.route.redirectBeforeEnter) { // will exist if you specified `route.redirect`
    return req.route.redirectBeforeEnter(req)
  }

  // if there is a redirect on load, the kind will become 'redirect'
  // but we preserve the `load` kind, so for example code like the below
  // code that depends on it is respected. The `state.from` key or `state.status`
  // should be used to be informed of redirects.
  if (req.getLocation().kind === 'init') {
    req.action.location.kind = 'load'
  }

  const res = req.commit() // commit history + action to state

  // return early on `load` so rendering can happen ASAP
  // i.e. before `thunk` is called but after potentially async auth in `beforeEnter`
  if (req.getKind() === 'load' && !isServer() && !api.resolveFirstRouteEarly) {
    next().then(() => {
      req.ctx.busy = false
    })

    // in `createRouter.js` this flag will indicate to keep the pipeline still busy
    // so that dispatches in `thunk` and other callbacks after `enter` are treated
    // as redirects, as automatically happens throughout the pipeline
    req.clientLoadBusy = true
    return res
  }

  return next().then(() => res)
}
