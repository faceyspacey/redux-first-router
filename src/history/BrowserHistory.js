import History from './History'
import { locationToUrl } from '../utils'
import {
  addPopListener,
  removePopListener,
  isExtraneousPopEvent,
  restoreHistory,
  saveHistory,
  pushState,
  replaceState
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
  _restore() {
    this.options.restore = this.options.restore || restoreHistory
    this.options.save = this.options.save || saveHistory

    this._setupPopHandling()

    return this.options.restore(this)
  }

  listen(dispatch, getLocation) {
    if (!this.dispatch) { // we don't allow/need multiple listeners currently
      super.listen(dispatch, getLocation)
      this._addPopListener()
    }

    return () => this.unlisten()
  }

  unlisten() {
    this._removePopListener()
    super.unlisten()
  }

  _didPopForward(url) {
    const e = this.entries[this.index + 1]
    return e && e.location.url === url
  }

  _setupPopHandling() {
    const handlePop = () => {
      if (this._popForced) return (this._popForced = false)

      const { pathname, search, hash } = window.location
      const url = pathname + search + hash

      let n

      if (!this.pendingPop) {
        n = this._didPopForward(url) ? 1 : -1
        this.pendingPop = n
      }
      else if (url === this.url) {
        n = this.pendingPop * -1 // switch directions
        return this._forceGo(n * -1)
      }
      else {
        n = this.pendingPop
        return this._forceGo(n * -1)
      }

      const kind = n === -1 ? 'back' : 'next'

      let reverted = false
      const revertPop = () => {
        if (!reverted) this._forceGo(n * -1)
        reverted = true
      }

      // revertPop will be called if route change blocked by `core/compose.js` or used as
      // a flag by `this._jump` below to do nothing in the browser, since the user already
      // did it via browser back/next buttons
      this.currentPop = this.jump(n, null, false, kind, true, revertPop) // `currentPop` used only by tests to await browser-initiated pops
    }

    const onPopState = e => !isExtraneousPopEvent(e) && handlePop() // ignore extraneous popstate events in WebKit
    const onHashChange = handlePop

    this._addPopListener = () => addPopListener(onPopState, onHashChange)
    this._removePopListener = () => removePopListener(onPopState, onHashChange)
  }

  _forceGo(n) {
    this._popForced = true
    window.history.go(n) // revert
  }

  _push(action) {
    const { url } = action.location

    return this._awaitUrl(this.prevUrl, '_push')
      .then(() => pushState(url))
  }

  _replace(action, awaitUrl, n) {
    const { url } = action.location

    if (n) {
      this._forceGo(n)

      return this._awaitUrl(awaitUrl, '_replaceBackNext')
        .then(() => replaceState(url))
    }

    return this._awaitUrl(awaitUrl || this.prevUrl, '_replace')
      .then(() => replaceState(url))
  }

  _jump(action, n, isPop) {
    const { prevUrl } = this

    if (!n) { // possibly the user mathematically calculated a jump of `0`
      return this._replace(action)
    }

    if (isPop) return // pop already handled by browser back/next buttons and real history state is already up to date

    return this._awaitUrl(prevUrl, 'jump prev')
      .then(() => this._forceGo(n))
      .then(() => this._awaitUrl(action, 'jump loc'))
      .then(() => this._replace(action, action))
  }

  _set(action, currUrl, n) {
    if (!n) {
      return this._replace(action, currUrl)
    }

    return this._awaitUrl(action, '_setN start')
      .then(() => this._forceGo(n))
      .then(() => this._awaitUrl(currUrl, '_setN before replace'))
      .then(() => this._replace(action))
      .then(() => this._forceGo(-n))
      .then(() => this._awaitUrl(action, 'setN return'))
  }

  _reset(action) {
    const { index, entries } = action.location
    const { prevUrl } = this
    const lastIndex = entries.length - 1
    const stayAtEnd = index === lastIndex
    const act = this.entries[0]
    const n = -this.index // jump to beginning of entries stack

    return this._awaitUrl(prevUrl)
      .then(() => this._forceGo(n))
      .then(() => this._awaitUrl(act))
      .then(() => {
        this._replace(entries[0])
        entries.slice(1).forEach(e => this._push(e))

        if (!stayAtEnd) {
          this._forceGo(index - lastIndex)
        }
      })
  }

  _awaitUrl(actOrUrl, name) {
    return new Promise(resolve => {
      const url = typeof actOrUrl === 'string' ? actOrUrl : actOrUrl.location.url
      const ready = () => {
        console.log('ready', url, locationToUrl(window.location))
        return url === locationToUrl(window.location)
      }
      return tryChange(ready, resolve, name, this)
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
    if (process.env.NODE_ENV === 'test' && !ready()) {
      throw new Error('BrowserHistory.rapidChangeWorkAround failed to be "ready"')
    }

    complete()
    tries = 0

    const [again, com, name] = queue.shift() || [] // try another if queue is full

    if (again) {
      rapidChangeWorkaround(again, com, name)
    }
  }
}

