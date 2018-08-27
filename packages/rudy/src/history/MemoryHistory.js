// @flow
import History from './History'
import { restoreHistory, saveHistory, supportsSession } from './utils'
import { toEntries } from '../utils'

// Even though this is used primarily in environments without `window` (server + React Native),
// it's also used as a fallback in browsers lacking the `history` API (<=IE9). In that now rare case,
// the URL won't change once you enter the site, however, if you forward or back out of the site
// we restore entries from `sessionStorage`. So essentially the application behavior is identical
// to browsers with `history` except the URL doesn't change.

// `initialEntries` can be:
// [path, path, etc] or: path
// [action, action, etc] or: action
// [[path, state, key?], [path, state, key?], etc] or: [path, state, key?]
// or any combination of different kinds

export default class MemoryHistory extends History {
  _restore() {
    const { options: opts } = this
    const { initialIndex: i, initialEntries: ents, initialN: n } = opts
    const useSession = supportsSession() && opts.testBrowser !== false

    opts.restore = opts.restore || (useSession && restoreHistory)
    opts.save = opts.save || (useSession && saveHistory)

    return opts.restore ? opts.restore(this) : toEntries(this, ents, i, n) // when used as a browser fallback, we restore from sessionStorage
  }
}
