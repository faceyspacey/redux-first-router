import { createAction } from './utils'
import { actionToUrl } from '../utils'

export default class History {
  constructor(routes, options, config) {
    const { n, index, entries, saveHistory } = config

    this.saveHistory = saveHistory || function() {}

    this.routes = routes
    this.options = options

    this.entries = []
    this.index = -1
    this.length = 0
    this.kind = 'init'
    this.n = 1
    this.action = null

    const kind = 'load'
    const action = entries[index]
    const location = { kind, n, index, entries }
    const commit = (action) => this._updateHistory(action)

    this.firstAction = this._notify(action, location, commit, false)
  }

  createAction(path, state, basename) {
    const { type } = this.action || this.firstAction
    const scene = this.routes[type].scene
    return createAction(path, this.routes, this.options, state, undefined, basename, this.action, scene)
  }

  // API:

  push(path, state = {}, basename, notify = true) {
    const action = this.createAction(path, state, basename)
    const back = this._isBack(action) // automatically determine if the user is just going back or next to a URL already visited
    const next = this._isNext(action)
    const kind = back ? 'back' : (next ? 'next' : 'push')

    if (/back|next/.test(kind)) {
      return this.jump(back ? -1 : 1, state, undefined, undefined, notify)
    }

    const index = back ? this.index - 1 : this.index + 1
    const entries = this._pushToFront(action, this.entries, index, kind)
    const commit = (action) => this._push(action)

    return this._notify(action, { kind, index, entries }, commit, notify)
  }

  replace(path, state = {}, basename, notify = true) {
    const action = this.createAction(path, state, basename)
    const back = this._isBack(action) // automatically determine if the user is just going back or next to a URL already visited
    const next = this._isNext(action)
    const kind = back ? 'back' : (next ? 'next' : 'replace')

    if (/back|next/.test(kind)) {
      return this.jump(back ? -1 : 1, state, undefined, undefined, notify)
    }

    const index = this.index
    const entries = this.entries.slice(0)
    const commit = (action) => this._replace(action)

    entries[index] = action

    return this._notify(action, { kind, entries, index }, commit, notify)
  }

  replacePop(path, state = {}, basename, notify = true, pop) {
    const action = this.createAction(path, state, basename)
    const index = pop.index
    const entries = pop.entries.slice(0)
    const kind = index < this.index ? 'back' : 'next'
    const commit = (action) => this._replace(action, pop.action, pop.n)

    entries[index] = action

    return this._notify(action, { kind, entries, index }, commit, notify)
  }

  jump(n, state, byIndex = false, manualKind, notify = true, revertPop) {
    n = this._resolveN(n, byIndex)
    manualKind = manualKind || (n < 0 ? 'back' : 'next')

    const kind = n === -1 ? 'back' : (n === 1 ? 'next' : 'jump')
    const isPop = !!revertPop
    const index = this.index + n
    const entries = this.entries.slice(0)
    const action = entries[index] = { ...this.entries[index] }
    const location = { kind, index, entries, manualKind, revertPop }
    const commit = (action) => this._jump(action, n, isPop)

    state = typeof state === 'function' ? state(action.state) : state

    action.state = { ...action.state, ...state }

    if (!this.entries[index]) {
      throw new Error(`[rudy] no entry at index: ${index}. Consider using \`history.canJump(n)\`.`)
    }

    return this._notify(action, location, commit, notify)
  }

  setState(state, n, byIndex = false, notify = true) {
    n = this._resolveN(n, byIndex)

    const kind = 'setState'
    const index = this.index
    const i = this.index + n
    const entries = this.entries.slice(0)
    const changedAction = entries[i] = { ...this.entries[i] }
    const action = n === 0 ? changedAction : this.action // insure if state set on current entry, location is not stale
    const commit = (action) => this._setState(action, n)

    state = typeof state === 'function' ? state(changedAction.state) : state
    changedAction.state = { ...changedAction.state, ...state }

    if (!this.entries[i]) {
      throw new Error(`[rudy] no entry at index: ${i}. Consider using \`history.canJump(n)\`.`)
    }

    return this._notify(action, { kind, index, entries }, commit, notify)
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
        const { url, state } = actionToUrl(action, this.routes, this.options)
        return this.createAction(url, state, action.basename || basename)
      }
      else if (Array.isArray(entry)) {
        const [url, state] = entry
        return this.createAction(url, state, basename)
      }

      return this.createAction(entry, undefined, basename)
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
    const action = { ...entries[index] }
    const commit = (action) => this._reset(action)

    return this._notify(action, { kind, index, entries, manualKind }, commit, notify)
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

  // _notify(action, notify = true) {
  //   action.type = UPDATE_HISTORY
  //   action.commit = this._once(action.commit)
  //   if (notify && this._listener) return this._listener(action)
  //   return action
  // }

  _notify(action, location, commit, notify = true) {
    location.length = location.entries.length
    action = {
      ...action,
      location: { ...action.location, ...location }
    }

    action.manualKind = action.location.manualKind
    action.revertPop = action.location.revertPop

    delete action.location.manualKind
    delete action.location.revertPop

    action.commit = this._once(commit, action)

    if (notify && this._listener) return this._listener(action)
    return action
  }

  _once(commit, action) {
    let committed = false

    return () => {
      if (committed) return
      committed = true
      return commit(action)
    }
  }

  _updateHistory(action) {
    const { entries, length, index, kind } = action.location
    const n = index > this.index ? 1 : (index === 0 ? this.n : -1)
    Object.assign(this, { entries, length, index, kind, n, action })
    this.saveHistory(this)
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
}
