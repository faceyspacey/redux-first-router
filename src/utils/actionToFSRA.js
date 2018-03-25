import { actionToUrl, urlToAction } from './index'

// Standard Rudy practice is to convert incoming actions to their full URL form (url + state)
// and then convert that to a complete Rudy FSRA ("flux standard routing action").
//
// The `transformAction` middleware does this, though without using this utility function.
// Instead `urlToAction` is called indirectly when the middleware calls `history.push/etc`.

export default (action, api) => {
  const { routes, options, getLocation } = api
  const curr = getLocation()
  const key = action.location && action.location.key // preserve existing key if existing action

  const { url, state } = actionToUrl(action, routes, options, curr)
  return urlToAction(url, routes, options, state, key, curr)
}
