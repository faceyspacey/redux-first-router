// @flow

export default (type: string): string => {
  const i: number = type.lastIndexOf('/')
  return type.substr(0, i)
}
