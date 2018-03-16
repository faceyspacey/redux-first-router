export default (req) => {
  const { action, routes, route, prevRoute } = req

  const t = (action && action.type) || '' // if errors are thrown before we have an action type
  const hasScene = t.indexOf('/NOT_FOUND') > -1
  const guessedScene = route.scene || prevRoute.scene

  const type = hasScene
    ? action.type
    : guessedScene && routes[`${guessedScene}/NOT_FOUND`] // try to interpret scene-level NOT_FOUND if available (note: links create plain NOT_FOUND actions)
      ? `${guessedScene}/NOT_FOUND`
      : 'NOT_FOUND'

  const url = routes[type].path || routes.NOT_FOUND.path
  return { type, url }
}

