import { urlToAction, toAction, createActionRef, cleanBasename } from '../utils'
import { createPrevEmpty } from '../core/createReducer'

export default class History {
  constructor(routes, options = {}) {
    this.routes = routes
    this.options = options

    options.basenames = (options.basenames || []).map(bn => cleanBasename(bn))

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
    const n2 = n || (index > this.index ? 1 : (index === this.index ? this.n : -1))
    const { length } = entries

    action = {
      ...action,
      ...extras,
      commit: this._once(commit),
      location: { ...action.location, ...info, length, n: n2 }
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
    if (this.location.kind === 'load' && this.location.from) {
      return this.location.from.location.url // used by `BrowserHistory._replace` on redirects when `prev` state is empty
    }

    return this.location.prev.location.url
  }

  // API:

  push(path, state = {}, notify = true) {
    const action = urlToAction(path, this, state)
    const back = this._isBack(action) // automatically determine if the user is just going back or next to a URL already visited
    const next = this._isNext(action)
    const kind = back ? 'back' : (next ? 'next' : 'push')

    if (/back|next/.test(kind)) {
      return this.jump(back ? -1 : 1, state, undefined, undefined, notify)
    }

    const index = back ? this.index - 1 : this.index + 1
    const entries = this._pushToFront(action, this.entries, index, kind)
    const info = { kind, index, entries }
    const commit = (action) => this._push(action)

    return this._notify(action, info, commit, notify)
  }

  replace(path, state = {}, notify = true) {
    const action = urlToAction(path, this, state)
    const back = this._isBack(action) // automatically determine if the user is just going back or next to a URL already visited
    const next = this._isNext(action)
    const kind = back ? 'back' : (next ? 'next' : 'replace')

    if (/back|next/.test(kind)) {
      return this.jump(back ? -1 : 1, state, undefined, undefined, notify)
    }

    const { index } = this
    const entries = this.entries.slice(0)
    const info = { kind, entries, index }
    const commit = (action) => this._replace(action)

    entries[index] = action

    return this._notify(action, info, commit, notify)
  }

  replacePop(path, state = {}, notify = true, pop) {
    const action = urlToAction(path, this, state)
    const { index, prevUrl, n } = pop
    const entries = pop.entries.slice(0)
    const kind = index < this.index ? 'back' : 'next'
    const info = { kind, entries, index }
    const commit = (action) => this._replace(action, prevUrl, n)

    entries[index] = action

    return this._notify(action, info, commit, notify)
  }

  jump(n, state, byIndex = false, kindOverride, notify = true, revertPop) {
    n = this._resolveN(n, byIndex)
    kindOverride = kindOverride || (n < 0 ? 'back' : 'next') // users can choose what direction to make the `jump` look like it came from

    const kind = n === -1 ? 'back' : (n === 1 ? 'next' : 'jump') // back/next kinds are just more specifically named jumps
    const isPop = !!revertPop
    const index = this.index + n // n in this case may be values other than -1, 1, but only for the index
    const entries = this.entries.slice(0)
    const action = entries[index] = { ...this.entries[index] }
    const n2 = kindOverride === 'back' ? -1 : 1 // now we need to provide the standard -1/1 value for n
    const info = { kind, index, entries, n: n2 }
    const prev = kind === 'jump' && this._createPrev(info) // jumps can fake the value of `prev` state
    const commit = (action) => this._jump(action, n, isPop)

    state = typeof state === 'function' ? state(action.state) : state
    action.state = { ...action.state, ...state }

    if (!this.entries[index]) {
      throw new Error(`[rudy] no entry at index: ${index}.`)
    }

    return this._notify(action, info, commit, notify, { prev, revertPop })
  }

  back(state, notify = true) {
    return this.jump(-1, state, false, 'back', notify)
  }

  next(state, notify = true) {
    return this.jump(1, state, false, 'next', notify)
  }

  setParams(params, n, byIndex, notify) {
    return this.set({ params }, n, byIndex, notify)
  }

  setQuery(query, n, byIndex, notify) {
    return this.set({ query }, n, byIndex, notify)
  }

  setState(state, n, byIndex, notify) {
    return this.set({ state }, n, byIndex, notify)
  }

  setHash(hash, n, byIndex, notify) {
    return this.set({ hash }, n, byIndex, notify)
  }

  setBasename(basename, n, byIndex, notify) {
    return this.set({ basename }, n, byIndex, notify)
  }

  set(act, n, byIndex = false, notify = true) {
    n = this._resolveN(n, byIndex)

    const kind = 'set'
    const { index } = this
    const i = this.index + n
    const entries = this.entries.slice(0)
    const entry = entries[i] = { ...this.entries[i] }
    const action = n === 0 ? entry : createActionRef(this.location) // action dispatched must ALWAYS be current one, but insure it receives changes if n === 0, not just entry in entries
    const info = { kind, index, entries }

    const currUrl = n === 0 ? this.url : entry.location.url
    const commit = (action) => this._set(action, currUrl, n)

    if (!this.entries[i]) {
      throw new Error(`[rudy] no entry at index: ${i}`)
    }

    if (typeof act === 'function') {
      Object.assign(entry, act(entry))
    }
    else {
      let { params, query, state, hash, basename: bn } = act

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
    }

    Object.assign(entry, toAction(entry, this))

    return this._notify(action, info, commit, notify)
  }

  reset(entries, index, kindOverride, notify = true) {
    if (entries.length === 1) {
      const entry = this._findResetFirstAction(entries[0]) // browser must always have at least 2 entries, so one can be pushed, erasing old entries from the stack
      entries.unshift(entry)
    }

    entries = entries.map(e => toAction(e, this))
    index = index !== undefined ? index : entries.length - 1 // default index is head of array

    if (!entries[index]) {
      throw new Error(`[rudy] no location entry at index: ${index}.`)
    }

    const n = kindOverride
      ? kindOverride === 'next' ? 1 : -1 // user manually chose which direction to pretend to be going
      : index !== entries.length - 1
        ? index > this.index ? 1 : (index === this.index ? this.n : -1) // create direction relative to index of current entries
        : 1 // at the front of the array, always use "forward" direction

    const kind = 'reset'
    const action = { ...entries[index] }
    const info = { kind, index, entries, n }
    const commit = (action) => this._reset(action)

    const prev = this._createPrev(info)
    const from = index === this.index && createActionRef(this.location) // if index stays the same, treat as "replace"

    return this._notify(action, info, commit, notify, { prev, from })
  }

  canJump(n, byIndex) {
    n = this._resolveN(n, byIndex)
    return !!this.entries[this.index + n]
  }

  // UTILS:

  _createPrev({ n, index: i, entries }) {
    const index = i - n
    const entry = entries[index]

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
        const homeType = Object.keys(routes).find(type => routes[type].path === '/')
        return homeType ? { type: homeType } : { type: 'NOT_FOUND' }
      }

      return { type: 'NOT_FOUND' }
    }

