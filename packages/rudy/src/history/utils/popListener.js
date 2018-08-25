// @flow
/* eslint-env browser */
export const addPopListener = (onPop: Function, onHash: Function) => {
  const useHash = !supportsPopStateOnHashChange()

  addEventListener(window, 'popstate', onPop)
  if (useHash) addEventListener(window, 'hashchange', onHash)
}

export const removePopListener = (onPop: Function, onHash: Function) => {
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

// Returns true if browser fires popstate on hash change. IE10 and IE11 do not.
const supportsPopStateOnHashChange = () =>
  window.navigator.userAgent.indexOf('Trident') === -1

/**
 * Returns true if a given popstate event is an extraneous WebKit event.
 * Accounts for the fact that Chrome on iOS fires real popstate events
 * containing undefined state when pressing the back button.
 */
export const isExtraneousPopEvent = (event: Object) =>
  event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1
