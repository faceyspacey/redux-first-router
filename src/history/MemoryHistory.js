import History from './History'
import { toAction } from '../utils'
import { restoreHistory, saveHistory, getInitialN, supportsSession } from './utils'

// Even though this is used primarily in environments without `window` (server + React Native),
// it's also used as a fallback in browsers lacking the `history` API (<=IE9). In that now rare case,
// the URL won't change once you enter the site, however, if you forward or back out of the site
// we restore entries from `sessionStorage`. So essentially the application behavior is identical
// to browsers with `history` except the URL doesn't change.

// `initialEntries` can be:
// [path, path, etc] or: path
// [action, action, etc] or: action
// [[path, state, key?], [path, state, key?], etc] or: [path, state, key?]

export default class MemoryHistory extends History {
  _restore() {
    const { options: opts } = this
    const { initialIndex: i = 0, initialEntries: ents = ['/'], initialN: n } = opts
    const useSession = supportsSession() && opts.testBrowser !== false

    opts.restore = opts.restore || (useSession && restoreHistory)
    opts.save = opts.save || (useSession && saveHistory)

    const entries = isSingleEntry(ents) ? [ents] : ents

    return opts.restore ? opts.restore(this) : this._create(i, entries, n) // when used as a browser fallback, we restore from sessionStorage
  }

  _create(i, ents, n) {
    const index = Math.min(Math.max(i, 0), ents.length - 1)
    const entries = ents.map(e => toAction(e, this))
    n = n || getInitialN(index, ents) // initial direction the user is going across the history track

    return { n, index, entries }
  }
}

const isSingleEntry = (e) => !Array.isArray(e) ||
  (typeof e[0] === 'string' && typeof e[1] === 'object' && !e[1].type) // pattern match: [string, state]
