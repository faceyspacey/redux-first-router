export default ({ action, history, has, dispatch, getLocation }) => {
  const env = process.env.NODE_ENV

  if (env === 'development' && !has('pathlessRoute')) {
    throw new Error('[rudy] "pathlessRoute" middleware is required to use history action creators.')
  }

  const { method, args } = action.payload
  const act = /reset|push|replace/.test(method)
    ? history[method](...args, getLocation().basename, false)
    : history[method](...args, false)

  return dispatch(act)
}

