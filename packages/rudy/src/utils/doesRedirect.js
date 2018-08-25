// @flow
import { isRedirect } from './index'
import type { LocationAction } from '../flow-types'

export default (
  action: LocationAction,
  redirectFunc: Function | Object,
): boolean => {
  if (isRedirect(action)) {
    const { url } = action.location
    const status = action.location.status || 302

    if (typeof redirectFunc === 'function') {
      redirectFunc(status, url, action)
    } else if (redirectFunc && typeof redirectFunc.redirect === 'function') {
      redirectFunc.redirect(status, url)
    }

    return true
  }

  return false
}
