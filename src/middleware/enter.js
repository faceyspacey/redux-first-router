export default async (req, next) => {
  const ret = req.commitDispatch(req.action)
  req.commitHistory()
  req.temp.committed = true
  await next()
  return ret
}
