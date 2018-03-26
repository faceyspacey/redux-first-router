import History from './History'
import { toAction } from '../utils'
import { restoreHistory, saveHistory, getInitialN, supportsSession } from './utils'

// Even though this is used primarily in environments without `window` (server + React Native),
// it's also used as a fallback in browsers lacking the `history` API (ie9). In that now rare case,
// the URL won't change once you enter the site, however, if you forward or back out of the site
// we restore entries from `sessionStorage`. So essentially the application behavior is identical
// to browsers with `history` except the URL doesn't change.

export default class MemoryHistory extends History {
  constructor(routes, opts = {}) {
    const { initialIndex = 0, initialEntries: ents = ['/'], initialN } = opts
    const useSession = supportsSession() && opts.testBrowser !== false

    opts.saveHistory = opts.saveHistory || (useSession && saveHistory)
    opts.restoreHistory = opts.restoreHistory || (useSession && restoreHistory)

    const api = { routes, options: opts }
    const initialEntries = !Array.isArray(ents) ? [ents] : ents
    const { n, index, entries } = opts.restoreHistory
      ? opts.restoreHistory(api) // when used as a browser fallback, we restore from sessionStorage
      : create(api, initialIndex, initialEntries, initialN) // this happens 99% of the time in the browser

    super(routes, opts, { n, index, entries })
  }
}

const create = (api, initialIndex, initialEntries, initialN) => {
  const index = Math.min(Math.max(initialIndex, 0), initialEntries.length - 1)
  const n = initialN || getInitialN(index, initialEntries) // initial direction the user is going across the history track
  const entries = initialEntries.map(e => toAction(e, api))
  return { n, index, entries }
}
