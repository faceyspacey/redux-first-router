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


/**
 * Returns true if a given popstate event is an extraneous WebKit event.
 * Accounts for the fact that Chrome on iOS fires real popstate events
 * containing undefined state when pressing the back button.
 */
export const isExtraneousPopstateEvent = event =>
  event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1


export const addPopListener = (onPop, onHash) => {
  const useHash = !supportsPopStateOnHashChange()

  addEventListener(window, 'popstate', onPop)
  if (useHash) addEventListener(window, 'hashchange', onHash)
}

export const removePopListener = (onPop, onHash) => {
  const useHash = !supportsPopStateOnHashChange()

  removeEventListener(window, 'popstate', onPop)
  if (useHash) removeEventListener(window, 'hashchange', onHash)
}

const addEventListener = (node, event, listener) =>
  node.addEventListener
    ? node.addEventListener(event, listener, false)
    : node.attachEvent(`on${event}`, listener)

const removeEventListener = (node, event, listener) =>
  node.removeEventListener
    ? node.removeEventListener(event, listener, false)
    : node.detachEvent(`on${event}`, listener)

/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */
const supportsPopStateOnHashChange = () =>
  window.navigator.userAgent.indexOf('Trident') === -1
