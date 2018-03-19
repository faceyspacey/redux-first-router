// @flow
import { isNotFound, typeToScene, formatRoute } from '../../utils'

export default (r, type, routes, formatter) => {
  const route = formatRoute(r, type, routes, formatter)

  route.scene = typeToScene(type)

  // set default path for NOT_FOUND actions if necessary
  if (!route.path && isNotFound(type)) {
    route.path = route.scene
      ? `/${r.scene.toLowerCase()}/not-found`
      : '/not-found'
  }

  return route
}
