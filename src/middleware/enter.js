export default (api) => async (req, next) => {
  if (req.action.location) delete req.action.location.committed
  const ret = req.commitDispatch(req.action)
  req.commitHistory()
  req.tmp.committed = true
  await next()
  return ret
}
