import {
  toAction,
  toEntries,
  createActionRef,
  cleanBasename,
  isAction,
} from '../utils'
import { createPrevEmpty } from '../core/createReducer'

export default class History {
  constructor(routes, options = {}) {
    this.routes = routes
    this.options = options

    options.basenames = (options.basenames || []).map((bn) => cleanBasename(bn))

    const kind = 'load'
    const { n, index, entries } = this._restore() // delegate to child classes to restore
    const action = entries[index]
    const info = { kind, n, index, entries }
    const commit = function() {} // action already committed, by virtue of browser loading the URL

    this.firstAction = this._notify(action, info, commit, false)
  }

  // CORE:

  listen(dispatch, getLocation) {
    this.dispatch = dispatch
    this.getLocation = getLocation
    return () => this.unlisten()
  }

  unlisten() {
    this.dispatch = null
  }

  _notify(action, info, commit, notify = true, extras) {
    const { index, entries, n } = info
    const n2 =
      n || (index > this.index ? 1 : index === this.index ? this.n : -1)
    const { length } = entries

    action = {
      ...action,
      ...extras,
      commit: this._once(commit),
      location: { ...action.location, ...info, length, n: n2 },
    }

    if (notify && this.dispatch) return this.dispatch(action)
    return action
  }

  // LOCATION STATE GETTERS (single source of truth, unidirectional):

  get location() {
    return this.getLocation()
  }

  get entries() {
    return this.location.entries
  }

  get index() {
    return this.location.index
  }

  get url() {
    return this.location.url
  }

  get n() {
    return this.location.n
  }

  get prevUrl() {
    return this.location.prev.location.url
  }

  // API:

  push(path, state = path.state || {}, notify = true) {
    const action = toAction(this, path, state)
    const n = this._findAdjacentN(action) // automatically determine if the user is just going back or next to a URL already visited

    if (n) return this.jump(n, false, undefined, { state }, notify)

    const kind = n === -1 ? 'back' : n === 1 ? 'next' : 'push'
    const index = n === -1 ? this.index - 1 : this.index + 1
    const entries = this._pushToFront(action, this.entries, index, kind)
    const info = { kind, index, entries }
    const awaitUrl = this.url
    const commit = (action) => this._push(action, awaitUrl)

    return this._notify(action, info, commit, notify)
  }

  replace(path, state = path.state || {}, notify = true) {
    const action = toAction(this, path, state)
    const n = this._findAdjacentN(action) // automatically determine if the user is just going back or next to a URL already visited

    if (n) return this.jump(n, false, undefined, { state }, notify)

    const kind = n === -1 ? 'back' : n === 1 ? 'next' : 'replace'
    const { index } = this
    const entries = this.entries.slice(0)
    const info = { kind, entries, index }
    const currUrl = this.url
    const commit = (action) => this._replace(action, currUrl)

    entries[index] = action

    return this._notify(action, info, commit, notify)
  }

  jump(delta, byIndex = false, n, act, notify = true, revertPop) {
    delta = this._resolveDelta(delta, byIndex)
    n = n || (delta < 0 ? -1 : 1) // users can choose what direction to make the `jump` look like it came from

    const kind = delta === -1 ? 'back' : delta === 1 ? 'next' : 'jump' // back/next kinds are just more specifically named jumps
    const isMovingAdjacently = kind !== 'jump'
    const isPop = !!revertPop // passed by BrowserHistory's `handlePop`
    const index = this.index + delta
    const entries = this.entries.slice(0)

    if (!this.entries[index]) {
      throw new Error(`[rudy] jump() - no entry at index: ${index}.`)
    }

    const action = (entries[index] = this._transformEntry(
      this.entries[index],
      act,
    ))
    const info = { kind, index, entries, n }

    const currentEntry = isMovingAdjacently && this.entries[this.index] // for `replace` to adjacent entries we need to override `prev` to be the current entry; `push` doesn't have this issue, but their `prev` value is the same
    const prev = this._createPrev(info, currentEntry) // jumps can fake the value of `prev` state

    const currUrl = this.url
    const oldUrl = this.entries[index].location.url
    const commit = (action) => this._jump(action, currUrl, oldUrl, delta, isPop)

    return this._notify(action, info, commit, notify, { prev, revertPop })
  }

  back(state, notify = true) {
    return this.jump(-1, false, -1, { state }, notify)
  }

  next(state, notify = true) {
    return this.jump(1, false, 1, { state }, notify)
  }

  set(act, delta, byIndex = false, notify = true) {
    delta = this._resolveDelta(delta, byIndex)

    const kind = 'set'
    const { index } = this
    const i = this.index + delta
    const entries = this.entries.slice(0)

    if (!this.entries[i]) {
      throw new Error(`[rudy] set() - no entry at index: ${i}`)
    }

    const entry = (entries[i] = this._transformEntry(this.entries[i], act))
    const action = delta === 0 ? entry : createActionRef(this.location) // action dispatched must ALWAYS be current one, but insure it receives changes if delta === 0, not just entry in entries
    const info = { kind, index, entries }

    const oldUrl = delta === 0 ? this.url : this.entries[i].location.url // this must be the current URL for the target so that `BrowserHistory` url awaiting works, as the target's URL may change in `this._transformEntry`
    const commit = (action) => this._set(action, oldUrl, delta)

    if (i === this.location.prev.location.index) {
      action.prev = { ...entry, location: { ...entry.location, index: i } } // edge case: insure `state.prev` matches changed entry IF CHANGED ENTRY HAPPENS TO ALSO BE THE PREV
    }

    return this._notify(action, info, commit, notify)
  }

