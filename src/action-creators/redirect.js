// @flow
import type { Action } from '../flow-types'


export default (action: Action) => {
  action.meta = action.meta || {}
  action.meta.location = action.meta.location || {}
  action.meta.location.redirect = 'true' // string satisfied flow type; if truthy, middelware replaces it with pathname
  return action
}
