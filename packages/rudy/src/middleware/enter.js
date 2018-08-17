import { isServer, redirectShortcut } from '../utils'

export default (api) => async (req, next) => {
  if (req.route.redirect) {
    return redirectShortcut(req)
  }

  const res = req.enter() // commit history + action to state

  // return early on `load` so rendering can happen ASAP
  // i.e. before `thunk` is called but after potentially async auth in `beforeEnter`
  if (req.getKind() === 'load' && !isServer() && api.resolveFirstRouteOnEnter) {
    setTimeout(() => {
      next().then(() => {
        req.ctx.busy = false
      })
    }, 0) // insure callbacks like `onEnter` are called after `ReactDOM.render`, which should immediately be called after dispatching `firstRoute()`

    // in `createRouter.js` this flag will indicate to keep the pipeline still "busy" so
    // that dispatches in `thunk` and other callbacks after `enter` are treated as redirects,
    // as automatically happens throughout the pipeline. It becomes unbusy in the timeout above.
    req.clientLoadBusy = true
    return res
  }

  return res.then(next).then(() => res)
}
