export default (req) => {
  const { route, options } = req

  if (!route) {
    return options.autoDispatch === undefined ? true : options.autoDispatch
  }

  return route.autoDispatch !== undefined
    ? route.autoDispatch
    : (options.autoDispatch === undefined ? true : options.autoDispatch)
}
