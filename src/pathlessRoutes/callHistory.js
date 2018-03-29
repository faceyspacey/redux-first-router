export default ({ history, has, dispatch, ctx, tmp, action: { payload } }) => {
  const env = process.env.NODE_ENV

  if (env === 'development' && !has('pathlessRoute')) {
    throw new Error('[rudy] "pathlessRoute" middleware is required to use history action creators.')
  }

  const { method, args } = payload

  if (ctx.busy && !tmp.committed && method === 'set') {
    throw new Error('[rudy] "set" cant be used before enter -- redirect instead')
  }

  const action = history[method](...args, false)

  return dispatch(action)
}

