// @flow

export default (bn: string = '') =>
  !bn ? '' : stripTrailingSlash(addLeadingSlash(bn))

const addLeadingSlash = (bn: string): string =>
  bn.charAt(0) === '/' ? bn : `/${bn}`

const stripTrailingSlash = (bn: string): string =>
  bn.charAt(bn.length - 1) === '/' ? bn.slice(0, -1) : bn
