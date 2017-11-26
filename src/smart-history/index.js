import { hasSessionStorage } from './utils/sessionStorage'
import BrowserHistory from './history/BrowserHistory'
import MemoryHistory from './history/MemoryHistory'
import { supportsHistory, canUseDOM } from './utils/dom'
import { createPath } from './utils/path'

export default opts => {
  if (process.env.NODE_ENV === 'test' || !canUseDOM) {
    return new MemoryHistory(opts)
  }

  const hasBrowserHistory = supportsHistory()
  const useSessionStorage = hasSessionStorage()
  const hasStorage = useSessionStorage || opts.useHistoryStorageFallback

  if (hasBrowserHistory && hasStorage) {
    return new BrowserHistory(opts)
  }

  // `opts.forceRefresh` is in fact only used as a fallback for browsers that:
  // A) don't have sessionStorage
  // B) don't want to use our "history-storage" solution
  // C) don't have browser history
  //
  // The way memoryHistory works is this:
  // 1) we detect if their is a support for history
  // 2) if so, do `replaceState` instead (we only reach here because the session storage solution available is not satisfactory)
  // 3) force a refresh as the final fallback (we reach here because we have no storage solution AND no history)
  opts.hasBrowserHistory = hasBrowserHistory
  opts.useSessionStorage = useSessionStorage
  opts.initialEntries = [createPath(window.location)]

  return new MemoryHistory(opts)
}
