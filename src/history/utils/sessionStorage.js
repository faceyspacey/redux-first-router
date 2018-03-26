import { supportsSession, supportsHistory } from './index'
import { urlToAction } from '../../utils'

// API:

// Below is the facade around both `sessionStorage` and our "history as storage" fallback.
//
// - `saveHistory` is  called every time the history entries or index changes
// - `restoreHistory` is called on startup obviously

// Essentially the idea is that if there is no `sessionStorage`, we maintain the entire
// storage object on EACH AND EVERY history entry's `state`. I.e. `history.state` on
// every page will have the `index` and `entries` array. That way when browsers disable
// cookies/sessionStorage, we can still grab the data we need off off of history state :)
//
// It's a bit crazy, but it works very well, and there's plenty of space allowed for storing
// things there to get a lot of mileage out of it. We store the minimum amount of data necessary.
//
// Firefox has the lowest limit of 640kb per entry. IE has 1mb and chrome has at least 10mb:
// https://stackoverflow.com/questions/6460377/html5-history-api-what-is-the-max-size-the-state-object-can-be


export const saveHistory = ({ index, entries }, out) => {
  entries = entries.map(e => [e.location.url, e.state, e.location.key])
  set({ index, entries, out })
}

export const restoreHistory = (api) => {
  const history = get() || initializeHistory()
  return format(history, api)
}

export const set = (v) => supportsSession() ? sessionSet(v) : historySet(v)

export const get = () => supportsSession() ? sessionGet() : historyGet()


// HISTORY FACADE:

export const pushState = (url) =>
  window.history.pushState({ id: sessionId() }, null, url) // insure every entry has the sessionId (callbe by `BrowserHistory`)

export const replaceState = (url) =>
  window.history.replaceState({ id: sessionId() }, null, url) // fallback simply overwrites state soon after, and doesnt use `id`

const historySet = (history) =>
  window.history.replaceState(history, null) // set on current entry

const historyGet = () => {
  const state = getHistoryState()
  return state.entries && state
}


// SESSION STORAGE FACADE:

// We use `history.state.id` to pick which "session" from `sessionStorage` to use in
// the case that multiple windows containing the app are open at the same time
let _id

const PREFIX = '@@rudy/'

const sessionId = () => _id = _id || createSessionId() // `MemoryHistory` used as a fallback for <=IE9 in the browser won't be able to have unique IDs

const createId = () => Math.random().toString(36).substr(2, 6)

const key = () => PREFIX + sessionId()

const sessionSet = (val) => window.sessionStorage.setItem(key(), JSON.stringify(val))

const sessionGet = () => { // exported for tests
  try {
    const json = window.sessionStorage.getItem(key())
    return JSON.parse(json)
  }
  catch (error) {} // ignore invalid JSON
}

const createSessionId = () => {
  if (!supportsHistory() || !supportsSession()) return 'id' // both are needed for unique IDs to serve their purpose

  const state = getHistoryState()

  if (!state.id) {
    state.id = createId()
    historySet(state)
  }

  return state.id
}


// HELPERS:

const initializeHistory = () => {
  const { pathname, search, hash } = window.location
  const url = pathname + search + hash
  const state = {}
  const key = '345678'
  const history = { n: 1, index: 0, entries: [[url, state, key]] } // default history saved on first load

  if (!supportsSession()) historySet(history) // call `history.replaceState` on first load to insure this entry has all the state
  return history
}

// We must remove entries after the index in case the user opened a link to
// another site in the middle of the entries stack and then returned via the
// back button, in which case the entries are gone for good, like a `push`.
//
// NOTE: if we did this on the first entry, we would break backing out of the
// site and returning (entries would be unnecessarily removed). So this is only applied to
// "forwarding out." That leaves one hole: if you forward out from the first entry, you will
// return and have problematic entries that should NOT be there. Then because of Rudy's
// automatic back/next detection, which causes the history track to "jump" instead of "push,"
// dispatching an action for the next entry would in fact make you leave the site instead
// of push the new entry! To circumvent that, use Rudy's <Link /> component and it will
// save the `out` flag (just before linking out) that insures this is addressed:
const format = (history, api) => {
  const { index, out, entries: ents } = history
  const ents2 = index > 0 || out ? ents.slice(0, index + 1) : ents
  const entries = ents2.map(([url, state, key]) => urlToAction(url, api, state, key))
  const n = getInitialN(index, entries)

  return { n, index, entries }
}

// When entries are restored on load, the direction is always forward if on an index > 0
// because the corresponding entries are removed (just like a `push`), and you are now at the head.
// Otherwise, if there are multiple entries and you are on the first, you're considered
// to be going back, but if there is one, you're logically going forward.
export const getInitialN = (index, entries) =>
  index > 0 ? 1 : (entries.length > 1 ? -1 : 1)

// IE11 sometimes throws when accessing `history.state`:
//
// - https://github.com/ReactTraining/history/pull/289
// - https://github.com/ReactTraining/history/pull/230#issuecomment-193555362
//
// The issue occurs:
// A) when you refresh a page that is the only entry and never had state set on it,
// which means it wouldn't have any state to remember in the first place
//
// B) in IE11 on load in iframes, which also won't need to remember state, as iframes
// usually aren't for navigating to other sites (and back). But this may just be issue A)
//
// ALSO NOTE: this would only matter when using our history state fallback, as we don't use
// `history.state` with `sessionStorage`, with one exception: `state.id`. The `id` is used for
// a single edge case: having multiple windows open--see the below comment for why.
const getHistoryState = () => {
  try {
    return window.history.state || {}
  }
  catch (e) {
    return {}
  }
}
