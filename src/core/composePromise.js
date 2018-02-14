export default (middlewares, curryArg, killOnRedirect = false) => {
  const pipeline = curryArg
    ? middlewares.map(middleware => middleware(curryArg))
    : middlewares

  return (req) => {
    let index = -1 // last called middleware #
    let result

    return dispatch(0)

    function dispatch(i, ...args) {
      if (req.redirect && killOnRedirect) {
        return Promise.resolve(req.redirect)
      }

      if (req.cancelled) {
        return Promise.resolve(result)
      }

      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'))
      }

      index = i
      const fn = pipeline[i]

      if (!fn) return Promise.resolve()

      try {
        const next = (...args) => Promise.resolve(dispatch(i + 1, ...args))
        const prom = Promise.resolve(fn(req, next, ...args)) // insure middleware is a promise

        const retrn = prom.then(res => {
          if (req.redirect && killOnRedirect) {
            return req.redirect
          }

          if (req.ctx.cancelled) {
            return result
          }

          if (isFalse(res, result)) {
            return result = false
          }

          result = result || res
          return i === 0 ? result : res // return of dispatch is that of last middleware
        })

        if (req.firstRouteSPA && req.tmp.committed) {
          return result
        }

        return retrn
      }
      catch (err) {
        return Promise.reject(err)
      }
    }
  }
}

const isFalse = (a, b) => a === false || b === false
