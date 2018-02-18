import { isRedirect } from '../utils'

export default (middlewares, curryArg, killOnRedirect = false) => {
  const pipeline = curryArg
    ? middlewares.map(middleware => middleware(curryArg))
    : middlewares

  return (req) => {
    let index = -1 // last called middleware #
    let result

    return dispatch(0)

    function dispatch(i, ...args) {
      if (req.redirect && killOnRedirect) { // short-circuit, dont call next middleware
        return Promise.resolve(result)
      }

      if (req.cancelled) {
        return Promise.resolve(false) // short-circuit, dont call next middleware
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

        const retrn = prom.then(res => {
          if (res) {
            delete res._dispatched // delete these temporary flags so user doesn't see them (used for `autoDispatch` feature)
          }

          // return value of redirect (resolution of next pipeline), but if value returned from callback, return that instead
          if (req.redirect && killOnRedirect) {
            return result = result !== undefined
              ? result // as below in the standard use-case, this insures last middleware dictates return
              : res === req.action
                ? req.redirect // `transformAction` + `enter` middleware return original action dispatched, but we never want to return that value of the action redirected from
                : res !== undefined ? res : req.redirect // usually the result returned will be the result of the pipeline redirected to, but we honor explicit different returns (`res`)
          }

          // another route changing pipeline was started, canceling this one (see top of `core/createRequest.js`)
          if (req.cancelled) {
            return false
          }

          // middleware terminates piepline, and now there is no longer a "pending" route change
          if (res === false) {
            req.ctx.pending = false
          }

          result = result !== undefined ? result : res // insure last middleware return stays the final return of `dispatch` after chain rewinds
          return i === 0 ? result : res // but allow middleware calls to `next` to be returned regular return of next middleware
        })

        return retrn
      }
      catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
