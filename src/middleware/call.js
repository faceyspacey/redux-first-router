export default (name, { hasReturn, prev } = {}) => async (req, next) => {
  hasReturn = true

  const route = prev === 'prev' ? req.prevRoute : req.route
  const routeCb = route[name] || noop
  const globalCb = req.options[name] || noop

  const [a, b] = await Promise.all([routeCb(req), globalCb(req)])
  await next()

  return hasReturn ? a || b : undefined
}

const noop = function () {}
