// @flow

export default (a: any) =>
  a &&
  (a.type || a.payload || a.meta || a.params || a.query || a.state || a.hash)
