// @flow

export default (type: string) => {
  const i = type.lastIndexOf('/')
  return type.substr(0, i)
}
