export default ({ options }) => {
  const shouldTransition = options.shouldTransition

  options.shouldTransition = (action, api) => {
    if (typeof action === 'function') return true
    return shouldTransition(action, api)
  }

  return (req, next) => {
    if (typeof req.action !== 'function') return next()

    const thunk = req.action
    const thunkResult = Promise.resolve(thunk(req))

    return thunkResult.then(
      (action) =>
        action && !action._dispatched ? req.dispatch(action) : action,
    )
  }
}
