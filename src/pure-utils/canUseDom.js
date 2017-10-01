import isServer from './isServer'

export default typeof !isServer() &&
  window.document &&
  window.document.createElement
