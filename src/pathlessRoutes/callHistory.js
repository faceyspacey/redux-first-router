import { actionToUrl } from '../utils'
import { createLocation } from '../history/utils/location'

export default ({ action, history, routes, options, hasMiddleware, dispatch }) => {
  const env = process.env.NODE_ENV

  if (env === 'development' && !hasMiddleware('pathlessRoute')) {
    throw new Error('[rudy] "pathlessRoute" middleware is required to use history action creators.')
  }

  const { method, args } = action.payload
  let act

  if (method === 'setState') {
    return Promise.resolve(history.setState(...args, false)).then(act => {
      return dispatch(act)
    })
  }
  else if (method !== 'reset') {
    act = history[method](...args, false)
  }
  else {
    const [entries, index, kind] = args

    if (typeof entries[0] === 'object' && entries[0].type) {
      const locations = entries.map(action => {
        const url = actionToUrl(action, routes, options)
        return createLocation(url, action.state, undefined, undefined, action.basename)
      })

      act = history.reset(locations, index, kind, false)
    }
    else {
      act = history.reset(entries, index, kind, false)
    }
  }

  return dispatch(act)
}
