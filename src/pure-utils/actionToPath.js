import pathToRegexp from 'path-to-regexp'


export default function actionToPath(action, routesDict) {
  const route = routesDict[action.type]
  const path = typeof route === 'object' ? route.path : route
  const params = typeof route === 'object' ? _parseParams(route, action.payload) : action.payload

  return pathToRegexp.compile(path)(params || {})
}


// eg: {route: '/page/:param'}
function _parseParams(route, params = {}) {
  if (route.capitalizedWords === true) {
    params = Object.keys(params).reduce((sluggifedParams, key) => {
      if (typeof params[key] === 'string') {
        sluggifedParams[key] = params[key].replace(/ /g, '-').toLowerCase()
      }
      else if (typeof params[key] === 'number') {
        sluggifedParams[key] = params[key]
      }

      return sluggifedParams
    }, {})
  }
  else if (typeof route.toPath === 'function') {
    params = Object.keys(params).reduce((sluggifedParams, key) => {
      sluggifedParams[key] = route.toPath(params[key], key)
      return sluggifedParams
    }, {})
  }

  return params
}
