import { formatAction } from './utils'

export default () => (req, next) => {
  if (!req.route.path) return next()
  if (req.getKind() === 'set') return req.enter() // skip callbacks + go straight to reducer + update browser history

  req.action = formatAction(req)

  if (req.isDoubleDispatch()) return req.handleDoubleDispatch() // don't dispatch the same action twice

  const { type, params, query, state, hash, basename, location } = req.action
  Object.assign(req, { type, params, query, state, hash, basename, location }) // assign to `req` for conevenience (less destructuring in callbacks)

  return next().then(() => req.action)
}
