import History from './History'

import {
  formatSlashes,
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
  constructor(routes, opts = {}) {
    const { basenames: bns = [] } = opts
    const basenames = bns.map(bn => formatSlashes(bn))

    const { id, ...initialHistoryState } = getInitialHistoryState()
    const defaultLocation = getWindowLocation(initialHistoryState, basenames)
    const { index, entries } = restoreHistory(defaultLocation)

    super(routes, opts, { index, entries, basenames, saveHistory })

    this._id = id
    this._setupPopHandling()
  }

  listen(fn) {
    super.listen(fn)
    this._addPopListener()

    return () => this.unlisten()
  }

  unlisten() {
    this._removePopListener()
    super.unlisten()
  }

  _setupPopHandling() {
    const handlePop = loc => {
      if (this._popForced) return (this._popForced = false)
      let n

      if (!this.pendingPop) {
        n = this._isNext(loc) ? 1 : -1
        this.pendingPop = n
      }
      else if (loc.url === this.location.url) {
        n = this.pendingPop * -1 // switch directions
        return this._forceGo(n * -1)
      }
      else {
        n = this.pendingPop
        return this._forceGo(n * -1)
      }

      const kind = n === -1 ? 'back' : 'next'
      const revertPop = this._once(() => this._forceGo(n * -1))

      // revertPop will be called if route change blocked by `core/compose.js` or used as
      // a flag by `this._jump` below to do nothing in the browser, since the user already
      // did it via browser back/next buttons
      console.log(132)
      this.dog = true
      this.currentPop = this.jump(n, undefined, false, kind, true, revertPop)
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

  _push(nextState, awaitLoc) {
    const { location } = nextState
    const { key, state } = location
    const href = location.url
    console.log('PUSH', href)

    return this._awaitLocation(awaitLoc || this.location, '_push')
      .then(() => window.history.pushState({ id: this._id, key, state }, null, href))
      .then(() => this._updateHistory(nextState))

    return Promise.resolve()
  }

  _replace(nextState, awaitLoc, n) {
    const { location } = nextState
    const { key, state } = location
    const href = location.url
    console.log('REPLACE', href)

    if (n) {
      this._forceGo(n)

      console.log('AWAIT LOCATION', n, awaitLoc)
      return this._awaitLocation(awaitLoc || this.location, '_replaceBackNext')
        .then(() => window.history.replaceState({ id: this._id, key, state }, null, href))
        .then(() => this._updateHistory(nextState))
    }

    return this._awaitLocation(awaitLoc || this.location, '_replace')
      .then(() => window.history.replaceState({ id: this._id, key, state }, null, href))
      .then(() => this._updateHistory(nextState))

    window.history.replaceState({ id: this._id, key, state }, null, href)

    return Promise.resolve()
  }

  _jump(nextState, n, isPop) {
    const prev = this.location
    const { location: loc } = nextState

    if (!n) { // possibly the user mathematically calculated a jump of `0`
      return this._replace(loc)
        .then(() => this._updateHistory(nextState))
    }

    if (isPop) {  // pop already handled by browser back/next buttons and real history state is already up to date
      console.log('JUMP isPop')
      return this._updateHistory(nextState)
    }
    console.log('JUMP!')
    return this._awaitLocation(prev, 'jump prev')
      .then(() => this._forceGo(n))
      .then(() => this._awaitLocation(loc, 'jump loc'))
      .then(() => this._replace(nextState, nextState.location))
      .then(() => this._updateHistory(nextState))
  }

  _setState(nextState, n) {
    const prev = this.location
    const loc = nextState.entries[this.index + n]

    if (!n) {
      return this._replace(loc)
        .then(() => this._updateHistory(nextState))
    }
    console.log('SET STATE')
    return this._awaitLocation(prev)
      .then(() => this._forceGo(n))
      .then(() => this._awaitLocation(loc))
      .then(() => this._replace(loc))
      .then(() => this._forceGo(-n))
      .then(() => this._awaitLocation(prev))
      .then(() => this._updateHistory(nextState))
  }

  _reset(nextState) {
    const { index, entries } = nextState
    const lastIndex = entries.length - 1
    const stayAtEnd = index === lastIndex
    const prev = this.location
    const loc = this.entries[0]
    const n = -this.index // jump to beginning of entries stack

    return this._awaitLocation(prev)
      .then(() => this._forceGo(n))
      .then(() => this._awaitLocation(loc))
      .then(() => {
        this._replace(entries[0])
        entries.slice(1).forEach(e => this._push(e))

        if (!stayAtEnd) {
          this._forceGo(index - lastIndex)
        }

        this._updateHistory(nextState)
      })
  }

  _awaitLocation(loc, name) {
    return new Promise(resolve => {
      const { url } = loc
      const ready = () => {
        console.log('READY(desiredUrl, currentUrl)', url, createPath(window.location))
        return url === createPath(window.location)
      }

      return tryChange(ready, resolve, name)
    })
  }
}

// CHROME WORKAROUND:
// chrome doesn't like rapid back to back history changes, so we test the first
// change happened first, before executing the next

let tries = 0
const maxTries = 10
const queue = []

const tryChange = (ready, complete, name) => {
  if (tries === 0) rapidChangeWorkaround(ready, complete, name)
  else queue.push([ready, complete, name])
}

const rapidChangeWorkaround = (ready, complete, name) => {
  tries++

  if (!ready() && tries < maxTries) {
    console.log('tries', tries + 1, name)
    setTimeout(() => rapidChangeWorkaround(ready, complete, name), 9)
  }
  else {
    complete()
    tries = 0

    const [again, com, name] = queue.shift() || [] // try another if queue is full

    if (again) {
      rapidChangeWorkaround(again, com, name)
    }
  }
}
