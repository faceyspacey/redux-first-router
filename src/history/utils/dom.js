const POP_EVENT = 'popstate'
const HASH_EVENT = 'hashchange'

const addEventListener = (node, event, listener) =>
  node.addEventListener
    ? node.addEventListener(event, listener, false)
    : node.attachEvent(`on${event}`, listener)

const removeEventListener = (node, event, listener) =>
  node.removeEventListener
    ? node.removeEventListener(event, listener, false)
    : node.detachEvent(`on${event}`, listener)

// HAS-SUPPORT UTILS:

export const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
)

/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */
let _hasHistory
export const supportsHistory = () => {
  if (typeof _hasHistory !== 'undefined') return _hasHistory

  const ua = window.navigator.userAgent

  if (
    (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
    ua.indexOf('Mobile Safari') !== -1 &&
    ua.indexOf('Chrome') === -1 &&
    ua.indexOf('Windows Phone') === -1
  ) {
    return false
  }

  return (_hasHistory = window.history && 'pushState' in window.history)
}

/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */
const supportsPopStateOnHashChange = () =>
  window.navigator.userAgent.indexOf('Trident') === -1

/**
 * Returns true if a given popstate event is an extraneous WebKit event.
 * Accounts for the fact that Chrome on iOS fires real popstate events
 * containing undefined state when pressing the back button.
 */
export const isExtraneousPopstateEvent = event =>
  event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1

let _hasSessionStorage
export const hasSessionStorage = () => {
  if (typeof _hasSessionStorage !== 'undefined') return _hasSessionStorage

  try {
    window.sessionStorage.setItem('hasStorage', 'yes')
    return (_hasSessionStorage =
      window.sessionStorage.getItem('hasStorage') === 'yes')
  }
  catch (error) {
    return (_hasSessionStorage = false)
  }
}

// LISTENING UTILS:

let listenerCount = 0

export const createPopListenerFuncs = (onPop, onHash) => {
  const useHash = !supportsPopStateOnHashChange()

  const toggleListeners = delta => {
    listenerCount += delta

    if (listenerCount === 1) {
      addEventListener(window, POP_EVENT, onPop)
      if (useHash) addEventListener(window, HASH_EVENT, onHash)
    }
    else if (listenerCount === 0) {
      removeEventListener(window, POP_EVENT, onPop)
      if (useHash) removeEventListener(window, HASH_EVENT, onHash)
    }
  }

  return {
    _addPopListener: () => toggleListeners(1),
    _removePopListener: () => toggleListeners(-1)
  }
}

