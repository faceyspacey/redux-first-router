// @flow
import { isNotFound, typeToScene, formatRoute } from '../../utils'
import type { RouteInput, RoutesMap } from '../../flow-types'

export default (r: RouteInput, type: string, routes: RoutesMap, formatter: ?Function) => {
  const route = formatRoute(r, type, routes, formatter)

  route.scene = typeToScene(type)
  // set default path for NOT_FOUND actions if necessary
  if (!route.path && isNotFound(type)) {
    route.path = route.scene
      // TODO: find out where this needs to go / implement it into a type (Route?)
      // $FlowFixMe
      ? `/${r.scene.toLowerCase()}/not-found`
      : '/not-found'
  }

  return route
}
