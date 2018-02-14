import { UPDATE_HISTORY } from '../types'
import { formatSlashes, createPath, createLocation, createKey, findBasename, stripBasename } from './utils'

export default class History {
  constructor(opts) {
    const { index, entries, saveHistory, basenames } = opts

    this.saveHistory = saveHistory || function() {}

    this.basename = entries[index].basename
    this.basenames = basenames

    this.entries = []
    this.index = -1
    this.length = 0
    this.location = null

    const nextState = {
      kind: 'load',
      entries,
      index,
      location: entries[index]
    }

    const nextHistory = this._createNextHistory(nextState)

    const commit = () => {
      this._updateHistory(nextState)
    }

    this.firstRoute = { nextHistory, commit, type: UPDATE_HISTORY }
  }

  // API:

  push(path, state = {}, basename, notify = true) {
    const foundBasename = findBasename(path, this.basenames)
    if (foundBasename) path = path.substr(foundBasename.length)

    basename = foundBasename || basename
    if (basename) this.setBasename(basename)

    const key = createKey()
    const bn = this.basename
    const location = createLocation(path, state, key, this.location, bn)

    // automatically determine if the user is just going back or next to a URL already visited
    const back = this._isBack(location)
    const next = this._isNext(location)
    const kind = back ? 'back' : (next ? 'next' : 'push')

    if (/back|next/.test(kind)) {
      return this.jump(back ? -1 : 1, state, undefined, undefined, notify)
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

  replace(path, state = {}, basename, notify = true) {
    const foundBasename = findBasename(path, this.basenames)
    if (foundBasename) path = path.substr(foundBasename.length)

    basename = foundBasename || basename
    if (basename) this.setBasename(basename)

    const k = createKey()
    const bn = this.basename
    const location = createLocation(path, state, k, this.location, bn)

    // automatically determine if the user is just going back or next to a URL already visited
    const back = this._isBack(location)
    const next = this._isNext(location)
    const kind = back ? 'back' : (next ? 'next' : 'redirect')

    if (/back|next/.test(kind)) {
      return this.jump(back ? -1 : 1, state, undefined, undefined, notify)
    }

    const index = this.index
    const entries = this.entries.slice(0)

    entries[index] = location

    const nextState = { kind, location, entries, index }
    const nextHistory = this._createNextHistory(nextState)

    const commit = () => {
      this._replaceState(location)
      this._updateHistory(nextState)
    }

    return this._notify({ nextHistory, commit }, notify)
  }

  jump(n, state, byIndex = false, kind, notify = true) {
    if (typeof n === 'string') {
      const index = this.entries.findIndex(e => e.key === n)
      n = index - this.index
    }
    else if (byIndex) {
      n -= this.index
    }

    if (!kind) kind = n < 0 ? 'back' : 'next'

    const index = this.index + n
    const entries = this.entries.slice(0)
    const prevLocation = this.entries[index]

    if (!prevLocation) {
      throw new Error(`[rudy] no location entry at index: ${index}. Consider using
        \`history.canJump()\` prior to dispatching this action.
        Best practice is to do so within a thunk, where \`history\`
        can be destructured from the arg passed to your thunk.`)
    }

    const location = { ...prevLocation }

    if (typeof state === 'function') {
      state = state(location.state)
    }

    location.state = { ...location.state, ...state }
    entries[index] = location

    const nextState = { kind, location, index, entries }
    const nextHistory = this._createNextHistory(nextState)

    const commit = () =>
      this._replaceState(location, n, this.location)
        .then(() => this._updateHistory(nextState))

    const info = n === -1 || n === 1 || kind === 'setState' ? null : 'jump'     // info === jump will tell middleware/transformAction.js to create custom `prev`
    return this._notify({ nextHistory, commit, info }, notify)
  }

  setState(state, n, byIndex, notify = true) {
    if (!n && !byIndex) return this.jump(0, state, byIndex, 'setState', notify) // setState on current entry (primary use-case)

    const currentIndex = this.index
    const { commit } = this.jump(n, state, byIndex, 'setState', false)          // jump to different entry and set state on it

    return commit().then(() => {
      return this.jump(currentIndex, undefined, true, 'setState', notify)       // jump back to the original entry, so current index is passed along to action
    })
  }

  back(state, notify = true) {
    return this.jump(-1, state, false, 'back', notify)
  }

  next(state, notify = true) {
    return this.jump(1, state, false, 'next', notify)
  }

  reset(entries, index, kind, notify = true) {
    entries = entries.map(e => createLocation(e))
    index = index !== undefined ? index : entries.length - 1

    if (!kind) {
      if (entries.length > 1) {
        if (index === entries.length - 1) kind = 'next'   // assume the user would be going forward in the new entries stack, i.e. if at head
        else if (index === this.index) kind = 'redirect'
        else kind = index < this.index ? 'back' : 'next'  // assume the user is going 'back' if lower than current index, and 'next' otherwise
      }
      else kind = 'load'                                  // if one entry, set kind to 'load' so app can behave as if it's loaded for the first time
    }

    const prevLocation = entries[index]
    const location = { ...prevLocation }
    const nextState = { kind, location, index, entries }
    const nextHistory = this._createNextHistory(nextState)

    const commit = () => {
      this._resetState(location)
      this._updateHistory(nextState)
    }

    return this._notify({ nextHistory, commit, info: 'reset' }, notify)
  }

  canJump(n, byIndex) {
    if (typeof n === 'string') {
      const index = this.entries.findIndex(e => e.key === n)
      n = index - this.index
    }
    else if (byIndex) {
      n -= this.index
    }

    const nextIndex = this.index + n
    return !!this.entries[nextIndex]
  }

  listen(fn) {
    this._listener = fn
    return () => this._listener = null
  }

  setBasename(basename) {
    this.basename = formatSlashes(basename)
  }

  // UTILS:

  _notify(action, notify = true) {
    action.type = UPDATE_HISTORY
    action.commit = this._once(action.commit)
    if (notify && this._listener) return this._listener(action)
    return action
  }

  _once(commit) {
    let committed = false

    return () => {
      if (committed) return
      committed = true
      return commit()
    }
  }

  _createHref(location) {
    return location.basename + createPath(location)
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
    const next = Object.assign({ type: UPDATE_HISTORY }, this, state)
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
