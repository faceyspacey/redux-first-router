import { supportsSessionStorage } from './index'
import { urlToAction } from '../../utils'

// PREFIXING:

const PREFIX = '@@rudy/'

const prefixKey = key => PREFIX + getId() + key

// BASIC SESSIONSTORAGE WRAPPER METHODS:

const setItem = (key, val) => {
  window.sessionStorage.setItem(prefixKey(key), JSON.stringify(val))
}

export const getItem = key => {
  try {
    const json = window.sessionStorage.getItem(prefixKey(key))
    return JSON.parse(json)
  }
  catch (error) {
    // Ignore invalid JSON.
  }
}

const getSetItem = (key, val) => {
  const item = getItem(key)

  if (!item) {
    setItem(key, val)
  }

  return item || val
}


// PRIMARY FACADE METHODS:

// Below is the facade around both `sessionStorage` and our `history-storage` fallback.
// Essentially the idea is that if there is no `sessionStorage`, we maintain the entire
// storage object on EACH AND EVERY history entry's `state`. I.e. `history.state` on
// every page will have the `index` and `entries` array. That way when browsers disable
// cookies/sessionStorage, we can still grab the data we need off off of history state :)
//
// It's a bit crazy, but it works very well, and there's plenty of space allowed for storing
// things there to get a lot of mileage out of it. Firefox has the lowest limit of 640kb per
// entry. IE has 1mb and chrome has at least 10mb:
// https://stackoverflow.com/questions/6460377/html5-history-api-what-is-the-max-size-the-state-object-can-be

// called every time the history entries or index changes
export const saveHistory = ({ index, entries, forwardedOut }) => {
  entries = entries.map(e => [e.location.url, e.state, e.location.key])

  const history = forwardedOut
    ? { index, entries, forwardedOut } // used to patch an edge case, see `getIndexAndEntries` below
    : { index, entries }

  // here's the key aspect of the fallback. essentially we keep updating history state
  // via `replaceState` so every entry has everything that would be in `sessionStorage`
  if (!supportsSessionStorage()) {
    const state = getHistoryState()
    delete state.forwardedOut
    const newState = { ...state, history }

    window.history.replaceState(newState, null, window.location.href)
    return
  }

  setItem('history', history)
}

// called on startup
export const restoreHistory = (defaultLocation, api) => {
  const { state, location: { url, key } } = defaultLocation // used if first time visiting site during session
  const defaultHistory = { n: 1, index: 0, entries: [[url, state, key]] }

  if (!supportsSessionStorage()) {
    const state = getHistoryState()

    // we gotta of course call `replaceState` on first load as well
    // to insure this entry has all the state. The rest are handled by
    // `saveHistory` on navigation.
    if (!state.history) {
      const newState = { ...state, history: defaultHistory }
      window.history.replaceState(newState, null, window.location.href)
    }

    return getIndexAndEntries(state.history || defaultHistory, api)
  }

  // `getSet` simply sets the `defaultHistory` in `sessionStorage` if it's a fresh visitation
  return getIndexAndEntries(getSetItem('history', defaultHistory), api)
}

export const getHistoryState = () => {
  try {
    return window.history.state || {}
  }
  catch (e) {
    // IE 11 sometimes throws when accessing window.history.state
    // See: https://github.com/ReactTraining/history/pull/289
    // If you follow the links, you'll see the issue A) occurs when you refresh
    // a page that is the 1 and only entry in history, i.e. would never have any
    // state to remember in the first place; and B) is IE11 on load in iframes,
    // which also won't need to remember state, as iframes usually aren't for navigating
    // to other sites. IE11 should generally work fine when navigating to and from your site.
    return {}
  }
}

// this is a key one, as it sets the id in history.state for the first entry
// that way the `id` can be used to differentiate between different sessionStorages
// that could happen in the same tab if you manually enter another URL at your site.
// It's a bit complex, but basically we use an id from history state to discover
// multiple possible available sessionStorages lol. Yes, our ware is robust :)
export const getInitialHistoryState = () => {
  const currentState = getHistoryState()

  const id = (_id = currentState.id || createKey())
  const key = currentState.key || createKey()
  const newState = Object.assign({}, currentState, { id, key })
  window.history.replaceState(newState, null, window.location.href)

  return newState
}


// FACADE HELPERS:

const getIndexAndEntries = (history, api) => {
  let { index, entries, forwardedOut } = history

  // We must remove entries after the index in case the user opened a link to
  // another site in the middle of the entries stack and then returned via the
  // back button, in which case the entries are gone for good, like a `push`.
  // NOTE: we currently don't re-save the sliced array, as it will be saved
  // on any future change--because if the user, for example, refreshed, the
  // same thing would happen.
  //
  // EXCEPTION: if we did this on the first entry, we would break backing out of the
  // site and returning (entries would be unnecessarily removed). So this is only applied to
  // "forwarding out." That leaves one hole: if you forward out from the first entry, you will
  // return and have problematic entries that should NOT be there. Then because of Rudy's
  // automatic back/next detection, which causes the history track to "jump" instead of "push,"
  // dispatching an action for the next entry would in fact make you leave the site instead
  // of push the new entry! To circumvent that, use Rudy's <Link /> component and it will
  // set the `forwardedOut` flag (just before linking out) that insures this is addressed:
  if (index > 0 || forwardedOut) {
    entries = entries.slice(0, index + 1)
  }

  entries = entries.map(([url, state, key]) => urlToAction(url, api, state, key))
  const n = getInitialN(index, entries)
  return { n, index, entries }
}

let _id

const getId = () => {
  _id = _id || getHistoryState().id || 'id' // sessions when using memory history in the browser won't be able to have unique IDs
  return `${_id}/`
}

const createKey = () =>
  Math.random().toString(36).substr(2, 6)

// When entries are restored on load, the direction is always forward if on an index > 0
// because the corresponding entries are removed (just like a `push`), and you are now at the head.
//
// Otherwise, if there are multiple entries and you are on the first, you're considered
// to be going back, but if there is one, you're logically going forward.
export const getInitialN = (index, entries) =>
  index > 0 ? 1 : (entries.length > 1 ? -1 : 1)