    // entries may also be supplied as paths or arrays also containing state, eg:  [[path, state], [path, state]]
    const path = Array.isArray(entry) ? entry[0] : entry
    const notFoundPath = routes.NOT_FOUND.path

    if (path !== '/') {
      const homeRoute = Object.keys(routes).find(type => routes[type].path === '/')
      return homeRoute ? '/' : notFoundPath
    }

    return notFoundPath
  }

  _once(commit) {
    let committed = false

    return (action) => {
      if (committed) return Promise.resolve()
      committed = true

      return Promise.resolve(commit(action))
        .then(() => {
          if (!this.options.save) return
          this.options.save(this.location) // will retreive these from redux state, which ALWAYS updates first
        })
    }
  }

  _isBack(action) {
    const e = this.entries[this.index - 1]
    return e && e.location.url === action.location.url
  }

  _isNext(action) {
    const e = this.entries[this.index + 1]
    return e && e.location.url === action.location.url
  }

  _pushToFront(action, prevEntries, index) {
    const entries = prevEntries.slice(0)
    const isBehindHead = entries.length > index

    if (isBehindHead) {
      const entriesToDelete = entries.length - index
      entries.splice(index, entriesToDelete, action)
    }
    else {
      entries.push(action)
    }

    return entries
  }

  _resolveN(n, byIndex) {
    if (typeof n === 'string') {
      const index = this.entries.findIndex(e => e.location.key === n)
      return index - this.index
    }

    if (byIndex) {
      return n - this.index
    }

    return n || 0
  }

  // All child classes *should* implement this:
  _restore() {
    const entries = [toAction('/', this)]
    return { n: 1, index: 0, entries }
  }

  // BrowseHistory (or 3rd party implementations) override these to provide sideFX
  _push() {}
  _replace() {}
  _jump() {}
  _set() {}
  _reset() {}
}
