export default ({ cache, action, hasMiddleware }) => {
  const env = process.env.NODE_ENV

  if (env === 'development' && !hasMiddleware('pathlessRoute')) {
    throw new Error('[rudy] "pathlessRoute" middleware is required to use "clearCache" action creator.')
  }

  const { invalidator, options } = action.payload

  cache.clear(invalidator, options)
}
