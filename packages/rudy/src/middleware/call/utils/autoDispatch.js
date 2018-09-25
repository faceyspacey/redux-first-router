export default (req, callback, route, name, isOptCb) =>
  Promise.resolve(callback(req)).then((res) =>
    tryDispatch(req, res, route, name, isOptCb),
  )

const tryDispatch = (req, res, route, name, isOptCb) => {
  if (res === false) return false
  const hasReturn = res === null || (res && !res._dispatched) // `res._dispatched` indicates it was manually dispatched

  if (hasReturn && isAutoDispatch(route, req.options, isOptCb)) {
    // if no dispatch was detected, and a result was returned, dispatch it automatically
    return Promise.resolve(req.dispatch(res))
  }

  return res
}

const isAutoDispatch = (route, options, isOptCb) =>
  isOptCb
    ? options.autoDispatch === undefined
      ? true
      : options.autoDispatch
    : route.autoDispatch !== undefined
      ? route.autoDispatch
      : options.autoDispatch === undefined
        ? true
        : options.autoDispatch
