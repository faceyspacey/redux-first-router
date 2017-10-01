// @flow

import pathToAction from './pathToAction'
import isServer from './isServer'

import type {
  Action,
  Location,
  History,
  HistoryLocation,
  Store,
  ConfirmLeave,
  SelectLocationState,
  QuerySerializer,
  DisplayConfirmLeave
} from '../flow-types'

let _unblock
let _displayConfirmLeave
let _confirm

let _selectLocationState
let _history
let _querySerializer
let _extra

const clearBlocking = () => {
  _unblock && _unblock()
  _confirm = null
}

// 1) SET WHEN `connectRoutes` IS CALLED

export const setDisplayConfirmLeave = (
  displayConfirmLeave?: DisplayConfirmLeave,
  selectLocationState: SelectLocationState,
  history: History,
  querySerializer?: QuerySerializer,
  extra?: any
) => {
  _displayConfirmLeave = displayConfirmLeave || defaultDisplayConfirmLeave
  _selectLocationState = selectLocationState
  _history = history
  _querySerializer = querySerializer
  _extra = extra
}

// 2) SET WHEN `createHistory` IS CALLED
export const getUserConfirmation = (message: string, cb: boolean => void) => {
  _displayConfirmLeave(message, canLeave => {
    if (canLeave) clearBlocking()
    cb(canLeave)
  })
}

// 3) SET IN `onAfterChange` OF ROUTES THAT HAVE `confirmLeave` OPTION
// setConfirm is called whenever you enter a route that has a `confirmLeave`
// option. It tells the history package to block via `history.block`, but
// to determine to do so based on our redux state-centric `confirm` handler.
// This handler is also returned for use in the middleware to block when
// leaving the current route via actions (i.e. as opposed to browser buttons)

export const setConfirm = (store: Store, confirmLeave: ConfirmLeave) => {
  _confirm = (
    location: HistoryLocation | Location,
    historyAction: ?string,
    realAction?: Action
  ) => {
    const state = store.getState()
    const routesMap = _selectLocationState(state).routesMap
    const pathname = location.pathname
    const action = pathToAction(pathname, routesMap, _querySerializer)
    const message = confirmLeave(state, action, { action, ..._extra })

    // we use the confirmLeave function manually in onBeforeChange, so we must
    // manually clear blocking that history.block would otherwise handle, plus
    // we remove additional onBeforeChange blocking via _removeConfirmBlocking
    if (!message) {
      clearBlocking() // set to null so next route isn't blocked by confirmation dialog
    }
    else {
      if (realAction) confirmUI(message, store, realAction) // only called from middleware, not history
      return message // SKIP if there's a message to show in the confirm UI
    }
  }

  _unblock = _history.block(_confirm)
}

// 4 CALLED IN `onBeforeChange` WHEN LEAVING ROUTES THAT HAVE `confirmLeave` OPTION
export const showConfirm = (location: Location, action: Action) =>
  _confirm && _confirm(location, null, action)

// INTERNAL UTILITIES

// confirmUI here is triggered only by onBeforeChange:

const confirmUI = (message: string, store: Store, action: Action) => {
  const cb = canLeave => {
    if (canLeave) {
      clearBlocking()
      store.dispatch(action)
    }
  }

  _displayConfirmLeave(message, cb)
}

// This is the default `displayConfirmLeave` handler.
// It receives the message to display and a callback to call when complete.
// Pass `true` to the callback to proceed with leaving the current route.

const defaultDisplayConfirmLeave = (message, callback) => {
  const hasConfirm = !isServer() && window.confirm

  if (!hasConfirm) {
    throw new Error('[rudy] environment requires `displayConfirmLeave` option')
  }

  const canLeave = window.confirm(message)

  callback(canLeave)
}
