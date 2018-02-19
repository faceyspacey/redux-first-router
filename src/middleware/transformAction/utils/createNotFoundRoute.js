import { isNotFound } from '../../../utils'

export default (req) => {
  const { action = {}, routes, route, prevRoute } = req

  // NOT_FOUND action dispatched by user
  if (isNotFound(action)) {
    const scene = route.scene || prevRoute.scene
    const type = action.type.indexOf('/NOT_FOUND') > -1
      ? action.type
      : scene && routes[`${scene}/NOT_FOUND`] // try to interpret scene-level NOT_FOUND if available (note: links create plain NOT_FOUND actions)
        ? `${scene}/NOT_FOUND`
        : 'NOT_FOUND'

    return {
      type,
      url: resolvePath(route, action.notFoundUrl, routes)
    }
  }

  // error thrown in transformAction (probably from actionToUrl)
  const scene = route.scene || prevRoute.scene
  const type = scene && routes[`${scene}/NOT_FOUND`]
    ? `${scene}/NOT_FOUND`
    : 'NOT_FOUND'

  return {
    type,
    url: resolvePath(routes[type], null, routes)
  }
}

const resolvePath = (route, urlOverride, routes) =>
  urlOverride || route.path || routes.NOT_FOUND.path
