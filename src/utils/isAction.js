// @flow

export default (a: any) =>
  a &&
  (a.type
    || a.hasOwnProperty('state') // History uses actions with undefined states
    || a.params || a.query
    || a.hash !== undefined || a.basename !== undefined
    || a.payload || a.meta)
