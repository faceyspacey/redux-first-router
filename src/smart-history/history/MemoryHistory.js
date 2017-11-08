import History from './History'
import { restoreHistory, saveHistory } from '../utils/sessionStorage'
import { transformEntry, stripSlashes } from '../utils/path'

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
      initialEntries: ents,
      initialIndex = 0,
      basename: bn,
      forceRefresh = false,
      useSessionStorage = false,
      hasBrowserHistory = false
    } = opts

    const basename = bn ? stripSlashes(bn) : ''
    opts.basename = basename

    const initialEntries = !Array.isArray(ents) ? [ents] : ents || ['/']

    const { index, entries, saveHistory } = !useSessionStorage
      ? create(initialIndex, initialEntries, basename) // this happens 99% of the time
      : restore(initialEntries, basename) // only used when in browser environment

    super({ index, entries, basename, saveHistory })

    this._forceRefresh = forceRefresh
    this._hasBrowserHistory = hasBrowserHistory
  }

  _pushState(location) {
    if (typeof window === 'undefined') return

    const href = this._createHref(location)

    if (this._hasBrowserHistory) {
      const { key, state } = location
      window.history.replaceState({ key, state }, null, href)
    }
    else if (this._forceRefresh) {
      window.location.href = href
    }
  }

  _replaceState(location) {
    if (typeof window === 'undefined') return Promise.resolve()

    const href = this._createHref(location)

    if (this._hasBrowserHistory) {
      const { key, state } = location
      window.history.replaceState({ key, state }, null, href)
    }
    else if (this._forceRefresh) {
      window.location.href = href
    }

    return Promise.resolve()
  }
}

// UTILS:

// TRANSFORM ENTRIES ARRAY INTO PROPER LOCATION OBJECTS + INDEX

const create = (initialIndex, initialEntries, basename, createKey) => {
  const index = Math.min(Math.max(initialIndex, 0), initialEntries.length - 1)
  const entries = initialEntries.map(e => transformEntry(e, basename, createKey))
  return { index, entries }
}

// RE-HYDRATE FROM SESSION_STORAGE:
// This is hopefully hardly ever triggered, but it's just an extra frill to make things
// as solid as possible in older browsers. Basically, IE9 and IE8 won't have `history`
// but will have `sessionStorage`, so why not give them the ability to restore history :)

const restore = (initialEntries, basename, createKey) => {
  const entry = initialEntries[0]
  const defaultLocation = transformEntry(entry, basename, createKey)
  const { index, entries } = restoreHistory(defaultLocation) // impure
  return { index, entries, saveHistory }
}
