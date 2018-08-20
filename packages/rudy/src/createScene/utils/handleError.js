// @flow
export default (o: Object, type: string, basename: ?string) =>
  o && o.error ? { type, basename, ...o } : { type, basename, error: o }
