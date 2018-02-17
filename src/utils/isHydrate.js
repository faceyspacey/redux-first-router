// @flow
import type { LocationState } from '../flow-types'
import { isServer } from './index'

export default (req): boolean => {
  const { kind, hasSSR } = req.getLocation()
  return !isServer() && /init|load/.test(kind) && req.ctx.busy && hasSSR
}

// `req.ctx.busy` is checked so pathlessRoutes (which are never busy unless
// nested within a route changing pipeline) call their thunks if used on
// the first route of the application

