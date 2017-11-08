import isRedirect from './isRedirect'

export default (action, redirectFunc) => {
  if (isRedirect(action)) {
    const url = action.meta.location.url
    const status = action.meta.location.status || 302
    redirectFunc(status, url)
    return true
  }
}
