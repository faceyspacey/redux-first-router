export default (name, routes, options) => {
  for (const type in routes) {
    const route = routes[type]
    const cb = route[name]
    const callback = findCallback(name, routes, cb, route, options)
    if (callback) route[name] = callback
  }

  return routes
}

const findCallback = (name, routes, callback, route, options) => {
  if (typeof callback === 'function') {
    return callback
  }
  if (Array.isArray(callback)) {
    const callbacks = callback
    const pipeline = callbacks.map((cb) => (req, next) => {
      cb = findCallback(name, routes, cb, route)

      const prom = Promise.resolve(cb(req))
      return prom.then(complete(next))
    })

    const killOnRedirect = !!route.path
    return options.compose(
      pipeline,
      null,
      killOnRedirect,
    )
  }
  if (typeof callback === 'string') {
    const type = callback
    const inheritedRoute = routes[`${route.scene}/${type}`] || routes[type]
    const cb = inheritedRoute[name]
    return findCallback(name, routes, cb, inheritedRoute)
  }
  if (typeof route.inherit === 'string') {
    const type = route.inherit
    const inheritedRoute = routes[`${route.scene}/${type}`] || routes[type]
    const cb = inheritedRoute[name]
    return findCallback(name, routes, cb, inheritedRoute)
  }
}

const complete = (next) => (res) => next().then(() => res)
