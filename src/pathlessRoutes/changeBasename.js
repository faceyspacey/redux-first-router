export default ({ initialLocation, hasMiddleware, action, dispatch }) => {
  const env = process.env.NODE_ENV

  if (env === 'development' && !hasMiddleware('pathlessRoute')) {
    throw new Error('[rudy] "pathlessRoute" middleware is required to use "changeBasename" action creator without passing an action.')
  }

  const { type, params, query, state, hash } = initialLocation
  const { basename } = action.payload

  return dispatch({ type, params, query, state, hash, basename })
}
