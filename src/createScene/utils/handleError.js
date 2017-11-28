
export default (o: Object, type: string, basename: ?string) =>
  o && o.error
    ? { type, ...o, location: { basename, ...o.location } }
    : { type, error: o, location: { basename } }

