// @flow
import type { ComposeCurryArgs } from '../flow-types'

export default (
  middlewares: Function | Array<Function>,
  curryArg: ComposeCurryArgs,
  killOnRedirect: boolean = false,
) => {
  if (typeof middlewares === 'function') {
    return middlewares(curryArg, killOnRedirect) // accept custom function to do compose work below
  }

  const pipeline = curryArg
    ? middlewares.map((middleware) => middleware(curryArg))
    : middlewares

  return (req: Object): Promise<any> => {
    let index = -1 // last called middleware #
    let result

    return dispatch(0)

    function dispatch(i, ...args) {
      if (req.redirect !== undefined && killOnRedirect) {
        // short-circuit, dont call next middleware
        const ret = i === 0 && result !== undefined ? result : false
        return Promise.resolve(ret)
      }

      if (req.tmp.canceled) {
        // if a new request comes in before this one commits/enters, cancel it by not calling next middleware
        const ret = i === 0 && result !== undefined ? result : false
        req.history.canceled = req.action
        return Promise.resolve(ret) // short-circuit, dont call next middleware
      }

      // start standard work:

      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'))
      }

      index = i
      const fn = pipeline[i]

      if (!fn) return Promise.resolve(result)

      try {
        const next = (...args) => Promise.resolve(dispatch(i + 1, ...args))
        const prom = Promise.resolve(fn(req, next, ...args)) // insure middleware is a promise

        return prom.then((res) => {
          if (res) {
            delete res._dispatched // delete these temporary flags so user doesn't see them (used for `autoDispatch` feature)
          }

          // return value of redirect (resolution of next pipeline), but if value returned from callback, return that instead
          if (req.redirect !== undefined && killOnRedirect) {
            return (result =
              result !== undefined
                ? result // as below in the standard use-case, this insures last middleware dictates return
                : res === req.action
                  ? req.redirect // `transformAction` + `enter` middleware return original action dispatched, but we never want to return that value of the action redirected from
                  : res !== undefined
                    ? res
                    : req.redirect) // usually the result returned will be the result of the pipeline redirected to, but we honor explicit different returns (`res`)
          }

          // if a middleware return `false`, the pipeline is terminated and now there is no longer a "pending" route change
          if (res === false && !req.tmp.committed) {
            const newRequestCameIn = req.ctx.pending !== req
            req.ctx.pending = newRequestCameIn ? req.ctx.pending : false // preserve potential incoming request that came in during async callback that returned false, otherwise indicate the initial request is no longer pending

            // call window.history.go(-1 | 1) to go back to URL/route whose `beforeLeave` returned `false`
            // NOTE: this is also used by redirects back to the current route (see `middleware/call/index.js`)
            if (req.tmp.revertPop) req.tmp.revertPop()
          }

          result = result !== undefined ? result : res // insure last middleware return stays the final return of `dispatch` after chain rewinds
          return i === 0 ? result : res // but allow middleware calls to `next` to be returned regular return of next middleware
        })
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
