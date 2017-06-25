// @flow

export default (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.navigator !== 'undefined' &&
  window.navigator.product === 'ReactNative'
