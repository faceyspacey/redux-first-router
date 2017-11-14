export default ({ options }) => {
  const shouldTransition = options.shouldTransition

  options.shouldTransition = (action, api) => {
    if (typeof action === 'function') return true
    return shouldTransition(action, api)
  }

  return (req, next) => {
    if (typeof req.action === 'function') {
      req.isStandaloneThunk = true

      return Promise.resolve(req.action(req)).then(potentialAction => {
        if (potentialAction && !req.manuallyDispatched) {
          return req.store.dispatch(potentialAction)
        }

        return potentialAction
      })
    }

    return next()
  }
}

