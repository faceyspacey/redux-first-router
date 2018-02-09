export default (api) => async (req, next) => {
  const ret = req.commitDispatch(req.action)

  req.commitHistory()
  // req.ctx.busy = false
  req.tmp.committed = true

  await next()
  return ret
}
