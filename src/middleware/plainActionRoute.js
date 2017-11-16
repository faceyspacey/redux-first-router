export default (api) => (req, next) => {
  if (req.route && req.route.action && !req.route.path && !req.route.thunk) {
    return req.commitDispatch(req.action)
  }

  return next()
}
