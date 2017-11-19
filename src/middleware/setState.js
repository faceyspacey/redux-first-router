import { SET_STATE } from '../index'
import formatRoutes from '../utils/formatRoutes'

export default (api) => (req, next) => {
  if (req.action && req.action.type === SET_STATE) {
    const { commit, nextHistory } = api.history.setState(req.action.state)
    commit()
    req.action.state = nextHistory.location.state
    return req.commitDispatch(req.action)
  }

  return next()
}

