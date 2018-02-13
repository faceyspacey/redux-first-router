export default (api) => async (req, next) => {
  if (req.route.redirectBeforeEnter) { // will exist if you specified `route.redirect`
    return req.route.redirectBeforeEnter(req)
  }

  const ret = req.commitDispatch(req.action)
  req.commitHistory()

  // req.ctx.pending = false
  req.tmp.committed = true

  await next()
  return ret
}
