import isRedirect from './isRedirect'

const noOp = function() {}

export default (action, redirectFunc = noOp) => {
  if (isRedirect(action)) {
    const url = action.location.url
    const status = action.location.status || 302
    redirectFunc(status, url, action)
    return true
  }
}
