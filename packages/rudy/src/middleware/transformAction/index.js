import { formatAction } from './utils'

export default () => (req, next) => {
  if (!req.route.path) return next()

  req.action = formatAction(req)

  if (req.isDoubleDispatch()) return req.handleDoubleDispatch() // don't dispatch the same action twice

  const { type, params, query, state, hash, basename, location } = req.action
  Object.assign(req, { type, params, query, state, hash, basename, location }) // assign to `req` for conevenience (less destructuring in callbacks)

  return next().then(() => req.action)
}
