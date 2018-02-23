export default (req) => {
  const { ctx, action, has, dispatch } = req
  const env = process.env.NODE_ENV

  if (env === 'development' && !has('pathlessRoute')) {
    throw new Error('[rudy] "pathlessRoute" middleware is required to use "confirm" action creator.')
  }

  req._dispatched = true

  const { canLeave } = action.payload
  return ctx.confirm(canLeave)
}
