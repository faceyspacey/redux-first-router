import { createPrevEmpty } from '../../../core'
import { nestAction } from './index'

// for specialty `history.reset` and `history.jump` methods/actionCreators, we gotta jump through a few
// hoops to reconcile actions and state to match what would be logical. The below code in combination with
// History.js re-creates the previous entry based on which direction (back or next) was determined to be going.

export default (req) => {
  const { location, manualKind } = req.action

  const prev = createPrevState(req, location) || createPrevEmpty()
  const from = manualKind === 'replace' && req.getLocation()

  req.action = nestAction(req, req.action, prev, from)          // replace history-triggered action with real action intended for reducers

  return req
}

const createPrevState = (req, { n, index: i, length, entries }) => {
  const index = i - n
  const entry = entries[index]

  if (!entry) return

  const { location, ...action } = entry
  action.location = { ...location, kind: 'push', index, length, entries, n }
  const act = nestAction(req, action) // build the action for that entry, and create what the resulting state shape would have looked like

  return Object.assign(act, act.location) // do what the location reducer does where it maps `...action.location` flatly on to `action`
}

