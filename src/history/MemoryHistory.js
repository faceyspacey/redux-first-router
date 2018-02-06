import History from './History'

import {
  formatSlashes,
  transformEntry,
  restoreHistory,
  saveHistory
} from './utils'

// NOTE ON HISTORY STUBS:

// Even though this is used primarily in environments without `window`, it is also
// used as a fallback in browsers lacking the `history` api or `sessionStorage`.
//  The below methods quickly short-circuit if no `window`. Otherwise, they do some
// browsery stuff:

// IN BROWSER ENVIRONMENTS:
// A) If the browser has the `history` api, but you don't want to use our `history-storage` (see sessionStorage.js)
// solution, we maintain the correct URL in the address bar, but as a single entry! Via `replace`.
// This allows being able to refresh the URL, share the URL, but when it comes to going
// back and forth to it, you always leave the site immediately, rather than
// navigate through the array of entries. It's a "best possible" fallback to
// having to refresh or show no URL changes at all.

// B) The final fallback is simply refreshing the page as the standard `history` package
// would do (but from `createBrowserHistory`). User's can choose this /w `forceRefresh`.

// C) ALSO: if there is `sessionStorage`, but no `history`, such as in IE9 + IE8, we'll
// also save and restore history from sessionStorage. So if you back off the site, you'll
// return right where you left, even if the URL isn't changing.

export default class MemoryHistory extends History {
  constructor(opts = {}) {
    const {
      initialEntries: ents = ['/'],
      initialIndex = 0,
      basenames: bns = [],
      forceRefresh = false,
      useSessionStorage = false
    } = opts

    const basenames = bns.map(bn => formatSlashes(bn))
    const initialEntries = !Array.isArray(ents) ? [ents] : ents
    const { index, entries, saveHistory } = !useSessionStorage
      ? create(initialIndex, initialEntries, basenames) // this happens 99% of the time
      : restore(initialEntries, basenames) // only used when in browser environment (as a fallback)

    super({ index, entries, basenames, saveHistory })

    this._forceRefresh = forceRefresh
  }

  _pushState(location) {
    return this._replaceState(location)
  }

  _replaceState(location) {
    if (this._forceRefresh) {
      const href = this._createHref(location)
      window.location.href = href
    }

    return Promise.resolve()
  }

  _resetState(location) {
    return this._replaceState(location)
  }
}

// UTILS:

// TRANSFORM ENTRIES ARRAY INTO PROPER LOCATION OBJECTS + INDEX

const create = (initialIndex, initialEntries, basenames) => {
  const index = Math.min(Math.max(initialIndex, 0), initialEntries.length - 1)
  const entries = initialEntries.map(e => transformEntry(e, basenames))
  return { index, entries }
}

// RE-HYDRATE FROM SESSION_STORAGE:
// This is hopefully hardly ever triggered, but it's just an extra frill to make things
// as solid as possible in older browsers. Basically, IE9 and IE8 won't have `history`
// but will have `sessionStorage`, so why not give them the ability to restore history :)

const restore = (initialEntries, basenames) => {
  const entry = initialEntries[0]
  const defaultLocation = transformEntry(entry, basenames)
  const { index, entries } = restoreHistory(defaultLocation) // impure
  return { index, entries, saveHistory }
}
