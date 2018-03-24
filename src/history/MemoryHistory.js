import History from './History'
import { urlToAction } from '../utils'
import { restoreHistory, saveHistory, getInitialN } from './utils'

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

// B) ALSO: if there is `sessionStorage`, but no `history`, such as in IE9 + IE8, we'll
// also save and restore history from sessionStorage. So if you back off the site, you'll
// return right where you left, even if the URL isn't changing.


export default class MemoryHistory extends History {
  constructor(routes, opts = {}) {
    const {
      initialIndex = 0,
      initialEntries: ents = ['/'],
      useSessionStorage = false
    } = opts

    opts.restoreHistory = opts.restoreHistory || (useSessionStorage && restore)
    opts.saveHistory = opts.saveHistory || (useSessionStorage && saveHistory)

    const initialEntries = !Array.isArray(ents) ? [ents] : ents
    const { n, index, entries } = opts.restoreHistory
      ? opts.restoreHistory(routes, opts, initialIndex, initialEntries) // only used when in browser environment (as a fallback)
      : create(routes, opts, initialIndex, initialEntries) // this happens 99% of the time

    super(routes, opts, { n, index, entries })
  }
}

// UTILS:

// TRANSFORM ENTRIES ARRAY INTO PROPER LOCATION OBJECTS + INDEX

const create = (routes, opts, initialIndex, initialEntries) => {
  const n = getInitialN(initialIndex, initialEntries) // initial direction the user is going across the history track
  const index = Math.min(Math.max(initialIndex, 0), initialEntries.length - 1)
  const entries = initialEntries.map(e => urlToAction(e, routes, opts))
  return { n, index, entries }
}


// RE-HYDRATE FROM SESSION_STORAGE:
// This is hopefully hardly ever triggered, but it's just an extra frill to make things
// as solid as possible in older browsers. Basically, IE9 and IE8 won't have `history`
// but will have `sessionStorage`, so why not give them the ability to restore history :)

const restore = (routes, opts, initialIndex, initialEntries) => {
  const entry = initialEntries[0]
  const defaultLocation = urlToAction(entry, routes, opts)
  const { n, index, entries } = restoreHistory(defaultLocation, routes, opts) // impure
  return { n, index, entries }
}
