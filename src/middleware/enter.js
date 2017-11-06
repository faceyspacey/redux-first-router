export default async (req, next) => {
  const ret = req.routeDispatch(req.action)
  req.commit()
  req.temp.committed = true
  await next()
  return ret
}
