export default function routesDictToArray(routeNames, routes) {
  return routeNames.reduce((routesArray, key) => {
    routesArray.push(routes[key])
    return routesArray
  }, [])
}