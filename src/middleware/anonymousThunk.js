export default ({ options }) => {
  const shouldTransition = options.shouldTransition

  options.shouldTransition = (action, api) => {
    if (typeof action === 'function') return true
    return shouldTransition(action, api)
  }

  return (req, next) => {
    if (typeof req.action !== 'function') return next()
    req._dispatched = false

    const thunk = req.action
    const thunkResult = Promise.resolve(thunk(req))

    return thunkResult.then(action => {
      return action && !req._dispatched
        ? req.dispatch(action)
        : action
    })
  }
}

