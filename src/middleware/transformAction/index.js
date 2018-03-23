import { formatAction, isDoubleDispatch, handleDoubleDispatch } from './utils'

export default () => (req, next) => {
  if (!req.route.path) return next()

  req.action = formatAction(req)

  if (req.getKind() === 'setState') return req.enter()
  if (isDoubleDispatch(req)) return handleDoubleDispatch(req) // don't dispatch the same action twice

  const { type, params, query, hash, state, location } = req.action
  Object.assign(req, { type, params, query, hash, state, location }) // assign to `req` for conevenience (less destructuring in callbacks)

  return next().then(() => req.action)
}
