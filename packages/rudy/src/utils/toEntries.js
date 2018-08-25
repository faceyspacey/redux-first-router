// @flow
import { toAction } from './index'
import type { Route } from '../flow-types'

export default (
  api: Route,
  entries: Array<mixed>,
  index: number,
  n: ?number,
) => {
  entries = isSingleEntry(entries) ? [entries] : entries
  entries = entries.length === 0 ? ['/'] : entries
  entries = entries.map((e) => toAction(api, e))

  index = index !== undefined ? index : entries.length - 1 // default to head of array
  index = Math.min(Math.max(index, 0), entries.length - 1) // insure the index is in range

  n = n || findInitialN(index, entries) // initial direction the user is going across the history track

  return { n, index, entries }
}

// When entries are restored on load, the direction is always forward if on an index > 0
// because the corresponding entries are removed (just like a `push`), and you are now at the head.
// Otherwise, if there are multiple entries and you are on the first, you're considered
// to be going back, but if there is one, you're logically going forward.

export const findInitialN = (index: number, entries: Array<mixed>) =>
  index > 0 ? 1 : entries.length > 1 ? -1 : 1
const isSingleEntry = (e) =>
  !Array.isArray(e) ||
  // $FlowFixMe
  (typeof e[0] === 'string' && typeof e[1] === 'object' && !e[1].type) // pattern match: [string, state]
