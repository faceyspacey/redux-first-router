import History from './History'
import { urlToAction } from '../utils'
import { restoreHistory, saveHistory, getInitialN, supportsSessionStorage } from './utils'

// Even though this is used primarily in environments without `window` (server + React Native),
// it's also used as a fallback in browsers lacking the `history` API (ie9). In that now rare case,
// the URL won't change once you enter the site, however, if you forward or back out of the site
// we restore entries from `sessionStorage`. So essentially the application behavior is identical
// to browsers with `history` except the URL doesn't change.

export default class MemoryHistory extends History {
  constructor(routes, opts = {}) {
    const { initialIndex = 0, initialEntries: ents = ['/'] } = opts
    const useSessionStorage = supportsSessionStorage() && opts.testBrowser !== false

    opts.saveHistory = opts.saveHistory || (useSessionStorage && saveHistory)
    opts.restoreHistory = opts.restoreHistory || (useSessionStorage && restore)

    const api = { routes, options: opts }
    const initialEntries = !Array.isArray(ents) ? [ents] : ents
    const { n, index, entries } = opts.restoreHistory
      ? opts.restoreHistory(api, initialIndex, initialEntries) // when used as a browser fallback, we restore from sessionStorage
      : create(api, initialIndex, initialEntries) // this happens 99% of the time in the browser

    super(routes, opts, { n, index, entries })
  }
}

const create = (api, initialIndex, initialEntries) => {
  const n = getInitialN(initialIndex, initialEntries) // initial direction the user is going across the history track
  const index = Math.min(Math.max(initialIndex, 0), initialEntries.length - 1)
  const entries = initialEntries.map(e => urlToAction(e, api))
  return { n, index, entries }
}

const restore = (api, initialIndex, initialEntries) => {
  const entry = initialEntries[0]
  const defaultLocation = urlToAction(entry, api)
  const { n, index, entries } = restoreHistory(defaultLocation, api) // impure
  return { n, index, entries }
}
