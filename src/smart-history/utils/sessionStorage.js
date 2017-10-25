import { createKey } from './location'
import { parsePath } from './path'

// PREFIXING:

const PREFIX = '@@History/'

const prefixKey = key => PREFIX + getId() + key

// BASIC SESSIONSTORAGE WRAPPER METHODS:

export const setItem = (key, val) => {
  window.sessionStorage.setItem(prefixKey(key), JSON.stringify(val))
}

export const removeItem = key => {
  window.sessionStorage.removeItem(prefixKey(key))
}

export const getItem = key => {
  try {
    const json = window.sessionStorage.getItem(prefixKey(key))
    return JSON.parse(json)
  }
  catch (error) {
    // Ignore invalid JSON.
  }

  return undefined
}

export const getSetItem = (key, val) => {
  const item = getItem(key)

  if (!item) {
    setItem(key, val)
  }

  return item || val
}

// HAS-SUPPORT UTIL:

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

// PRIMARY FACADE METHODS:

// Below is the facade around both `sessionStorage` and our `history-storage` fallback.
// essentially the idea is that if there is no `sessionStorage`, we maintain the entire
// storage object on each and every history entry's `state`. I.e. `history.state` on
// every page will have the `index` and `entries` array. That way when browsers disable
// cookies/sessionStorage, we can still grab the data we need off off of history state :)
//
// It's a bit crazy, but it works very well, and there's plenty of space allowed for storing
// things there to get a lot of mileage out of it. Firefox has the lowest limit of 640kb per
// entry. IE has 1mb and chrome has at least 10mb:
// https://stackoverflow.com/questions/6460377/html5-history-api-what-is-the-max-size-the-state-object-can-be

// called every time the history entries or index changes
export const saveHistory = ({ index, entries }) => {
  entries = entries.map(e => ({ url: e.url, key: e.key, state: e.state }))
  const history = { index, entries }

  // here's the key aspect of the fallback. essentially we keep updating history state
  // via `replaceState` so every entry has everything that would be in `sessionStorage`
  if (!hasSessionStorage()) {
    const state = getHistoryState()
    const newState = { ...state, history }
    window.history.replaceState(newState, null, window.location.href)
    return
  }

  setItem('history', history)
}

// called on startup
export const restoreHistory = defaultLocation => {
  const { url, key, state } = defaultLocation // used if first time visiting site during session
  const defaultHistory = { index: 0, entries: [{ url, key, state }] }

  if (!hasSessionStorage()) {
    const state = getHistoryState()

    // we gotta of course call `replaceState` on first load as well
    // to insure this entry has all the state. The rest are handled by
    // `saveHistory` on navigation.
    if (!state.history) {
      const newState = { ...state, history: defaultHistory }
      window.history.replaceState(newState, null, window.location.href)
    }

    return getIndexAndEntries(state.history || defaultHistory)
  }

  // `getSet` simply sets the `defaultHistory` in `sessionStorage` if it's a fresh visitation
  return getIndexAndEntries(getSetItem('history', defaultHistory))
}

// FACADE HELPERS:

const getIndexAndEntries = history => {
  let { index, entries } = history

  // We must remove entries after the index in case the user opened a link to
  // another site in the middle of the entries stack and then returned via the
  // back button, in which case the entries are gone for good, like a `push`.
  // NOTE: we currently don't re-save the sliced array, as it will be saved
  // on any future change--because if the user, for example, refreshed, the
  // same thing would happen.
  //
  // EXCEPTION: if we did this on the first entry, we would break backing out of the
  // site and returning. So this is only applied to essentially "forwarding out" of
  // the site. That leaves one hole: if you forward out from the first entry, you will
  // return and have dead entries (if you had additional entries). But this isn't really
  // a hole--because if you use the forward browser button to go forward, you in fact
  // leave the site. That leaves only one thing that can happen anyway: pushing new entries within your site.
  // Now, if you are using the `next` method manually, even if you check `canGo`,
  // you will think you can go to the next internal entry, but you will in fact send the
  // user to the next site lol. You aren't supposed to use that method, but with upcoming
  // web-based navigators, it may become more popular. When that happens, we'll do this for you:
  // set the below variable `__forwardedOut` to true before following links, by monkey-patching
  // `Event.prototype.preventDefault` to store this fact in `sessionStorage`, and then on load`,
  // set `window.__forwardedOut` to true. If you're OCD, you can do it in user-land now :)
  if (index > 0 || window.__forwardedOut) {
    entries = entries.slice(0, index + 1)
  }

  entries = entries.map(e => ({ ...e, ...parsePath(e.url) }))
  return { index, entries }
}

const createId = () =>
  Math.random()
    .toString(36)
    .substr(2, 6)

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

  const id = (_id = currentState.id || createId())
  const key = currentState.key || createKey()
  const newState = Object.assign({}, currentState, { id, key })
  window.history.replaceState(newState, null, window.location.href)

  return newState
}

let _id

const getId = () => {
  _id = _id || getHistoryState().id || 'id' // sessions when using memory history won't be able to have unique IDs
  return `${_id}/`
}
