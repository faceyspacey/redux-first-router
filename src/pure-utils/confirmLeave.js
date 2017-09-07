// @flow

import pathToAction from './pathToAction'

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
let _removeConfirmBlocking
let _displayConfirmLeave

const clearBlocking = () => {
  _unblock && _unblock()
  _removeConfirmBlocking && _removeConfirmBlocking()
}

// This is the default `displayConfirmLeave` handler.
// It receives the message to display and a callback to call when complete.
// Pass `true` to the callback to proceed with leaving the current route.

const defaultDisplayConfirmLeave = (message, callback) => {
  const hasConfirm = typeof window !== 'undefined' && window.confirm

  if (!hasConfirm) {
    throw new Error('[rudy] environment requires `displayConfirmLeave` option')
  }

  const canLeave = window.confirm(message)

  callback(canLeave)
}

// createConfirm is called whenever you enter a route that has a `confirmLeave`
// option. It tells the history package to block via `history.block`, but
// to determine to do so based on our redux state-centric `confirm` handler.
// This handler is also returned for use in the middleware to block when
// leaving the current route via actions (i.e. as opposed to browser buttons)

export const createConfirm = (
  confirmLeave: ConfirmLeave,
  store: Store,
  selectLocationState: SelectLocationState,
  history: History,
  querySerializer?: QuerySerializer,
  removeConfirmBlocking: Function
) => {
  const confirm = (location: HistoryLocation | Location) => {
    const state = store.getState()
    const routesMap = selectLocationState(state).routesMap
    const pathname = location.pathname
    const action = pathToAction(pathname, routesMap, querySerializer)
    const response = confirmLeave(state, action)

    // we use the confirmLeave function manually in onBeforeChange, so we must
    // manually clear blocking that history.block would otherwise handle, plus
    // we remove additional onBeforeChange blocking via _removeConfirmBlocking
    if (!response) clearBlocking()
    return response
  }

  _unblock = history.block(confirm)
  _removeConfirmBlocking = removeConfirmBlocking

  return confirm
}

// confirmUI here is triggered only by onBeforeChange:

export const confirmUI = (message: string, store: Store, action: Action) => {
  const cb = canLeave => {
    if (canLeave) {
      clearBlocking()
      store.dispatch(action)
    }
  }

  _displayConfirmLeave(message, cb)
}

// below is the equivalent of confirmUI triggered by the history package
// via monkey patching :(
// Notice they both call `_displayConfirmLeave`.

export const setDisplayConfirmLeave = (
  displayConfirmLeave?: DisplayConfirmLeave
) => {
  _displayConfirmLeave = displayConfirmLeave || defaultDisplayConfirmLeave
}

const createBrowserHistory = require('history/createBrowserHistory').default

// essentially we are intercepting the options passed to `createBrowserHistory`
// and adding our own custom options which uses our own _displayConfirmLeave
// via closures, and insures you can provide a custom one as an RFR option:

require('history/createBrowserHistory').default = (options?: Object) =>
  createBrowserHistory({
    ...options,
    getUserConfirmation: (message, cb) => {
      _displayConfirmLeave(message, canLeave => {
        if (canLeave) clearBlocking()
        cb(canLeave)
      })
    }
  })

const createMemoryHistory = require('history/createMemoryHistory').default

require('history/createMemoryHistory').default = (options?: Object) =>
  createMemoryHistory({
    ...options,
    getUserConfirmation: (message, cb) => {
      _displayConfirmLeave(message, canLeave => {
        if (canLeave) clearBlocking()
        cb(canLeave)
      })
    }
  })
