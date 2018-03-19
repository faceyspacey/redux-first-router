import { UPDATE_HISTORY } from '../types'
import { createAction, createLocation } from './utils'
import { actionToUrl } from '../utils'

export default class History {
  constructor(routes, options, config) {
    const { index, entries, saveHistory } = config

    this.saveHistory = saveHistory || function() {}

    this.routes = routes
    this.options = options

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

  createLocation(path, state, basename) {
    const location = this.location || this.firstRoute.nextHistory.location
    const scene = this.routes[location.type].scene
    return createAction(path, this.routes, this.options, state, undefined, basename, this.location, scene)
  }

  // API:

  push(path, state = {}, basename, notify = true) {
    const location = this.createLocation(path, state, basename)
    const back = this._isBack(location) // automatically determine if the user is just going back or next to a URL already visited
    const next = this._isNext(location)
    const kind = back ? 'back' : (next ? 'next' : 'push')

    if (/back|next/.test(kind)) {
      return this.jump(back ? -1 : 1, state, undefined, undefined, notify)
    }

    const index = back ? this.index - 1 : this.index + 1
    const entries = this._pushToFront(location, this.entries, index, kind)
    const nextState = { kind, location, index, entries }
    const nextHistory = this._createNextHistory(nextState)
    const commit = () => this._push(nextState)

    return this._notify({ nextHistory, commit }, notify)
  }

  replace(path, state = {}, basename, notify = true) {
    const location = this.createLocation(path, state, basename)
    const back = this._isBack(location) // automatically determine if the user is just going back or next to a URL already visited
    const next = this._isNext(location)
    const kind = back ? 'back' : (next ? 'next' : 'replace')

    if (/back|next/.test(kind)) {
      return this.jump(back ? -1 : 1, state, undefined, undefined, notify)
    }

    const index = this.index
    const entries = this.entries.slice(0)

    entries[index] = location

    const nextState = { kind, location, entries, index }
    const nextHistory = this._createNextHistory(nextState)
    const commit = () => this._replace(nextState)

    return this._notify({ nextHistory, commit }, notify)
  }

  replacePop(path, state = {}, basename, notify = true, pop) {
    const location = this.createLocation(path, state, basename)
    const index = pop.index
    const entries = pop.entries.slice(0)
    const kind = index < this.index ? 'back' : 'next'

    entries[index] = location

    const nextState = { kind, location, entries, index }
    const nextHistory = this._createNextHistory(nextState)
    const commit = () => this._replace(nextState, pop.action, pop.n)

    return this._notify({ nextHistory, commit }, notify)
  }

  jump(n, state, byIndex = false, manualKind, notify = true, revertPop) {
    n = this._resolveN(n, byIndex)
    manualKind = manualKind || (n < 0 ? 'back' : 'next')

    const kind = n === -1 ? 'back' : (n === 1 ? 'next' : 'jump')
    const isPop = !!revertPop
    const index = this.index + n
    const entries = this.entries.slice(0)
    const location = entries[index] = { ...this.entries[index] }
    const nextState = { kind, location, index, entries }
    const nextHistory = this._createNextHistory(nextState, { manualKind })
    const commit = () => {
      const { kind, location, index, entries } = nextHistory
      const nextState = { kind, location, index, entries }
      return this._jump(nextState, n, isPop)
    }

    state = typeof state === 'function' ? state(location.state) : state

    location.state = { ...location.state, ...state }

    if (!this.entries[index]) {
      throw new Error(`[rudy] no entry at index: ${index}. Consider using \`history.canJump(n)\`.`)
    }

    return this._notify({ nextHistory, commit, revertPop }, notify)
  }

  setState(state, n, byIndex = false, notify = true) {
    n = this._resolveN(n, byIndex)

    const kind = 'setState'
    const curIndex = this.index
    const index = this.index + n
    const entries = this.entries.slice(0)
    const changedLocation = entries[index] = { ...this.entries[index] }
    const location = n === 0 ? changedLocation : this.location // insure if state set on current entry, location is not stale
    const nextState = { kind, location, index: curIndex, entries }
    const nextHistory = this._createNextHistory(nextState)
    const commit = () => this._setState(nextState, n)

    state = typeof state === 'function' ? state(changedLocation.state) : state
    changedLocation.state = { ...changedLocation.state, ...state }

    if (!this.entries[index]) {
      throw new Error(`[rudy] no entry at index: ${index}. Consider using \`history.canJump(n)\`.`)
    }

    return this._notify({ nextHistory, commit }, notify)
  }

  back(state, notify = true) {
    return this.jump(-1, state, false, 'back', notify)
  }

  next(state, notify = true) {
    return this.jump(1, state, false, 'next', notify)
  }

  reset(entries, index, manualKind, basename, notify = true) {
    if (entries.length === 1) {
      const entry = this._findResetFirstAction(entries[0])
      entries.unshift(entry)
    }

    entries = entries.map(entry => {
      if (typeof entry === 'object' && entry.type) {
        const action = entry
        action.basename = action.basename || basename
        const { url, state } = actionToUrl(action, this.routes, this.options)
        return this.createLocation(url, state, action.basename)
      }
      else if (Array.isArray(entry)) {
        const [url, state] = entry
        return this.createLocation(url, state, basename)
      }

      return this.createLocation(entry, undefined, basename)
    })


    index = index !== undefined ? index : entries.length - 1

    if (!manualKind) {
      if (entries.length > 1) {
        if (index === entries.length - 1) manualKind = 'next'   // assume the user would be going forward in the new entries stack, i.e. if at head
        else if (index === this.index) manualKind = 'replace'
        else manualKind = index < this.index ? 'back' : 'next'  // assume the user is going 'back' if lower than current index, and 'next' otherwise
      }
      else manualKind = 'load'                                  // if one entry, set kind to 'load' so app can behave as if it's loaded for the first time
    }

    if (!entries[index]) {
      throw new Error(`[rudy] no location entry at index: ${index}.`)
    }

    const kind = 'reset'
    const location = { ...entries[index] }
    const nextState = { kind, location, index, entries }
    const nextHistory = this._createNextHistory(nextState, { manualKind })
    const commit = () => {
      const { kind, location, index, entries } = nextHistory
      const nextState = { kind, location, index, entries }
      return this._reset(nextState)
    }

    return this._notify({ nextHistory, commit }, notify)
  }

  _findResetFirstAction(action) {
    const { routes, options } = this

    if (options.resetFirstEntry) {
      return typeof options.resetFirstEntry === 'function'
        ? options.resetFirstEntry(action)
        : options.resetFirstEntry
    }

    if (typeof action === 'object' && action.type) {
      if (routes[action.type].path !== '/') {
        const homeType = Object.keys(routes).find(type => routes[type].path === '/')
        return homeType ? { type: homeType } : { type: 'NOT_FOUND' }
      }

      return { type: 'NOT_FOUND' }
    }

    const path = Array.isArray(action) ? action[0] : action
    const notFoundPath = routes.NOT_FOUND.path

    if (path !== '/') {
      const homeRoute = Object.keys(routes).find(type => routes[type].path === '/')
      return homeRoute ? '/' : notFoundPath
    }

    return notFoundPath
  }

  canJump(n, byIndex) {
    n = this._resolveN(n, byIndex)
    return !!this.entries[this.index + n]
  }

  listen(fn) {
    this._listener = fn
    return () => this.unlisten()
  }

  unlisten() {
    this._listener = null
  }

  // UTILS:

  _notify(action, notify = true) {
    action.type = UPDATE_HISTORY
    action.commit = this._once(action.commit)
    if (notify && this._listener) return this._listener(action)
    return action
  }

  _createNextHistory(state, moreState) {
    const length = state.entries ? state.entries.length : this.length
    return Object.assign(state, moreState, { length })
  }

  _updateHistory(state) {
    Object.assign(this, state)
    this.length = state.entries ? state.entries.length : this.length
    this.saveHistory(this)
  }

  _once(commit) {
    let committed = false

    return (...args) => {
      if (committed) return
      committed = true
      return commit(...args)
    }
  }

  _isBack(location) {
    const entry = this.entries[this.index - 1]
    return entry && entry.location.url === location.location.url
  }

  _isNext(location) {
    const entry = this.entries[this.index + 1]
    return entry && entry.location.url === location.location.url
  }

  _pushToFront(location, prevEntries, index) {
    const entries = prevEntries.slice(0)
    const isBehindHead = entries.length > index

    if (isBehindHead) {
      const entriesToDelete = entries.length - index
      entries.splice(index, entriesToDelete, location)
    }
    else {
      entries.push(location)
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
}
