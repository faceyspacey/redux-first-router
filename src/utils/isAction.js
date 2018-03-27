// @flow

export default (a: any) =>
  a &&
  (a.type
    || a.params || a.query || a.state || a.hash || a.basename
    || a.payload || a.meta)
