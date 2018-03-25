export default (path, stripLeading = false) => {
  if (!path) return ''

  return stripLeading
    ? stripTrailingSlash(stripLeadingSlash(path))
    : stripTrailingSlash(addLeadingSlash(path))
}

const addLeadingSlash = path =>
  path.charAt(0) === '/' ? path : `/${path}`

const stripLeadingSlash = path =>
  path.charAt(0) === '/' ? path.substr(1) : path

const stripTrailingSlash = path =>
  path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path
