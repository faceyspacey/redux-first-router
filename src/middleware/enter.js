export default (req, next) => {
  const ret = req.dispatch(req.action)
  req.commit()
  req.setReturn(ret, false)
  return next()
}
