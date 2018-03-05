import { isAction } from './index'

export default (obj, req) => {
  const action = isAction(obj)
    ? obj
    : typeof obj === 'string' && isType(obj, req)
      ? { type: obj }
      : { payload: obj }

  action.type = action.type ||
    (req.tmp.committed ? `${req.action.type}_COMPLETE` : `${req.action.type}_DONE`)

  return action
}

const isType = (str, req) => {
  if (req.routes[str]) return true
  // if (/[A-Z0-9]+/.test(str)) return true
  return false
}
