import { createPrev } from '../../../core'
import { nestAction } from './index'

// for specialty `history.reset` and `history.jump` methods/actionCreators, we gotta jump through a few
// hoops to reconcile actions and state to match what would be logical. The below code in combination with
// History.js re-creates the previous entry based on which direction (back or next) was determined to be going.

export default (req) => {
  const { location, manualKind } = req.action

  const curr = req.getLocation()
  const { entries, index } = location
  const i = findPrevIndex(index, manualKind, curr.direction)
  const prev = entries[i] ? createPrevState(req, i, location) : createPrev()
  const from = manualKind === 'replace' ? curr : from

  req.action = nestAction(req, req.action, prev, from)          // replace history-triggered action with real action intended for reducers

  return req
}

// find previous location entry based on the desired direction to pretend to be going
const findPrevIndex = (index, kind, currDirection) => {
  if (kind === 'replace' && currDirection === 'forward') return index - 1
  return kind === 'next' ? index - 1 : index + 1
}

const createPrevState = (req, index, { length, entries }) => {
  const { location, ...action } = entries[index]
  action.location = { ...location, kind: 'push', index, length, entries }
  const act = nestAction(req, action) // build the action for that entry, and create what the resulting state shape would have looked like
  return Object.assign({}, act, act.location) // do what the location reducer does where it maps `...action.location` flatly on to `action`
}

