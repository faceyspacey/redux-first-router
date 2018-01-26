// @flow
import { isNotFound } from '../../utils'
import { getScene } from './index'
import { format } from '../../utils/formatRoutes'

export default (r, type, routes, formatRoute) => {
  const route = format(r, type, routes, formatRoute)

  route.scene = getScene(type)

  // set default path for NOT_FOUND actions if necessary
  if (!route.path && isNotFound(type)) {
    route.path = route.scene
      ? `/${r.scene.toLowerCase()}/not-found`
      : '/not-found'
  }

  return route
}
