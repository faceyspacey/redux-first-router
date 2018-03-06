import { isAction } from './index'

export default (obj, req) => {
  const action = isAction(obj)
    ? obj
    : typeof obj === 'string' && isType(obj, req)
      ? { type: obj }
      : { payload: obj }

  action.type = action.type ||
    (req.tmp.committed ? `${req.type}_COMPLETE` : `${req.type}_DONE`)

  return action
}

const isType = (str, req) => {
  if (req.routes[str]) return true
  if (typeRegex.test(str)) return true
  if (str.indexOf('@@') === 0) return true

  return false
}

const typeRegex = /^[A-Z0-9_/]+$/
