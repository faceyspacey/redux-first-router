// @flow

export default (e: SyntheticEvent) =>
  e && e.preventDefault && e.preventDefault()
