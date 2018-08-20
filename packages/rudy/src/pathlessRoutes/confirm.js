// @flow
import type { Confirm } from '../flow-types'

export default (req: Confirm) => {
  const { ctx, action, has } = req
  const env = process.env.NODE_ENV

  if (env === 'development' && !has('pathlessRoute')) {
    throw new Error(
      '[rudy] "pathlessRoute" middleware is required to use "confirm" action creator.',
    )
  }

  req._dispatched = true

  const { canLeave } = action.payload
  return ctx.confirm(canLeave)
}
