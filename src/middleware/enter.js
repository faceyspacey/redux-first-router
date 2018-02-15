export default (api) => async (req, next) => {
  if (req.route.redirectBeforeEnter) { // will exist if you specified `route.redirect`
    return req.route.redirectBeforeEnter(req)
  }

  const res = req.commit()

  await next()
  return res
}
