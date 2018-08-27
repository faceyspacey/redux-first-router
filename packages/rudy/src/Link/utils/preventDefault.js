// @flow

export default (e: SyntheticEvent<HTMLButtonElement>) =>
  e && e.preventDefault && e.preventDefault()
