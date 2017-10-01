// @flow

export default (prom: any): boolean =>
  prom && typeof prom === 'object' && typeof prom.then === 'function'
