export default (middlewares, curryArg, handleRedirects = false) => {
  const pipeline = curryArg
    ? middlewares.map(middleware => middleware(curryArg))
    : middlewares

  return (req, next) => {
    let index = -1 // last called middleware #
    let result

    return dispatch(0)

    function dispatch(i) {
      if (req.redirect && handleRedirects) return Promise.resolve(req.redirect)

      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'))
      }

      index = i
      let fn = pipeline[i]

      if (!fn) return Promise.resolve()

      try {
        const next = () => Promise.resolve(dispatch(i + 1))
        const prom = Promise.resolve(fn(req, next)) // insure middleware is a promise

        return prom.then(res => {
          if (req.redirect && handleRedirects) return req.redirect
          if (isFalse(res, result)) return result = false
          return result = result || res
        })
      }
      catch (err) {
        return Promise.reject(err)
      }
    }
  }
}

const isFalse = (a, b) => a === false || b === false
