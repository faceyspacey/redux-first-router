export default (api) => async (req, next) => {
  const ret = req.commitDispatch(req.action)
  req.commitHistory()
  req.tmp.committed = true
  await next()
  return ret
}
