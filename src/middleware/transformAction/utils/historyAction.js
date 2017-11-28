import { createPrev } from '../../../core/createLocationReducer'
import { urlToAction, isNotFound } from '../../../utils'
import { nestAction, createNotFoundRoute } from './index'

export default (req, action, prev, basename) => {
  req.route = req.routes[action.type]

  const { nextHistory } = req.action

  if (isNotFound(action)) {
    req.action = action
    action.type = createNotFoundRoute(req, prev).type                      // type may have changed to scene-level NOT_FOUND
  }

  // for specialty `history.reset` and `history.jump` methods/actionCreators, we gotta jump through a few
  // hoops to reconcile actions and state to match what would be logical. The below code in combination with
  // History.js re-creates the previous entry based on which direction (back or next) was determined to be going.
  if (/jump|reset/.test(req.action.info)) {
    action.info = req.action.info // will === 'jump' || or 'reset' (used by `isDoubleDispatch` in this middleware and location reducer to allow processing)

    // find previous location entry based on the desired direction to pretend to be going
    const { entries, index, length, kind } = nextHistory
    const prevIndex = kind === 'back' ? index + 1 : index - 1
    const prevLocation = entries[prevIndex]
    const hasSSR = !!req.getLocation().hasSSR

    if (prevLocation) {
      // build the action for that entry, and create what the resulting state shape would have looked like
      const { routes, history, options: { querySerializer: qz } } = req
      const prevAction = urlToAction(prevLocation, routes, basename, qz)
      const state = nestAction(prevAction, {}, history, basename)

      // do what the location reducer does where it maps `...action.location` flatly on to `action`
      prev = Object.assign(state, state.location)
      prev.entries = action.info === 'reset' ? entries : history.entries // on reset, use next history's entries for previous state, or the entries may not match
      prev.length = length
      prev.index = prevIndex
      prev.hasSSR = hasSSR
      delete prev.location
      delete prev.prev
    }
    else prev = createPrev(hasSSR)
  }

  req.action = nestAction(action, prev, nextHistory, basename)          // replace history-triggered action with real action intended for reducers

  return req
}
