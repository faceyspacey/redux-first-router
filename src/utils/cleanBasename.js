export default (bn) =>
  !bn ? '' : stripTrailingSlash(addLeadingSlash(bn))

const addLeadingSlash = bn =>
  bn.charAt(0) === '/' ? bn : `/${bn}`

const stripTrailingSlash = bn =>
  bn.charAt(bn.length - 1) === '/' ? bn.slice(0, -1) : bn
