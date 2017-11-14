export default (api) => (req, next) => {
  if (req.route && !req.route.path && typeof req.route.action === 'function') {
    return req.commitDispatch(req.action)
  }

  return next()
}
