import { isAction } from './index'

export default (obj, req) => {
  const action = isAction(obj) ? obj : { payload: obj }
  action.type = action.type || `${req.action.type}_COMPLETE`
  return action
}
