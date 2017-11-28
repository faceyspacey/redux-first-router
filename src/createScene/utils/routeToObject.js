// @flow
import { isNotFound } from '../../utils'
import { getScene } from './index'


export default (route, type) => {
  const r = typeof route === 'function'
    ? { thunk: route }
    : typeof route === 'string'
      ? { path: route }
      : route

  r.scene = getScene(type)

  // set default path for NOT_FOUND actions if necessary
  if (!r.path && isNotFound(type)) {
    r.path = r.scene ? `/${r.scene.toLowerCase()}/not-found` : '/not-found'
  }

  return r
}
