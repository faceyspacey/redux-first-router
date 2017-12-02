import History from './History'

import {
  stripSlashes,
  createPath,
  getWindowLocation,
  isExtraneousPopstateEvent,
  createPopListenerFuncs,
  getHistoryState,
  getInitialHistoryState,
  restoreHistory,
  saveHistory
} from './utils'


// 1) HISTORY RESTORATION:
// * FROM SESSION_STORAGE (WITH A FALLBACK TO OUR "HISTORY_STORAGE" SOLUTION)

// The `id` below is very important, as it's used to identify unique `sessionStorage` sessions lol.

// Essentially, you can have multiple tabs open, or even in the same tab multiple sessions if you
// enter another URL at the same site manually. Each need their history entries independently tracked.

// So we:
// - create an `id` for each when first encountered
// - store it in `this.state.id`
// - and prefix their `sessionStorage` key with it to uniquely identify the different histories :)

// - then we restore the history using the id
// - and for all subsequent history saving, we save to the correct storage with that `id`

// NOTE: As far as the "HISTORY_STORAGE" fallback goes, please `sessionStorage.js`.
// Essentially we save the entire sessionStorage in every entry of `window.history` :)

// 2) POP HANDLING -- THE MOST IMPORTANT THING HERE:

// A) REVERT POP: `forceGo(currentIndex - index)`
// The first executed `forceGo` automatically undos the pop event, putting the browser history
// back to where it was. Since the `jump` function takes relative numbers, we must calculate
// that number by subtracting the current index from the next index

// B) COMMIT POP: `forceGo(index - currentIndex)`
// similarly the `commit` function performed in client code performs the reverse operation

// EXAMPLE:
// User presses back from index 5 to 4
// revert: 5 - 4 === jump(1)
// commit: 4 - 5 === jump(-1)
// :)

// WHY?
// so client code can control when the URL actually changes, and possibly deny it

export default class BrowserHistory extends History {
  constructor(opts = {}) {
    const { basenames: bns = [] } = opts
    const basenames = bns.map(bn => stripSlashes(bn))

    const { id, ...initialHistoryState } = getInitialHistoryState()
    const defaultLocation = getWindowLocation(initialHistoryState, basenames)
    const { index, entries } = restoreHistory(defaultLocation)

    super({ index, entries, basenames, saveHistory })

    this._id = id
    this._setupPopHandling()
  }

  listen(fn) {
    const unlisten = super.listen(fn)
    this._addPopListener()

    return () => {
      this._removePopListener()
      unlisten()
    }
  }

  _setupPopHandling() {
    const handlePop = location => {
      if (this._popForced) return (this._popForced = false)

      const n = this._isNext(location) ? 1 : -1

      this._forceGo(n * -1) // revert
      this.jump(n) // commit handled by our regular `jump` function now
    }

    // you don't really need to worry about the below utility work:

    const onPopState = event => {
      if (isExtraneousPopstateEvent(event)) return // Ignore extraneous popstate events in WebKit.
      handlePop(getWindowLocation(event.state, this.basenames))
    }

    const onHashChange = () => {
      handlePop(getWindowLocation(getHistoryState(), this.basenames))
    }

    const funcs = createPopListenerFuncs(onPopState, onHashChange)
    Object.assign(this, funcs) // merge: `_addPopListener`, `_removePopListener`
  }

  _forceGo(n) {
    this._popForced = true
    window.history.go(n) // revert
  }

  _pushState(location) {
    const { key, state } = location
    const href = this._createHref(location)
    window.history.pushState({ id: this._id, key, state }, null, href)
  }

  _replaceStateReal(location) {
    const { key, state } = location
    const href = this._createHref(location)
    window.history.replaceState({ id: this._id, key, state }, null, href)
  }

  _replaceState(location, n, prevLocation) {
    if (!n) return this._replaceStateReal(location)

    const ready = () => {
      console.log('REVERT', prevLocation.basename + prevLocation.url === createPath(window.location), prevLocation.basename + prevLocation.url, createPath(window.location))
      return prevLocation.basename + prevLocation.url === createPath(window.location)
    }
    const complete = () => this._forceGo(n)
    tryChange(ready, complete)

    const ready2 = () => {
      console.log('JUMP', location.basename + location.url === createPath(window.location), location.basename + location.url, createPath(window.location))
      return location.basename + location.url === createPath(window.location)
    }
    return new Promise(res => tryChange(ready2, res)).then(() => {
      console.log('REPLACE', location.basename + location.url)
      return this._replaceStateReal(location)
    })
  }
}

// CHROME WORKAROUND:
// chrome doesn't like rapid back to back history changes, so we test the first
// change happened first, before executing the next

let tries = 0
const maxTries = 5
const queue = []

const tryChange = (ready, complete) => {
  if (tries === 0) rapidChangeWorkaround(ready, complete)
  else queue.push([ready, complete])
}

const rapidChangeWorkaround = (ready, complete) => {
  tries++
  console.log('tries', tries)

  if (!ready() && tries < maxTries) {
    setTimeout(() => rapidChangeWorkaround(ready, complete), 9)
  }
  else {
    complete()
    tries = 0

    // try another if queue is full
    const [again, com] = queue.shift() || []

    if (again) {
      // console.log('QUEUE WORKED', queue.length, again)
      rapidChangeWorkaround(again, com)
    }
  }
}
