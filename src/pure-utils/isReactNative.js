// @flow
import isServer from './isServer'

export default (): boolean =>
  !isServer() &&
  typeof window.navigator !== 'undefined' &&
  window.navigator.product === 'ReactNative'