  replacePop(path, state = {}, notify = true, info) {
    const action = toAction(this, path, state)
    const { index, prevUrl, n } = info
    const entries = info.entries.slice(0)
    const kind = index < this.index ? 'back' : 'next'
    const newInfo = { kind, entries, index }

    const commit = (action) => this._replace(action, prevUrl, n)

    entries[index] = action

    return this._notify(action, newInfo, commit, notify)
  }

  reset(ents, i, n, notify = true) {
    if (ents.length === 1) {
      const entry = this._findResetFirstAction(ents[0]) // browser must always have at least 2 entries, so one can be pushed, erasing old entries from the stack
      ents.unshift(entry)
    }

    i = i !== undefined ? i : ents.length - 1

    n =
      n ||
      (i !== ents.length - 1
        ? i > this.index
          ? 1
          : i === this.index
            ? this.n
            : -1 // create direction relative to index of current entries
        : 1) // at the front of the array, always use "forward" direction

    const kind = 'reset'
    const { index, entries } = toEntries(this, ents, i, n)
    const action = { ...entries[index] }
    const info = { kind, index, entries, n }
    const oldUrl = this.url
    const oldFirstUrl = this.entries[0].location.url
    const reverseN = -this.index
    const commit = (action) =>
      this._reset(action, oldUrl, oldFirstUrl, reverseN)

    if (!entries[index]) throw new Error(`[rudy] no entry at index: ${index}.`)

    const prev = this._createPrev(info)
    const from = index === this.index && createActionRef(this.location) // if index stays the same, treat as "replace"

    return this._notify(action, info, commit, notify, { prev, from })
  }

  canJump(delta, byIndex) {
    delta = this._resolveDelta(delta, byIndex)
    return !!this.entries[this.index + delta]
  }

  // UTILS:

  _transformEntry(entry, action) {
    entry = { ...entry }

    if (typeof action === 'function') {
      return toAction(this, action(entry))
    }

    action = isAction(action) ? action : { state: action }
    let { params, query, state, hash, basename: bn } = action

    if (params) {
      params = typeof params === 'function' ? params(entry.query) : params
      entry.params = { ...entry.params, ...params }
    }

    if (query) {
      query = typeof query === 'function' ? query(entry.query) : query
      entry.query = { ...entry.query, ...query }
    }

    if (state) {
      state = typeof state === 'function' ? state(entry.state) : state

      entry.state = { ...entry.state, ...state }
    }

    if (hash) {
      hash = typeof hash === 'function' ? hash(entry.hash) : hash
      entry.hash = hash
    }

    if (bn) {
      bn = typeof bn === 'function' ? bn(entry.basename) : bn
      entry.basename = bn
    }

    return toAction(this, entry)
  }

  _createPrev({ n, index: i, entries }, currentEntry) {
    const index = i - n // reverse of n direction to get prev
    const entry = currentEntry || entries[index]

    if (!entry) return createPrevEmpty()

    const scene = this.routes[entry.type].scene || ''
    const action = { ...entry, location: { ...entry.location, index, scene } }

    return createActionRef(action) // build the action for that entry, and create what the resulting state shape would have looked like
  }

  _findResetFirstAction(entry) {
    const { routes, options } = this

    // the user can configure what the default first entry is
    if (options.resetFirstEntry) {
      return typeof options.resetFirstEntry === 'function'
        ? options.resetFirstEntry(entry)
        : options.resetFirstEntry
    }

    // if not, we have little choice but to put a HOME or NOT_FOUND action at the front of the entries
    if (typeof entry === 'object' && entry.type) {
      const action = entry

      if (routes[action.type].path !== '/') {
        const homeType = Object.keys(routes).find(
          (type) => routes[type].path === '/',
        )
        return homeType ? { type: homeType } : { type: 'NOT_FOUND' }
      }

      return { type: 'NOT_FOUND' }
    }

    // entries may also be supplied as paths or arrays also containing state, eg:  [[path, state], [path, state]]
    const path = Array.isArray(entry) ? entry[0] : entry
    const notFoundPath = routes.NOT_FOUND.path

    if (path !== '/') {
      const homeRoute = Object.keys(routes).find(
        (type) => routes[type].path === '/',
      )
      return homeRoute ? '/' : notFoundPath
    }

    return notFoundPath
  }

  _once(commit) {
    let committed = false

    return (action) => {
      if (committed) return Promise.resolve()
      committed = true

      return Promise.resolve(commit(action)).then(() => {
        if (!this.options.save) return
        this.options.save(this.location) // will retreive these from redux state, which ALWAYS updates first
      })
    }
  }

  _findAdjacentN(action) {
    return this._findBackN(action) || this._findNextN(action)
  }

  _findBackN(action) {
    const e = this.entries[this.index - 1]
    return e && e.location.url === action.location.url && -1
  }

  _findNextN(action) {
    const e = this.entries[this.index + 1]
    return e && e.location.url === action.location.url && 1
  }

  _pushToFront(action, prevEntries, index) {
    const entries = prevEntries.slice(0)
    const isBehindHead = entries.length > index

    if (isBehindHead) {
      const entriesToDelete = entries.length - index
      entries.splice(index, entriesToDelete, action)
    } else {
      entries.push(action)
    }

    return entries
  }

  _resolveDelta(delta, byIndex) {
    if (typeof delta === 'string') {
      const index = this.entries.findIndex((e) => e.location.key === delta)
      return index - this.index
    }

    if (byIndex) {
      return delta - this.index
    }

    return delta || 0
  }

  // All child classes *should* implement this:
  _restore() {
    return toEntries(this) // by default creates action array for a single entry: ['/']
  }

  // BrowseHistory (or 3rd party implementations) override these to provide sideFX
  _push() {}

  _replace() {}

  _jump() {}

  _set() {}

  _reset() {}
}
