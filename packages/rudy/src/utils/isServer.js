// @flow
/* global window */

export default (): boolean =>
  !(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
  )
