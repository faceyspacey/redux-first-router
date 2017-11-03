export default async (req, next) => {
  await fakeDelay()
  const ret = req.routeDispatch(req.action)
  req.commit()
  req.committed = true
  // req.setReturn(ret, false)
  await next()
  return ret
}

const fakeDelay = cb =>
  new Promise(resolve => {
    setTimeout(() => resolve(cb), 1)
  })
