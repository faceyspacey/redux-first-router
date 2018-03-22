export default ({ history, has, dispatch, action: { payload } }) => {
  const env = process.env.NODE_ENV

  if (env === 'development' && !has('pathlessRoute')) {
    throw new Error('[rudy] "pathlessRoute" middleware is required to use history action creators.')
  }

  const { method, args } = payload
  const action = history[method](...args, false)

  return dispatch(action)
}

