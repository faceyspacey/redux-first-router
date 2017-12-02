import BrowserHistory from './BrowserHistory'
import MemoryHistory from './MemoryHistory'

import {
  supportsHistory,
  canUseDOM,
  hasSessionStorage,
  createPath
} from './utils'

export default opts => {
  if (process.env.NODE_ENV === 'test' || !canUseDOM) {
    return new MemoryHistory(opts)
  }

  if (supportsHistory()) {
    return new BrowserHistory(opts)
  }

  opts.useSessionStorage = hasSessionStorage() // give MemoryHistory browser fallback a chance to remember entries through sessionStorage
  opts.initialEntries = [createPath(window.location)]

  return new MemoryHistory(opts)
}
