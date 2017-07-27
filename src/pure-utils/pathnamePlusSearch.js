// @flow
type Location = {
  pathname: string,
  search?: string
}

export default ({ pathname, search }: Location) => {
  if (search) {
    if (search.indexOf('?') !== 0) {
      search = `?${search}`
    }

    return `${pathname}${search}`
  }

  return pathname
}
