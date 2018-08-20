// @flow
/* eslint-env browser */
import History from './History'
import { locationToUrl } from '../utils'
import {
  addPopListener,
  removePopListener,
  isExtraneousPopEvent,
  restoreHistory,
  saveHistory,
  pushState,
  replaceState,
} from './utils'
import type { Action, Dispatch } from '../flow-types'

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

  listen(dispatch: Dispatch, getLocation: Function) {
    if (!this.dispatch) {
      // we don't allow/need multiple listeners currently
      super.listen(dispatch, getLocation)
      this._addPopListener()
    }

    return () => this.unlisten()
  }

  unlisten() {
    this._removePopListener()
    super.unlisten()
  }

  _didPopForward(url: string) {
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
      } else if (url === this.url) {
        n = this.pendingPop * -1 // switch directions
        return this._forceGo(n * -1)
      } else {
        n = this.pendingPop
        return this._forceGo(n * -1)
      }

      let reverted = false

      const revertPop = () => {
        if (!reverted) this._forceGo(n * -1)
        reverted = true
      }

      // revertPop will be called if route change blocked by `core/compose.js` or used as
      // a flag by `this._jump` below to do nothing in the browser, since the user already
      // did it via browser back/next buttons
      this.currentPop = this.jump(n, false, n, null, true, revertPop) // `currentPop` used only by tests to await browser-initiated pops
    }

    const onPopState = (e) => !isExtraneousPopEvent(e) && handlePop() // ignore extraneous popstate events in WebKit
    const onHashChange = handlePop

    this._addPopListener = () => addPopListener(onPopState, onHashChange)
    this._removePopListener = () => removePopListener(onPopState, onHashChange)
  }

  _forceGo(n: number): Promise<void> {
    this._popForced = true
    window.history.go(n) // revert
    return Promise.resolve()
  }

  _push(action: Action, awaitUrl: string): Promise<any> {
    const { url } = action.location

    return this._awaitUrl(awaitUrl, '_push').then(() => pushState(url))
  }

  _replace(action: Action, awaitUrl: string, n?: number): Promise<any> {
    const { url } = action.location

    if (n) {
      this._forceGo(n)

      return this._awaitUrl(awaitUrl, '_replaceBackNext').then(() =>
        replaceState(url),
      )
    }

    if (this.location.kind === 'load') {
      awaitUrl = locationToUrl(window.location) // special case: redirects on load have no previous URL
    }

    return this._awaitUrl(awaitUrl, '_replace').then(() => replaceState(url))
  }

  _jump(
    action: Action,
    currUrl: string,
    oldUrl: string,
    n: number,
    isPop: boolean,
  ): void | Promise<any> {
    if (!n) {
      // possibly the user mathematically calculated a jump of `0`
      return this._replace(action, currUrl)
    }

    if (isPop) return // pop already handled by browser back/next buttons and real history state is already up to date

    return this._awaitUrl(currUrl, 'jump prev')
      .then(() => this._forceGo(n))
      .then(() => this._awaitUrl(oldUrl, 'jump loc'))
      .then(() => this._replace(action, oldUrl))
  }

  _set(action: Action, oldUrl: string, n: number): Promise<any> {
    if (!n) {
      return this._replace(action, oldUrl)
    }

    const { index, entries } = action.location
    const changedAction = entries[index + n]

    return this._awaitUrl(action, '_setN start')
      .then(() => this._forceGo(n))
      .then(() => this._awaitUrl(oldUrl, '_setN before replace'))
      .then(() => this._replace(changedAction, oldUrl))
      .then(() => this._forceGo(-n))
      .then(() => this._awaitUrl(action, 'setN return'))
  }

  _reset(
    action: Action,
    oldUrl: string,
    oldFirstUrl: string,
    reverseN: number,
  ): Promise<any> {
    const { index, entries } = action.location
    const lastIndex = entries.length - 1
    const reverseDeltaToIndex = index - lastIndex
    const indexUrl = entries[index].location.url

    return this._awaitUrl(oldUrl, 'reset oldUrl')
      .then(() => this._forceGo(reverseN))
      .then(() => this._awaitUrl(oldFirstUrl, 'reset oldFirstUrl'))
      .then(() => {
        replaceState(entries[0].location.url) // we always insure resets have at least 2 entries, and the first can only operate via `replaceState`
        entries.slice(1).forEach((e) => pushState(e.location.url)) // we have to push at least one entry to erase the old entries in the real browser history

        if (reverseDeltaToIndex) {
          return this._forceGo(reverseDeltaToIndex).then(() =>
            this._awaitUrl(indexUrl, 'resetIndex _forceGo'),
          )
        }
      })
  }

  _awaitUrl(actOrUrl: string | Object, name: string): Promise<any> {
    return new Promise((resolve) => {
      const url =
        typeof actOrUrl === 'string' ? actOrUrl : actOrUrl.location.url
      const ready = () => {
        console.log('ready', url, locationToUrl(window.location))
        return url === locationToUrl(window.location)
      }
      return tryChange(ready, resolve, name, this) // TODO: is the this supposed to be there, its one extra param over
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
  } else {
    if (process.env.NODE_ENV === 'test' && !ready()) {
      throw new Error(
        'BrowserHistory.rapidChangeWorkAround failed to be "ready"',
      )
    }

    complete()
    tries = 0

    const [again, com, name] = queue.shift() || [] // try another if queue is full

    if (again) {
      rapidChangeWorkaround(again, com, name)
    }
  }
}
