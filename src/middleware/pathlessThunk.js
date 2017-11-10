export default (api) => (req, next) => {
  if (req.route && !req.route.path && typeof req.route.thunk === 'function') {
    req.action = req.commitDispatch(req.action)
    const res = req.route.thunk(req)
    return Promise.resolve(res).then(res => res || req.action)
  }

  return next()
}
