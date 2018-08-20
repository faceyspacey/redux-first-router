// @flow
import { isNotFound, typeToScene, formatRoute } from '../../utils'
import type { RouteInput, Routes } from '../../flow-types'

export default (
  r: RouteInput,
  type: string,
  routes: Routes,
  formatter: ?Function,
) => {
  const route = formatRoute(r, type, routes, formatter)

  route.scene = typeToScene(type)
  // set default path for NOT_FOUND actions if necessary
  if (!route.path && isNotFound(type)) {
    route.path = route.scene
      ? // $FlowFixMe
        `/${r.scene.toLowerCase()}/not-found`
      : '/not-found'
  }

  return route
}
