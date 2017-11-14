// @flow

export default (a: any) =>
  a && (a.type || a.payload || a.meta || a.query || a.state)
