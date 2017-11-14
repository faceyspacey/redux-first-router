import { createLocation, createKey } from '../utils/location'
import { createPath, stripSlashes } from '../utils/path'

export default class History {
  constructor(opts) {
    const { index, entries, saveHistory, basename } = opts

    this.saveHistory = saveHistory || function () {}
    this.basename = basename
    this.kind = 'load'
    this.location = { pathname: '', search: '', hash: '', url: '', state: {} }
    this.location = entries[index]
    this.entries = entries
    this.length = entries.length
    this.index = index

    // const kind = 'load'
    // const location = entries[index]
    // const nextState = { kind, location, index, entries }
    // const nextHistory = this._createNextHistory(nextState)

    const commit = () => {
      // this._updateHistory(nextState)
    }

    this.firstRoute = { nextHistory: this, commit }
  }

  // API:

  push(path, state = {}, notify = true) {
    const key = createKey()
    const location = createLocation(path, state, key, this.location, this.basename)
    const back = this._isBack(location)
    const next = this._isNext(location)
    const kind = back ? 'back' : next ? 'next' : 'push'

    if (/back|next/.test(kind)) {
      return this.jump(back ? -1 : 1, state, notify)
    }

    const index = back ? this.index - 1 : this.index + 1
    const entries = this._pushToFront(location, this.entries, index, kind)
    const nextState = { kind, location, index, entries }
    const nextHistory = this._createNextHistory(nextState)

    const commit = () => {
      this._pushState(location)
      this._updateHistory(nextState)
    }

    return this._notify({ nextHistory, commit }, notify)
  }

  redirect(path, state = {}, notify = true) {
    const key = createKey()
    // const prevState = merge && this.entries[this.index].state
    const s = { ...this.entries[this.index].state, ...state }
    const location = createLocation(path, s, key, this.location, this.basename)
    const entries = this.entries.slice(0)
    const index = this.index

    entries[index] = location

    const kind = 'redirect'
    const nextState = { kind, location, entries, index }
    const nextHistory = this._createNextHistory(nextState)

    const commit = () => {
      this._replaceState(location)
      this._updateHistory(nextState)
    }

    return this._notify({ nextHistory, commit }, notify)
  }

  jump(n, state, notify = true) {
    const kind = n === -1 ? 'back' : n === 1 ? 'next' : 'jump'
    const index = this.index + n
    const entries = this.entries.slice(0)
    const location = { ...this.entries[index] }

    location.state = { ...location.state, ...state }
    entries[index] = location

    const nextState = { kind, location, index, entries }
    const nextHistory = this._createNextHistory(nextState)

    const commit = () =>
      this._replaceState(location, n, this.location)
        .then(() => {
          // this.basename = location.basename
          this._updateHistory(nextState)
        })

    return this._notify({ nextHistory, commit }, notify)
  }

  back(state) {
    return this.jump(-1, state)
  }

  next(state) {
    return this.jump(1, state)
  }

  canJump(n) {
    const nextIndex = this.index + n
    return nextIndex >= 0 && nextIndex < this.entries.length
  }

  listen(fn) {
    this._listener = fn
    return () => this._listener = null
  }

  setBasename(basename) {
    this.basename = stripSlashes(basename)
  }

  // UTILS:

  _notify(bag, notify = true) {
    bag.commit = this._once(bag.commit)
    if (notify && this._listener) return this._listener(bag)
    return bag
  }

  _once(commit) {
    let committed = false

    return () => {
      if (committed) return
      committed = true
      commit()
    }
  }

  _createHref(location) {
    return this.basename + createPath(location)
  }

  _isBack(location) {
    const entry = this.entries[this.index - 1]
    return entry && entry.url === location.url
  }

  _isNext(location) {
    const entry = this.entries[this.index + 1]
    return entry && entry.url === location.url
  }

  _updateHistory(state) {
    Object.assign(this, state)
    this.length = state.entries ? state.entries.length : this.length
    this.saveHistory(this)
  }

  _createNextHistory(state) {
    const next = Object.assign({}, this, state)
    next.length = state.entries ? state.entries.length : this.length
    return next
  }

  _pushToFront(location, prevEntries, index) {
    const entries = prevEntries.slice(0)
    const isBehindHead = entries.length > index
    const entriesToDelete = entries.length - index

    if (isBehindHead) {
      entries.splice(index, entriesToDelete, location)
    }
    else {
      entries.push(location)
    }

    return entries
  }
}
