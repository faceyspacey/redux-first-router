export default async (req, next) => {
  await fakeDelay()
  const ret = req.dispatch(req.action)
  req.commit()
  // req.setReturn(ret, false)
  await next()
  return ret
}

const fakeDelay = cb =>
  new Promise(resolve => {
    setTimeout(() => resolve(cb), 10)
  })
